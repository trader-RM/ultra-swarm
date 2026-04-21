import { describe, test, expect } from 'bun:test';

// Import constants and configurations
import { ARCHITECT_PROMPT } from '../../../src/agents/architect';
import { CODER_PROMPT } from '../../../src/agents/coder';
import { EXPLORER_PROMPT, CURATOR_INIT_PROMPT, CURATOR_PHASE_PROMPT } from '../../../src/agents/explorer';
import { DOCS_PROMPT } from '../../../src/agents/docs';
import { REVIEWER_PROMPT } from '../../../src/agents/reviewer';
import { createTestEngineerAgent } from '../../../src/agents/test-engineer';
import { createSMEAgent } from '../../../src/agents/sme';
import { getAgentConfigs } from '../../../src/agents';

describe('Phase 10 ECC Agent Exposure Smoke Test', () => {
  // R09: Architect Prompt
  describe('Architect Prompt Requirements', () => {
    test('R09: Architect prompt contains code-architect in APPROVED AGENTS section', () => {
    const eccSection = ARCHITECT_PROMPT.substring(ARCHITECT_PROMPT.indexOf('## ECC DELEGATION AND OVERSIGHT'));
    expect(eccSection).toContain('code-architect');
});

  });

  // R12-R19: Role ECC Additions
  describe('Role ECC Additions Requirements', () => {
    test('R12: Coder prompt ECC section includes code-simplifier (count should be 10)', () => {
      const eccSectionMatch = CODER_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/code-simplifier/);
        
        // Count the number of agents listed in the APPROVED AGENTS section
        const approvedSection = eccSection.substring(
          eccSection.indexOf('APPROVED AGENTS'),
          eccSection.indexOf('DELEGATION RULES')
        );
        const agentList = approvedSection.match(/- [\w-]+/g);
        expect(agentList).toHaveLength(10);
      }
    });

    test('R13: Explorer prompt ECC section includes code-explorer (count should be 3)', () => {
      const eccSectionMatch = EXPLORER_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/code-explorer/);
        
        // Count the number of agents listed in the APPROVED AGENTS section
        const approvedSection = eccSection.substring(
          eccSection.indexOf('APPROVED AGENTS'),
          eccSection.indexOf('DELEGATION RULES')
        );
        const agentList = approvedSection.match(/- [\w-]+/g);
        expect(agentList).toHaveLength(3);
      }
    });

    test('R14: Docs prompt ECC section includes comment-analyzer (count should be 3)', () => {
      const eccSectionMatch = DOCS_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/comment-analyzer/);
        
        // Count the number of agents listed in the APPROVED AGENTS section
        const approvedSection = eccSection.substring(
          eccSection.indexOf('APPROVED AGENTS'),
          eccSection.indexOf('DELEGATION RULES')
        );
        const agentList = approvedSection.match(/- [\w-]+/g);
        expect(agentList).toHaveLength(3);
      }
    });

    test('R15: Reviewer prompt ECC section includes silent-failure-hunter (count should be 19)', () => {
      const eccSectionMatch = REVIEWER_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/silent-failure-hunter/);
        
        // Count the number of agents listed in the APPROVED AGENTS section
        const approvedSection = eccSection.substring(
          eccSection.indexOf('APPROVED AGENTS'),
          eccSection.indexOf('DELEGATION RULES')
        );
        const agentList = approvedSection.match(/- [\w-]+/g);
        expect(agentList).toHaveLength(19);
      }
    });

    test('R16: Test Engineer prompt ECC section includes e2e-runner, tdd-guide, pr-test-analyzer', () => {
    const agent = createTestEngineerAgent('gpt-4');
    const prompt = agent.config.prompt!;
    const eccSection = prompt.substring(prompt.indexOf('## ECC DELEGATION AND OVERSIGHT'));
    expect(eccSection).toContain('e2e-runner');
    expect(eccSection).toContain('tdd-guide');
    expect(eccSection).toContain('pr-test-analyzer');
});

    test('R17: SME prompt ECC section includes opensource-forker, opensource-packager', () => {
    const agent = createSMEAgent('gpt-4');
    const prompt = agent.config.prompt!;
    const eccSection = prompt.substring(prompt.indexOf('## ECC DELEGATION AND OVERSIGHT'));
    expect(eccSection).toContain('opensource-forker');
    expect(eccSection).toContain('opensource-packager');
});

    test('R18: CURATOR_INIT_PROMPT ECC section includes conversation-analyzer', () => {
      const eccSectionMatch = CURATOR_INIT_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/conversation-analyzer/);
      }
    });

    test('R19: CURATOR_PHASE_PROMPT ECC section includes conversation-analyzer', () => {
      const eccSectionMatch = CURATOR_PHASE_PROMPT.match(/## ECC DELEGATION AND OVERSIGHT([\s\S]*?)(?=##|$)/);
      expect(eccSectionMatch).not.toBeNull();
      if (eccSectionMatch) {
        const eccSection = eccSectionMatch[0];
        expect(eccSection).toMatch(/conversation-analyzer/);
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