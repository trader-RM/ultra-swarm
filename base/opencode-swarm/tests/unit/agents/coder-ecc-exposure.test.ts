import { describe, expect, test } from 'bun:test';
import { CODER_PROMPT, getAgentConfigs } from '../../../src/agents';

// Approved ECC agents (build and pipeline resolvers + gan_generator)
const APPROVED_BUILD_AGENTS = [
	'build_error_resolver',
	'cpp_build_resolver',
	'dart_build_resolver',
	'go_build_resolver',
	'java_build_resolver',
	'kotlin_build_resolver',
	'pytorch_build_resolver',
	'rust_build_resolver',
] as const;

const APPROVED_PIPELINE_AGENTS = ['gan_generator'] as const;

const APPROVED_ECC_AGENTS = [...APPROVED_BUILD_AGENTS, ...APPROVED_PIPELINE_AGENTS] as const;

// Excluded ECC agents (sample from each category)
const EXCLUDED_ECC_AGENTS = [
	// Review/QA (not allowed for coder delegation)
	'code_reviewer',
	'security_reviewer',
	'cpp_reviewer',
	'tdd_guide',
	'e2e_runner',
	'refactor_cleaner',
	'performance_optimizer',
	'planner',
	'doc_updater',
	'docs_lookup',
	'harness_optimizer',
	'loop_operator',
	'chief_of_staff',
	'gan_planner',
	// Pipeline (not in approved list)
	'opensource_forker',
	'opensource_packager',
	// Support (not allowed for coder delegation)
	'gan_evaluator',
	'opensource_sanitizer',
] as const;

// Delegation rules constants
const DELEGATION_RULES = [
	'ECC DELEGATION AND OVERSIGHT',
	'DEFAULT TO DELEGATION',
	'QUALIFIED DELEGATION ONLY',
	'AFTER DELEGATION',
] as const;

// Existing guidance constants
const EXISTING_GUIDANCE = [
	'ANTI-HALLUCINATION PROTOCOL',
	'DEFENSIVE CODING RULES',
	'CROSS-PLATFORM RULES',
	'TEST FRAMEWORK',
	'ERROR HANDLING',
	'OUTPUT FORMAT',
	'PRE-SUBMIT CHECKS',
	'SELF-AUDIT',
] as const;

// Prohibited delegation patterns
const PROHIBITED_PATTERNS = [
	'DO NOT use the Task tool to delegate to other agents',
	'You ARE the agent that does the work',
] as const;

describe('Coder ECC Exposure', () => {
 describe('Approved ECC agents present in CODER_PROMPT', () => {
  for (const agent of APPROVED_ECC_AGENTS) {
   test(`${agent} is listed as approved ECC agent`, () => {
    expect(CODER_PROMPT).toContain(agent);
    // Verify agent appears in the APPROVED ECC AGENTS section
    const approvedSectionIndex = CODER_PROMPT.indexOf('APPROVED ECC AGENTS');
    const agentIndex = CODER_PROMPT.indexOf(agent);
    expect(agentIndex).toBeGreaterThan(approvedSectionIndex);
   });
  }
 });

 describe('Excluded ECC agents NOT present in CODER_PROMPT', () => {
  for (const agent of EXCLUDED_ECC_AGENTS) {
   test(`${agent} is NOT listed as approved ECC agent`, () => {
    // Verify agent does NOT appear in CODER_PROMPT
    expect(CODER_PROMPT).not.toContain(agent);
   });
  }
 });

 describe('Delegation rules present', () => {
  for (const rule of DELEGATION_RULES) {
   test(`contains "${rule}"`, () => {
    expect(CODER_PROMPT).toContain(rule);
   });
  }
 });

 describe('Existing guidance preserved', () => {
  for (const header of EXISTING_GUIDANCE) {
   test(`contains "${header}" section header`, () => {
    expect(CODER_PROMPT).toContain(header);
   });
  }
 });

 describe('No blanket Task prohibition', () => {
  for (const prohibited of PROHIBITED_PATTERNS) {
   test(`does NOT contain "${prohibited}"`, () => {
    expect(CODER_PROMPT).not.toContain(prohibited);
   });
  }
 });

 describe('Coder task permission in getAgentConfigs', () => {
  test('default coder (no prefix) gets mode:subagent and task:allow permission', () => {
   const configs = getAgentConfigs({});
   const coderConfig = configs['coder'];

   expect(coderConfig).toBeDefined();
   expect(coderConfig.mode).toBe('subagent');
   expect(coderConfig.permission).toEqual({ task: 'allow' });
  });

  test('cloud_coder gets mode:subagent and task:allow permission', () => {
   const config = {
    swarms: {
     cloud: {
      name: 'Cloud Swarm',
      agents: {},
     },
    },
   };
   const configs = getAgentConfigs(config);
   const cloudCoderConfig = configs['cloud_coder'];

   expect(cloudCoderConfig).toBeDefined();
   expect(cloudCoderConfig.mode).toBe('subagent');
   expect(cloudCoderConfig.permission).toEqual({ task: 'allow' });
  });

  test('local_coder gets mode:subagent and task:allow permission', () => {
   const config = {
    swarms: {
     local: {
      name: 'Local Swarm',
      agents: {},
     },
    },
   };
   const configs = getAgentConfigs(config);
   const localCoderConfig = configs['local_coder'];

   expect(localCoderConfig).toBeDefined();
   expect(localCoderConfig.mode).toBe('subagent');
   expect(localCoderConfig.permission).toEqual({ task: 'allow' });
  });
 });

 describe('Coder agent name resolution', () => {
  test('default coder (no swarms config) gets mode:subagent and task:allow permission', () => {
   const configs = getAgentConfigs({});
   expect(configs['coder']).toBeDefined();
   expect(configs['coder'].mode).toBe('subagent');
   expect(configs['coder'].permission).toEqual({ task: 'allow' });
  });

  test('coders with prefixes have correct mode and permission', () => {
   const config = {
    swarms: {
     local: {
      name: 'Local Swarm',
      agents: {},
     },
     cloud: {
      name: 'Cloud Swarm',
      agents: {},
     },
    },
   };
   const configs = getAgentConfigs(config);

   // Prefixed coders
   expect(configs['local_coder']).toBeDefined();
   expect(configs['local_coder'].mode).toBe('subagent');
   expect(configs['local_coder'].permission).toEqual({ task: 'allow' });

   expect(configs['cloud_coder']).toBeDefined();
   expect(configs['cloud_coder'].mode).toBe('subagent');
   expect(configs['cloud_coder'].permission).toEqual({ task: 'allow' });
  });

  test('default swarm coder gets mode:subagent and task:allow permission', () => {
   const config = {
    swarms: {
     default: {
      name: 'Default Swarm',
      agents: {},
     },
    },
   };
   const configs = getAgentConfigs(config);

   // Default swarm coder (no prefix)
   expect(configs['coder']).toBeDefined();
   expect(configs['coder'].mode).toBe('subagent');
   expect(configs['coder'].permission).toEqual({ task: 'allow' });
  });
 });
});
