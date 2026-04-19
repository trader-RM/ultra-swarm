import { describe, it, expect } from "bun:test";

// Inline the function to test since we can't import from plugin.patch.ts
function isAgentInstruction(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  // Exclude the plugin's own skill evaluation injections
  if (text.includes("<skill-evaluation-required>")) return false;
  if (text.includes("<available-skills>")) return false;
  // Agent delegation instructions contain structured delegation context
  // (task specs, agent names, delegation envelopes, constraints)
  const hasDelegationSignal =
    text.includes("[agent]") ||
    text.includes("TASK:") ||
    text.includes("delegation") ||
    text.includes("CONSTRAINT:") ||
    text.includes("ACCEPTANCE:") ||
    text.includes("FILE:") ||
    text.includes("architect") ||
    text.includes("reviewer") ||
    text.includes("test_engineer") ||
    text.includes("explorer") ||
    text.includes("coder");
  return hasDelegationSignal;
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
        "Please [agent] analyze this code and provide feedback"
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

  it("should return true for text containing delegation", () => {
    expect(
      isAgentInstruction(
        "I'm requesting delegation to the security expert for this sensitive operation"
      )
    ).toBe(true);
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

  it("should return true for text containing architect", () => {
    expect(
      isAgentInstruction(
        "Please consult the architect for the system design approach"
      )
    ).toBe(true);
  });

  it("should return true for text containing reviewer", () => {
    expect(
      isAgentInstruction(
        "The reviewer should check this code change before merging"
      )
    ).toBe(true);
  });

  it("should return true for text containing test_engineer", () => {
    expect(
      isAgentInstruction(
        "The test_engineer needs to create unit tests for this module"
      )
    ).toBe(true);
  });

  it("should return true for text containing explorer", () => {
    expect(
      isAgentInstruction(
        "The explorer agent can investigate the API documentation"
      )
    ).toBe(true);
  });

  it("should return true for text containing coder", () => {
    expect(
      isAgentInstruction(
        "The coder should implement the feature according to specifications"
      )
    ).toBe(true);
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

  it("should return true for text with partial keyword match (includes is substring matching)", () => {
    // Testing that "architecture" includes "architect" so it will match
    expect(
      isAgentInstruction(
        "We need to consider the architecture of this solution"
      )
    ).toBe(true);
  });

  it("should correctly distinguish between coder and coding", () => {
    // "coding" contains "cod" but not "coder" so should return false
    expect(isAgentInstruction("I enjoy coding in TypeScript")).toBe(false);
    
    // "coder" should return true
    expect(
      isAgentInstruction(
        "The coder should refactor this component"
      )
    ).toBe(true);
  });

  describe("Adversarial", () => {
    it("should return true for near-match tags like <skill-eval-required> (feedback loop bypass)", () => {
      // Should return true because <skill-eval-required> is not the exact excluded tag
      expect(
        isAgentInstruction(
          "<skill-eval-required> TASK: implement feature"
        )
      ).toBe(true);
    });

    it("should return true for slightly different tag <skill-evaluation-needed> (feedback loop bypass)", () => {
      // Should return true because <skill-evaluation-needed> is not the exact excluded tag
      expect(
        isAgentInstruction(
          "<skill-evaluation-needed> architect review"
        )
      ).toBe(true);
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

    it("should return true for very long string (10k+ chars) with delegation keyword at the end", () => {
      // Should still match even with very long text
      const longText = "A".repeat(10000) + " TASK: implement feature";
      expect(isAgentInstruction(longText)).toBe(true);
    });

    it("should return true for string with only delegation keywords and no other content", () => {
      // Should match with just "architect" alone
      expect(isAgentInstruction("architect")).toBe(true);
    });

    it("should return true for architectural (known behavior - loose matching)", () => {
      // Known behavior: "architectural" includes "architect" so returns true
      // Documented as NOT a bug - function is designed with loose matching
      expect(
        isAgentInstruction("Review the architectural decisions")
      ).toBe(true);
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
});