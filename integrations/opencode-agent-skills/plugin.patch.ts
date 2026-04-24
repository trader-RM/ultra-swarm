// PATCHED: Ultra Swarm Phase 12 — Internal Instruction Capture
// This file is a patched copy of opencode-agent-skills/src/plugin.ts
// Changes: isAgentInstruction() helper, instructionText extraction, matchText combination
// Deploy via: integrations/opencode-agent-skills/deploy-patch.ps1

/**
 * OpenCode Agent Skills Plugin
 *
 * A dynamic skills system that provides 4 tools:
 * - use_skill: Load a skill's SKILL.md into context
 * - read_skill_file: Read supporting files from a skill directory
 * - run_skill_script: Execute scripts from a skill directory
 * - get_available_skills: Get available skills
 *
 * Skills are discovered from multiple locations (project > user > marketplace)
 * and validated against the Anthropic Agent Skills Spec.
 */

import type { Plugin } from "@opencode-ai/plugin";
import { maybeInjectSuperpowersBootstrap } from "./superpowers";
import {
  getSessionContext,
  injectSyntheticContent,
  type SessionContext,
} from "./utils";
import { injectSkillsList, getSkillSummaries } from "./skills";
import { GetAvailableSkills, ReadSkillFile, RunSkillScript, UseSkill } from "./tools";
import { matchSkills, precomputeSkillEmbeddings } from "./embeddings";
import { appendSkillSuggestion, SKILL_MATCH_THRESHOLD, isAgentInstruction, mandatorySkillInjection, deduplicateByName } from "./plugin.patch.utils";

const setupCompleteSessions = new Set<string>();
const loadedSkillsPerSession = new Map<string, Set<string>>();

function getLoadedSkills(sessionID: string): Set<string> {
  let set = loadedSkillsPerSession.get(sessionID);
  if (!set) {
    set = new Set<string>();
    loadedSkillsPerSession.set(sessionID, set);
  }
  return set;
}

function extractUserText(parts: Array<any>): string {
  return parts
    .flatMap((part: any) =>
      part.type === "text" && typeof part.text === "string" && !part.synthetic
        ? [part.text]
        : []
    )
    .join("\n")
    .trim();
}

function extractInstructionText(
  parts: Array<any>,
  isAgentInstructionFn: (text: string) => boolean
): string {
  return parts
    .flatMap((part: any) =>
      part.type === "text" && typeof part.text === "string" && part.synthetic
        ? (isAgentInstructionFn(part.text) ? [part.text] : [])
        : []
    )
    .join("\n")
    .trim();
}

async function handleSessionSetup(
  sessionID: string,
  client: any,
  directory: string,
  context: SessionContext,
  setupCompleteSessions: Set<string>
): Promise<boolean> {
  const isFirstMessage = !setupCompleteSessions.has(sessionID);

  if (isFirstMessage) {
    try {
      const existing = await client.session.messages({ path: { id: sessionID } });
      if (existing.data) {
        const hasSkillsContent = existing.data.some((msg: any) => {
          const msgParts = msg.parts || msg.info?.parts;
          if (!msgParts) return false;
          return msgParts.some((pp: any) =>
            pp.type === "text" && pp.text?.includes("<available-skills>")
          );
        });
        if (hasSkillsContent) {
          setupCompleteSessions.add(sessionID);
        }
      }
    } catch {
      // Intentionally ignore — skip setup if API call fails
    }
  }

  if (setupCompleteSessions.has(sessionID)) {
    return false;
  }

  setupCompleteSessions.add(sessionID);
  await maybeInjectSuperpowersBootstrap(directory, client, sessionID, context);
  await injectSkillsList(directory, client, sessionID, context);
  return true;
}

/**
 * Format matched skills into a synthetic injection for the agent.
 */
