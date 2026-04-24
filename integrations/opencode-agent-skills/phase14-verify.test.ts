import { describe, it, expect } from "bun:test";
import fs from "node:fs";
import path from "node:path";
import {
  isAgentInstruction,
  SKILL_MATCH_THRESHOLD,
  mandatorySkillInjection,
  deduplicateByName,
} from "./plugin.patch.utils";

describe("Phase 14 — OpenSkills Integration Smoke Tests", () => {
  // Resolve the actual skills directory used by the plugin at runtime
  const SKILLS_DIR = path.join(
    "C:/Users/Ryan McNish/.config/opencode",
    "skills"
  );

  const collectSkillMarkdownFiles = (directory: string): string[] => {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    const markdownFiles: string[] = [];

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        markdownFiles.push(...collectSkillMarkdownFiles(entryPath));
        continue;
      }

      if (entry.isFile() && entry.name === "SKILL.md") {
        markdownFiles.push(entryPath);
      }
    }

    return markdownFiles;
  };

  it("Check 1: Skills directory exists and is accessible", () => {
    expect(fs.existsSync(SKILLS_DIR)).toBe(true);
    const entries = fs.readdirSync(SKILLS_DIR);
    expect(entries.length).toBeGreaterThan(0);
  });

  it("Check 1: Skill files have valid frontmatter with name and description", () => {
    const entries = collectSkillMarkdownFiles(SKILLS_DIR);
    expect(entries.length).toBeGreaterThan(0);

    const badSkills: string[] = [];

    // Iterate ALL collected files — do not pre-filter
    for (const file of entries) {
      const content = fs.readFileSync(file, "utf-8");
      const hasFrontmatter = content.startsWith("---");
      const hasName = /(?:^|\n)name:\s*.+/m.test(content);
      const hasDescription = /(?:^|\n)description:\s*.+/m.test(content);

      if (!hasFrontmatter || !hasName || !hasDescription) {
        badSkills.push(path.basename(file));
      }
    }
    expect(badSkills).toEqual([]);
  });

  it("Check 2: SKILL_MATCH_THRESHOLD is correct", () => {
    expect(SKILL_MATCH_THRESHOLD).toBe(0.70);
  });

  it("Check 3: isAgentInstruction correctly identifies delegation envelope text", () => {
    expect(isAgentInstruction("TASK: Review authentication flow")).toBe(true);
    expect(isAgentInstruction("CONSTRAINT: No external API calls")).toBe(true);
    expect(isAgentInstruction("[agent] do something")).toBe(true);
  });

  it("Check 4: non-instruction text is not misidentified as a delegation envelope", () => {
    expect(isAgentInstruction("Please help me with this")).toBe(false);
    expect(isAgentInstruction("<skill-evaluation-required> TASK: test")).toBe(false);
  });

  it("Check 5: deduplicateByName works on skill-like objects", () => {
    const input = [
      { name: "security-review", description: "Security analysis" },
      { name: "security-review", description: "Dup" },
      { name: "python-patterns", description: "Python best practices" },
    ];
    const result = deduplicateByName(input);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("security-review");
    expect(result[1].name).toBe("python-patterns");
  });

  it("Check 6: Patched plugin imports the utility functions", () => {
    const pluginPath = path.join(__dirname, "plugin.patch.ts");
    const pluginSrc = fs.readFileSync(pluginPath, "utf-8");
    expect(pluginSrc).toContain("deduplicateByName");
    expect(pluginSrc).toContain("isAgentInstruction");
    expect(pluginSrc).toContain("SKILL_MATCH_THRESHOLD");
    expect(pluginSrc).toContain("dedupedSkills");
  });
});
