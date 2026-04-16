import { describe, test, expect } from 'bun:test';

// Import constants and configurations
import {
  ALL_SUBAGENT_NAMES,
  AGENT_TOOL_MAP,
  DEFAULT_MODELS,
} from '../../../src/config/constants';
import { AGENT_CATEGORY } from '../../../src/config/agent-categories';
import { stripKnownSwarmPrefix } from '../../../src/config/schema';
import { createAgents, getAgentConfigs } from '../../../src/agents';
import { ARCHITECT_PROMPT } from '../../../src/agents/architect';
import { CODER_PROMPT } from '../../../src/agents/coder';
import { EXPLORER_PROMPT, CURATOR_INIT_PROMPT, CURATOR_PHASE_PROMPT } from '../../../src/agents/explorer';
import { DOCS_PROMPT } from '../../../src/agents/docs';
import { REVIEWER_PROMPT } from '../../../src/agents/reviewer';
import { createTestEngineerAgent } from '../../../src/agents/test-engineer';
import { createSMEAgent } from '../../../src/agents/sme';

describe('Phase 10 ECC Agent Exposure Smoke Test', () => {
  // R01: Suffix Fix
  test('R01: stripKnownSwarmPrefix suffix collision fix sorts agent names by length descending before matching', () => {
    // This verifies the suffix collision fix sorts agent names by length descending before matching
    expect(stripKnownSwarmPrefix('alpha_a11y_architect')).toBe('a11y_architect');
    expect(stripKnownSwarmPrefix('local_architect')).toBe('architect');
  });

  // R02-R08: Agent Registration
  describe('Agent Registration Requirements', () => {
    const newAgents = [
      'pr_test_analyzer',
      'silent_failure_hunter',
      'code_simplifier',
      'code_architect',
      'code_explorer',
      'comment_analyzer',
      'conversation_analyzer'
    ];

    test('R02-R08: All new ECC agents must exist in ALL_SUBAGENT_NAMES, AGENT_TOOL_MAP, DEFAULT_MODELS, AGENT_CATEGORY, and the factory', () => {
      // Check ALL_SUBAGENT_NAMES
      for (const agent of newAgents) {
        expect(ALL_SUBAGENT_NAMES).toContain(agent);
      }

      // Check AGENT_TOOL_MAP
      for (const agent of newAgents) {
        expect(AGENT_TOOL_MAP).toHaveProperty(agent);
      }

      // Check DEFAULT_MODELS
      for (const agent of newAgents) {
        expect(DEFAULT_MODELS).toHaveProperty(agent);
      }

      // Check AGENT_CATEGORY
      for (const agent of newAgents) {
        expect(AGENT_CATEGORY).toHaveProperty(agent);
      }

      // Check factory creates agents
      const agents = createAgents();
      for (const agent of newAgents) {
        const found = agents.some(a => a.name === agent || a.name.endsWith(`_${agent}`));
        expect(found).toBe(true);
      }
    });
  });

  // R09-R11: Architect Prompt
  describe('Architect Prompt Requirements', () => {
    test('R09: Architect prompt contains code_architect in ECC DELEGATION section', () => {
    const eccSection = ARCHITECT_PROMPT.substring(ARCHITECT_PROMPT.indexOf('## ECC DELEGATION AND OVERSIGHT'));
    expect(eccSection).toContain('code_architect');
});

    test('R10: Architect prompt moved harness_optimizer from direct AGENTS to ECC DELEGATION section only', () => {
    const eccSection = ARCHITECT_PROMPT.substring(ARCHITECT_PROMPT.indexOf('## ECC DELEGATION AND OVERSIGHT'));
    expect(eccSection).toContain('harness_optimizer');
    
    // Check that harness_optimizer is NOT in the direct agents list (the "Your agents:" line)
    const identitySection = ARCHITECT_PROMPT.substring(0, ARCHITECT_PROMPT.indexOf('## ECC DELEGATION AND OVERSIGHT'));
    expect(identitySection).not.toContain('harness_optimizer');
});

    test('R11: Architect prompt moved loop_operator from direct AGENTS to ECC DELEGATION section only', () => {
    const eccSection = ARCHITECT_PROMPT.substring(ARCHITECT_PROMPT.indexOf('## ECC DELEGATION AND OVERSIGHT'));
    expect(eccSection).toContain('loop_operator');
    
    // Check that loop_operator is NOT in the direct agents list (the "Your agents:" line)
    const identitySection = ARCHITECT_PROMPT.substring(0, ARCHITECT_PROMPT.indexOf('## ECC DELEGATION AND OVERSIGHT'));
    expect(identitySection).not.toContain('loop_operator');
});
  });

  // R12-R19: Role ECC Additions
  describe('Role ECC Additions Requirements', () => {
    test('R12: Coder prompt ECC section includes code_simplifier (count should be 10)', () => {
      const eccSectionMatch = CODER_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/code_simplifier/);
        
        // Count the number of agents listed in the APPROVED ECC AGENTS section
        const approvedSection = eccSection.substring(
          eccSection.indexOf('APPROVED ECC AGENTS'),
          eccSection.indexOf('DELEGATION RULES')
        );
        const agentList = approvedSection.match(/- \w+/g);
        expect(agentList).toHaveLength(10);
      }
    });

    test('R13: Explorer prompt ECC section includes code_explorer (count should be 3)', () => {
      const eccSectionMatch = EXPLORER_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/code_explorer/);
        
        // Count the number of agents listed in the APPROVED ECC AGENTS section
        const approvedSection = eccSection.substring(
          eccSection.indexOf('APPROVED ECC AGENTS'),
          eccSection.indexOf('DELEGATION RULES')
        );
        const agentList = approvedSection.match(/- \w+/g);
        expect(agentList).toHaveLength(3);
      }
    });

    test('R14: Docs prompt ECC section includes comment_analyzer (count should be 3)', () => {
      const eccSectionMatch = DOCS_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/comment_analyzer/);
        
        // Count the number of agents listed in the APPROVED ECC AGENTS section
        const approvedSection = eccSection.substring(
          eccSection.indexOf('APPROVED ECC AGENTS'),
          eccSection.indexOf('DELEGATION RULES')
        );
        const agentList = approvedSection.match(/- \w+/g);
        expect(agentList).toHaveLength(3);
      }
    });

    test('R15: Reviewer prompt ECC section includes silent_failure_hunter (count should be 18)', () => {
      const eccSectionMatch = REVIEWER_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/silent_failure_hunter/);
        
        // Count the number of agents listed in the APPROVED ECC AGENTS section
        const approvedSection = eccSection.substring(
          eccSection.indexOf('APPROVED ECC AGENTS'),
          eccSection.indexOf('DELEGATION RULES')
        );
        const agentList = approvedSection.match(/- \w+/g);
        expect(agentList).toHaveLength(18);
      }
    });

    test('R16: Test Engineer prompt ECC section includes e2e_runner, tdd_guide, pr_test_analyzer', () => {
    const agent = createTestEngineerAgent('gpt-4');
    const prompt = agent.config.prompt!;
    const eccSection = prompt.substring(prompt.indexOf('## ECC DELEGATION AND OVERSIGHT'));
    expect(eccSection).toContain('e2e_runner');
    expect(eccSection).toContain('tdd_guide');
    expect(eccSection).toContain('pr_test_analyzer');
});

    test('R17: SME prompt ECC section includes opensource_forker, opensource_packager', () => {
    const agent = createSMEAgent('gpt-4');
    const prompt = agent.config.prompt!;
    const eccSection = prompt.substring(prompt.indexOf('## ECC DELEGATION AND OVERSIGHT'));
    expect(eccSection).toContain('opensource_forker');
    expect(eccSection).toContain('opensource_packager');
});

    test('R18: CURATOR_INIT_PROMPT ECC section includes conversation_analyzer', () => {
      const eccSectionMatch = CURATOR_INIT_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/conversation_analyzer/);
      }
    });

    test('R19: CURATOR_PHASE_PROMPT ECC section includes conversation_analyzer', () => {
      const eccSectionMatch = CURATOR_PHASE_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/conversation_analyzer/);
      }
    });
  });

  // R20-R22: Permission Changes
  describe('Permission Changes Requirements', () => {
    test('R20: getAgentConfigs returns test_engineer config with task: \'allow\'', () => {
      const configs = getAgentConfigs();
      const testEngineerConfig = configs['test_engineer'];
      expect(testEngineerConfig).toBeDefined();
      expect(testEngineerConfig?.permission?.task).toBe('allow');
    });

    test('R21: getAgentConfigs returns sme config with task: \'allow\'', () => {
      const configs = getAgentConfigs();
      const smeConfig = configs['sme'];
      expect(smeConfig).toBeDefined();
      expect(smeConfig?.permission?.task).toBe('allow');
    });

    test('R22: getAgentConfigs returns curator_init and curator_phase configs with task: \'allow\'', () => {
      const configs = getAgentConfigs();
      const curatorInitConfig = configs['curator_init'];
      const curatorPhaseConfig = configs['curator_phase'];
      
      expect(curatorInitConfig).toBeDefined();
      expect(curatorInitConfig?.permission?.task).toBe('allow');
      
      expect(curatorPhaseConfig).toBeDefined();
      expect(curatorPhaseConfig?.permission?.task).toBe('allow');
    });
  });
});