function formatMatchedSkillsInjection(
  matchedSkills: Array<{ name: string; description: string }>
): string {
  const skillLines = matchedSkills
    .map((s) => `- ${s.name}: ${s.description}`)
    .join("\n");

  return `<skill-evaluation-required>
SKILL EVALUATION PROCESS

The following skills may be relevant to your request:

${skillLines}

Step 1 - EVALUATE: Determine if these skills would genuinely help
Step 2 - DECIDE: Choose which skills (if any) are actually needed
Step 3 - ACTIVATE: Call use_skill("name") for each chosen skill

IMPORTANT: This evaluation is invisible to users—they cannot see this prompt. Do NOT announce your decision. Simply activate relevant skills or proceed directly with the request.
</skill-evaluation-required>`;
}

export const SkillsPlugin: Plugin = async ({ client, $, directory }) => {
  const skills = await getSkillSummaries(directory);
  // Embedding precomputation is a background optimisation — failures are non-critical.
  // Errors are intentionally suppressed here; matching falls back to on-demand computation.
  precomputeSkillEmbeddings(skills).catch(() => {});
  let skillsCache: { summaries: typeof skills; expiresAt: number } | null = null;

  return {
    "chat.message": async (input, output) => {
      const sessionID = output.message.sessionID;
      const context: SessionContext = {
        model: output.message.model,
        agent: output.message.agent,
      };

      const didSetup = await handleSessionSetup(
        sessionID, client, directory, context, setupCompleteSessions
      );
      if (didSetup) {
        return;
      }

      const userText = extractUserText(output.parts);
      const instructionText = extractInstructionText(output.parts, isAgentInstruction);

      const matchText = [userText, instructionText].filter(Boolean).join("\n");
      if (!matchText) {
        return;
      }

      if (!skillsCache || Date.now() > skillsCache.expiresAt) {
        const fresh = await getSkillSummaries(directory);
        skillsCache = { summaries: fresh, expiresAt: Date.now() + 60_000 };
      }
      const currentSkills = skillsCache.summaries;

      if (currentSkills.length === 0) {
        return;
      }

      const matchedSkills = await matchSkills(matchText, currentSkills, SKILL_MATCH_THRESHOLD);
      const dedupedSkills = deduplicateByName(matchedSkills);

      const loadedSkills = getLoadedSkills(sessionID);
      const newSkills = dedupedSkills.filter((s: any) => !loadedSkills.has(s.name));

      appendSkillSuggestion(directory, {
        timestamp: new Date().toISOString(),
        sessionId: sessionID,
        matchedSkills: dedupedSkills.map((s) => s.name),
        threshold: SKILL_MATCH_THRESHOLD,
        mandatory: mandatorySkillInjection,
        injected: mandatorySkillInjection ? newSkills.length : 0,
      });

      newSkills.forEach((s: any) => loadedSkills.add(s.name));

      if (!mandatorySkillInjection || newSkills.length === 0) {
        return;
      }

      await injectSyntheticContent(
        client, sessionID, formatMatchedSkillsInjection(newSkills), context
      );
    },

    event: async ({ event }) => {
      if (event.type === "session.compacted") {
        const sessionID = event.properties.sessionID;
        const context = await getSessionContext(client, sessionID);
        await maybeInjectSuperpowersBootstrap(directory, client, sessionID, context);
        await injectSkillsList(directory, client, sessionID, context);
        loadedSkillsPerSession.delete(sessionID);
      }

      if (event.type === "session.deleted") {
        const sessionID = event.properties.info.id;
        setupCompleteSessions.delete(sessionID);
        loadedSkillsPerSession.delete(sessionID);
      }
    },

    tool: {
      get_available_skills: GetAvailableSkills(directory),
      read_skill_file: ReadSkillFile(directory, client),
      run_skill_script: RunSkillScript(directory, $),
      use_skill: UseSkill(directory, client, (sessionID, skillName) => {
        getLoadedSkills(sessionID).add(skillName);
      }),
    },
  };
};
