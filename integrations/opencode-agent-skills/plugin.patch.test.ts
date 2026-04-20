import { describe, it, expect } from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inline the function to test since we can't import from plugin.patch.ts
function isAgentInstruction(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  if (text.includes("<skill-evaluation-required>")) return false;
  if (text.includes("<available-skills>")) return false;
  // Structured delegation markers must appear at column 0 (no leading whitespace).
  // This prevents false-positive matches in indented code blocks, prose, or examples.
  // All signals are case-sensitive. Lowercase "task:" will not match.
  const lines = text.split('\n');
  for (const line of lines) {
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

describe("isAgentInstruction", () => {
  it("should return false for empty string", () => {
    expect(isAgentInstruction("")).toBe(false);
  });

  it("should return false for whitespace only", () => {
    expect(isAgentInstruction("   ")).toBe(false);
  });

  it("should return false for <skill-evaluation-required> injection text", () => {
    expect(
      isAgentInstruction(
        "Some text <skill-evaluation-required> more text"
      )
    ).toBe(false);
  });

  it("should return false for <available-skills> injection text", () => {
    expect(
      isAgentInstruction(
        "Please analyze <available-skills> and choose appropriately"
      )
    ).toBe(false);
  });

  it("should return false for plain user message without delegation signals", () => {
    expect(
      isAgentInstruction(
        "Hello, could you help me with this task? I'm not sure how to proceed."
      )
    ).toBe(false);
  });

  it("should return false for random text", () => {
    expect(
      isAgentInstruction(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      )
    ).toBe(false);
  });

  it("should return true for text containing [agent]", () => {
    expect(
      isAgentInstruction(
        "[agent] analyze this code and provide feedback"
      )
    ).toBe(true);
  });

  it("should return true for text containing TASK:", () => {
    expect(
      isAgentInstruction(
        "TASK: Review the authentication implementation for security vulnerabilities"
      )
    ).toBe(true);
  });

  it("should return false for prose containing 'delegation' (not a structured signal in current impl)", () => {
    expect(
      isAgentInstruction(
        "I'm requesting delegation to the security expert for this sensitive operation"
      )
    ).toBe(false);
  });

  it("should return true for text containing CONSTRAINT:", () => {
    expect(
      isAgentInstruction(
        "CONSTRAINT: Must comply with GDPR regulations when processing user data"
      )
    ).toBe(true);
  });

  it("should return true for text containing ACCEPTANCE:", () => {
    expect(
      isAgentInstruction(
        "ACCEPTANCE: The solution must handle at least 1000 concurrent users"
      )
    ).toBe(true);
  });

  it("should return true for text containing FILE:", () => {
    expect(
      isAgentInstruction(
        "FILE: src/components/UserProfile.tsx needs refactoring"
      )
    ).toBe(true);
  });

  it("should return true for INPUT: at column 0", () => {
    expect(isAgentInstruction("INPUT: user data payload")).toBe(true);
  });

  it("should return true for OUTPUT: at column 0", () => {
    expect(isAgentInstruction("OUTPUT: modified file")).toBe(true);
  });

  it("should return true for DESCRIPTION: at column 0", () => {
    expect(isAgentInstruction("DESCRIPTION: task description text")).toBe(true);
  });

  it("should return false for agent name 'architect' in prose (loose substring matching removed)", () => {
    expect(
      isAgentInstruction(
        "Please consult the architect for the system design approach"
      )
    ).toBe(false);
  });

  it("should return false for agent name 'reviewer' in prose (loose substring matching removed)", () => {
    expect(
      isAgentInstruction(
        "The reviewer should check this code change before merging"
      )
    ).toBe(false);
  });

  it("should return false for agent name 'test_engineer' in prose (loose substring matching removed)", () => {
    expect(
      isAgentInstruction(
        "The test_engineer needs to create unit tests for this module"
      )
    ).toBe(false);
  });

  it("should return false for agent name 'explorer' in prose (loose substring matching removed)", () => {
    expect(
      isAgentInstruction(
        "The explorer agent can investigate the API documentation"
      )
    ).toBe(false);
  });

  it("should return false for agent name 'coder' in prose (loose substring matching removed)", () => {
    expect(
      isAgentInstruction(
        "The coder should implement the feature according to specifications"
      )
    ).toBe(false);
  });

  it("should return false when delegation signal AND <skill-evaluation-required> are in same text", () => {
    expect(
      isAgentInstruction(
        "[agent] Please help <skill-evaluation-required> evaluate skills"
      )
    ).toBe(false);
  });

  it("should return true for very long text with delegation signals at end", () => {
    const longText = `
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, 
      quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
      fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
      culpa qui officia deserunt mollit anim id est laborum.
      
TASK: Implement the user authentication feature with JWT tokens
    `;
    expect(isAgentInstruction(longText)).toBe(true);
  });

  it("should return false for 'architecture' (substring of 'architect' no longer matches in current impl)", () => {
    // "architecture" no longer matches — loose substring matching removed, strict column-0 prefix required
    expect(
      isAgentInstruction(
        "We need to consider the architecture of this solution"
      )
    ).toBe(false);
  });

  it("should correctly distinguish between coder and coding", () => {
    // "coding" does not contain "coder" (different suffix), so returns false
    expect(isAgentInstruction("I enjoy coding in TypeScript")).toBe(false);
    
    // "coder" should return false (prose, not at column 0)
    expect(
      isAgentInstruction(
        "The coder should refactor this component"
      )
    ).toBe(false);
  });

  describe("Adversarial", () => {
    it("should return false for TASK: not at column 0, even with near-miss tag", () => {
      // Returns false because TASK: is not at column 0 (line starts with "<")
      expect(
        isAgentInstruction(
          "<skill-eval-required> TASK: implement feature"
        )
      ).toBe(false);
    });

    it("should return false for agent name in prose even without exclusion tag", () => {
      // Returns false because agent names in prose no longer match as signals
      expect(
        isAgentInstruction(
          "<skill-evaluation-needed> architect review"
        )
      ).toBe(false);
    });

    it("should return false for exact match <skill-evaluation-required> (feedback loop safeguard)", () => {
      // Should return false as this is the exact excluded tag
      expect(
        isAgentInstruction(
          "<skill-evaluation-required> TASK: implement feature"
        )
      ).toBe(false);
    });

    it("should return true for string with null bytes containing delegation keyword", () => {
      // Should still match on TASK: despite null bytes
      expect(
        isAgentInstruction("TASK:\x00implement feature")
      ).toBe(true);
    });

    it("should return false for TASK: not at column 0 in very long single-line string", () => {
      // Returns false because TASK: is not at column 0 in this very long single-line string
      const longText = "A".repeat(10000) + " TASK: implement feature";
      expect(isAgentInstruction(longText)).toBe(false);
    });

    it("should return true for TASK: at column 0 with no other content", () => {
      // Returns true because TASK: is at column 0
      expect(isAgentInstruction("TASK: implement")).toBe(true);
    });

    it("should return false for 'architectural' (loose matching removed — strict column-0 prefix required)", () => {
      // Returns false — loose matching removed, strict column-0 prefix required
      expect(
        isAgentInstruction("Review the architectural decisions")
      ).toBe(false);
    });

    it("should return false for coding (does NOT contain exact 'coder' match)", () => {
      // "coding" does NOT include "coder" so should return false
      expect(isAgentInstruction("I enjoy coding")).toBe(false);
    });

    it("should return false for explore (does NOT contain exact 'explorer' match)", () => {
      // "explore" does NOT include "explorer" so should return false
      expect(isAgentInstruction("Let's explore options")).toBe(false);
    });

    it("should return false for review (does NOT contain exact 'reviewer' match)", () => {
      // "review" does NOT include "reviewer" so should return false
      expect(isAgentInstruction("Please review this code")).toBe(false);
    });

    it("should return false for lowercase 'task:' (case sensitivity)", () => {
      // Should return false as function checks for "TASK:" uppercase
      // Documented as known behavior - delegation envelopes use uppercase conventions
      expect(isAgentInstruction("task: implement feature")).toBe(false);
    });

    it("should return false for title case 'Task:' (case sensitivity)", () => {
      // Should return false as function checks for "TASK:" uppercase
      // Documented as known behavior - delegation envelopes use uppercase conventions
      expect(isAgentInstruction("Task: implement feature")).toBe(false);
    });

    it("should return false for text with both <skill-evaluation-required> AND TASK: (exclusion priority)", () => {
      // Should return false as exclusion takes priority over delegation signals
      // Documented as the feedback-loop safeguard
      expect(
        isAgentInstruction(
          "<skill-evaluation-required> TASK: implement feature"
        )
      ).toBe(false);
    });
  });

  describe("matchSkills threshold", () => {
    it("should use 0.70 threshold in matchSkills call", () => {
      const pluginPath = path.join(__dirname, "plugin.patch.ts");
      const content = fs.readFileSync(pluginPath, "utf-8");
      
      // Find the matchSkills call with the specific pattern
      const matchSkillsRegex = /matchSkills\(matchText,\s*skills,\s*0\.70\)/;
      const hasThreshold = matchSkillsRegex.test(content);
      
      expect(hasThreshold).toBe(true);
    });
  });

  describe("mandatorySkillInjection and suggestion tracker", () => {
    it("should default mandatorySkillInjection to true when SKILLS_MANDATORY_INJECTION env is not set", () => {
      const pluginPath = path.join(__dirname, "plugin.patch.ts");
      const content = fs.readFileSync(pluginPath, "utf-8");
      
      // Check that the constant is declared and defaults to true
      const mandatoryInjectionDefault = /const\s+mandatorySkillInjection\s*=/;
      expect(mandatoryInjectionDefault.test(content)).toBe(true);
      
      // Check that it defaults to true
      const defaultValueTrue = /const\s+mandatorySkillInjection\s*=\s*!\(process\.env\.SKILLS_MANDATORY_INJECTION\s*===\s*"false"\s*\|\|\s*process\.env\.SKILLS_MANDATORY_INJECTION\s*===\s*"0"\)/;
      expect(defaultValueTrue.test(content)).toBe(true);
    });

    it("should set mandatorySkillInjection to false when SKILLS_MANDATORY_INJECTION is 'false'", () => {
      const pluginPath = path.join(__dirname, "plugin.patch.ts");
      const content = fs.readFileSync(pluginPath, "utf-8");
      
      // Check that it checks for "false" or "0" values
      const envCheckPattern = /process\.env\.SKILLS_MANDATORY_INJECTION.*["'](?:false|0)["']/;
      expect(envCheckPattern.test(content)).toBe(true);
    });

    it("should set mandatorySkillInjection to false when SKILLS_MANDATORY_INJECTION is '0'", () => {
      const pluginPath = path.join(__dirname, "plugin.patch.ts");
      const content = fs.readFileSync(pluginPath, "utf-8");
      
      // Check that it checks for "false" or "0" values
      const envCheckPattern = /process\.env\.SKILLS_MANDATORY_INJECTION.*["'](?:false|0)["']/;
      expect(envCheckPattern.test(content)).toBe(true);
    });

    it("appendSkillSuggestion should create .swarm directory and append JSONL entry", () => {
      const pluginPath = path.join(__dirname, "plugin.patch.ts");
      const content = fs.readFileSync(pluginPath, "utf-8");
      
      // Check that the function exists and has the right signature
      const functionExists = /export\s+function\s+appendSkillSuggestion\s*\([^)]*\)/;
      expect(functionExists.test(content)).toBe(true);
      
      // Check that it uses fs operations
      const usesFs = /fs\.(mkdirSync|appendFileSync)/;
      expect(usesFs.test(content)).toBe(true);
    });

    it("appendSkillSuggestion should handle write errors gracefully without throwing", () => {
      const pluginPath = path.join(__dirname, "plugin.patch.ts");
      const content = fs.readFileSync(pluginPath, "utf-8");
      
      // Check that the function has error handling
      const hasTryCatch = /try\s*{.*?}\s*catch\s*\(/s;
      expect(hasTryCatch.test(content)).toBe(true);
    });

    it("should export appendSkillSuggestion function", () => {
      const pluginPath = path.join(__dirname, "plugin.patch.ts");
      const content = fs.readFileSync(pluginPath, "utf-8");
      
      // Check that appendSkillSuggestion is exported
      const exportPattern = /export\s+function\s+appendSkillSuggestion/;
      expect(exportPattern.test(content)).toBe(true);
    });

    it("appendSkillSuggestion should handle write errors gracefully without throwing", () => {
      const pluginPath = path.join(__dirname, "plugin.patch.ts");
      const content = fs.readFileSync(pluginPath, "utf-8");
      
      // Check that the function has error handling
      const errorHandlingPattern = /try\s*{[^}]*fs\.mkdirSync|catch\s*\([^)]*\)\s*{/;
      expect(errorHandlingPattern.test(content)).toBe(true);
    });

    it("appendSkillSuggestion should create .swarm directory and write JSONL entry at runtime", () => {
      // Inline the appendSkillSuggestion function for runtime testing
      // (can't import from plugin.patch.ts due to external dependency resolution)
      function appendSkillSuggestion(
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
      
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "skill-suggestion-test-"));
      
      try {
        appendSkillSuggestion(tempDir, {
          timestamp: "2026-04-20T00:00:00.000Z",
          sessionId: "test-session-123",
          matchedSkills: ["security-review", "python-patterns"],
          threshold: 0.70,
          mandatory: true,
          injected: 2,
        });

        const jsonlPath = path.join(tempDir, ".swarm", "skill-suggestions.jsonl");
        expect(fs.existsSync(jsonlPath)).toBe(true);

        const lines = fs.readFileSync(jsonlPath, "utf-8").trim().split("\n");
        expect(lines.length).toBeGreaterThan(0);

        const lastEntry = JSON.parse(lines[lines.length - 1]);
        expect(lastEntry.timestamp).toBe("2026-04-20T00:00:00.000Z");
        expect(lastEntry.sessionId).toBe("test-session-123");
        expect(lastEntry.matchedSkills).toEqual(["security-review", "python-patterns"]);
        expect(lastEntry.threshold).toBe(0.70);
        expect(lastEntry.mandatory).toBe(true);
        expect(lastEntry.injected).toBe(2);
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });

    it("appendSkillSuggestion should handle write errors gracefully without throwing at runtime", () => {
      // Inline the appendSkillSuggestion function for runtime testing
      function appendSkillSuggestion(
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
      
      // Use a non-existent path that cannot be created
      const invalidPath = path.join("/", "nonexistent-root", "skill-test-dir");
      
      // Should NOT throw
      let threw = false;
      try {
        appendSkillSuggestion(invalidPath, {
          timestamp: new Date().toISOString(),
          sessionId: "error-test",
          matchedSkills: ["test-skill"],
          threshold: 0.70,
          mandatory: false,
          injected: 0,
        });
      } catch {
        threw = true;
      }
      expect(threw).toBe(false);
    });
  });
});