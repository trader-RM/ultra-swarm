import fs from "node:fs";
import path from "node:path";

export const SKILL_MATCH_THRESHOLD = 0.70;

/**
 * Identify synthetic parts that contain agent-to-agent instruction text.
 * Uses strict prefix matching to avoid false positives from loose keyword matching.
 * Excludes the plugin's own <skill-evaluation-required> injections to prevent
 * feedback loops (re-matching our own matched skills would be circular).
 */
export function isAgentInstruction(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  // Exclude the plugin's own skill evaluation injections
  if (text.includes("<skill-evaluation-required>")) return false;
  if (text.includes("<available-skills>")) return false;
  // Require explicit delegation markers at RAW line start (no trim)
  // This prevents matching indented code blocks, quoted examples, or prose
  const lines = text.split('\n');
  for (const line of lines) {
    // Must start at column 0 - no leading whitespace
    if (
      line.startsWith("[agent]") ||
      line.startsWith("TASK:") ||
      line.startsWith("CONSTRAINT:") ||
      line.startsWith("ACCEPTANCE:") ||
      line.startsWith("FILE:") ||
      line.startsWith("INPUT:") ||
      line.startsWith("OUTPUT:") ||
      line.startsWith("DESCRIPTION:")
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Mandatory skill injection configuration.
 * When false, matched skills are tracked but not injected.
 */
export const mandatorySkillInjection =
  !(process.env.SKILLS_MANDATORY_INJECTION === "false" || process.env.SKILLS_MANDATORY_INJECTION === "0");

/**
 * Append a skill suggestion entry to the tracking file
 * @param baseDir The base directory where .swarm/ should be created
 * @param entry The suggestion entry to append
 */
export function appendSkillSuggestion(
  baseDir: string,
  entry: {
    timestamp: string;
    sessionId: string;
    matchedSkills: string[];
    threshold: number;
    mandatory: boolean;
    injected: number;
  }
): void {
  try {
    const swarmDir = path.join(baseDir, ".swarm");
    fs.mkdirSync(swarmDir, { recursive: true });
    const filePath = path.join(swarmDir, "skill-suggestions.jsonl");
    fs.appendFileSync(filePath, JSON.stringify(entry) + "\n");
  } catch (error) {
    console.warn("Failed to append skill suggestion to tracker:", error);
  }
}

/**
 * Deduplicate skill match results by name, keeping the first occurrence of each name.
 * Prevents double injection when userText and instructionText both signal the same skill.
 */
export function deduplicateByName<T extends { name: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.name)) return false;
    seen.add(item.name);
    return true;
  });
}
