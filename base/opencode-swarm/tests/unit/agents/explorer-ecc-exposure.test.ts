import { describe, expect, test } from 'bun:test';
import { getAgentConfigs, EXPLORER_PROMPT } from '../../../src/agents';

// Approved ECC agents for explorer (3 research specialists)
const APPROVED_EXPLORER_AGENTS = ['doc_updater', 'docs_lookup', 'code_explorer'] as const;

// Excluded ECC agents (build, pipeline, support, review — NOT approved for explorer)
const EXCLUDED_BUILD_AGENTS = [
	'build_error_resolver',
	'cpp_build_resolver',
	'dart_build_resolver',
	'go_build_resolver',
	'java_build_resolver',
	'kotlin_build_resolver',
	'pytorch_build_resolver',
	'rust_build_resolver',
] as const;

const EXCLUDED_PIPELINE_AGENTS = [
	'tdd_guide',
	'e2e_runner',
	'refactor_cleaner',
	'performance_optimizer',
	'gan_generator',
	'opensource_forker',
	'opensource_packager',
] as const;

const EXCLUDED_SUPPORT_AGENTS = [
	'planner',
	'harness_optimizer',
	'loop_operator',
	'chief_of_staff',
	'gan_planner',
] as const;

const EXCLUDED_REVIEW_AGENTS = [
	'code_reviewer',
	'security_reviewer',
	'cpp_reviewer',
	'go_reviewer',
	'kotlin_reviewer',
	'java_reviewer',
	'rust_reviewer',
	'python_reviewer',
	'typescript_reviewer',
	'csharp_reviewer',
	'flutter_reviewer',
	'database_reviewer',
	'healthcare_reviewer',
	'gan_evaluator',
	'opensource_sanitizer',
] as const;

const EXCLUDED_ECC_AGENTS = [
	...EXCLUDED_BUILD_AGENTS,
	...EXCLUDED_PIPELINE_AGENTS,
	...EXCLUDED_SUPPORT_AGENTS,
	...EXCLUDED_REVIEW_AGENTS,
] as const;

// Delegation rules constants
const DELEGATION_RULES = [
	'ECC DELEGATION AND OVERSIGHT',
	'DEFAULT TO DELEGATION-FIRST SUPERVISION',
	'QUALIFIED DELEGATION ONLY',
	'AFTER DELEGATION',
] as const;

// Explorer mode constants
const EXPLORER_MODES = [
	'ANALYSIS PROTOCOL',
	'INTEGRATION IMPACT ANALYSIS MODE',
	'DOCUMENTATION DISCOVERY MODE',
] as const;

describe('Explorer ECC Exposure — Phase 5', () => {
	describe('Approved ECC explorer agents in prompt', () => {
		for (const agent of APPROVED_EXPLORER_AGENTS) {
			test(`${agent} is listed in EXPLORER_PROMPT`, () => {
				expect(EXPLORER_PROMPT).toContain(`- ${agent}`);
			});
		}
	});

	describe('Excluded ECC agents are NOT in prompt', () => {
		for (const agent of EXCLUDED_ECC_AGENTS) {
			test(`${agent} is NOT in EXPLORER_PROMPT delegation list`, () => {
				// Check that the agent doesn't appear as a delegation target
				// (it may appear in other contexts like "do NOT delegate to")
				const delegationPattern = `- ${agent} `;
				expect(EXPLORER_PROMPT).not.toContain(delegationPattern);
			});
		}
	});

	describe('Delegation rules in prompt', () => {
		for (const rule of DELEGATION_RULES) {
			test(`EXPLORER_PROMPT contains delegation rule: ${rule}`, () => {
				expect(EXPLORER_PROMPT).toContain(rule);
			});
		}

		test('EXPLORER_PROMPT states delegation count as 3', () => {
			expect(EXPLORER_PROMPT).toContain('3 agents');
		});

		test('EXPLORER_PROMPT states delegation-only restriction', () => {
			expect(EXPLORER_PROMPT).toContain(
				'You may ONLY delegate to the 3 agents listed above',
			);
		});
	});

	describe('Explorer modes present in prompt', () => {
		for (const mode of EXPLORER_MODES) {
			test(`EXPLORER_PROMPT contains mode: ${mode}`, () => {
				expect(EXPLORER_PROMPT).toContain(mode);
			});
		}
	});

	describe('No blanket delegation prohibition', () => {
		test('EXPLORER_PROMPT does NOT contain "you do NOT delegate"', () => {
			expect(EXPLORER_PROMPT).not.toContain('you do NOT delegate');
		});

		test('EXPLORER_PROMPT does NOT contain "DO NOT use the Task tool to delegate"', () => {
			expect(EXPLORER_PROMPT).not.toContain(
				'DO NOT use the Task tool to delegate to other agents',
			);
		});

		test('EXPLORER_PROMPT does NOT contain "You ARE the agent that does the work"', () => {
			expect(EXPLORER_PROMPT).not.toContain(
				'You ARE the agent that does the work',
			);
		});
	});

	describe('Task permission for explorer in getAgentConfigs', () => {
		test('default explorer (no prefix) gets task:allow permission', () => {
			const configs = getAgentConfigs();
			const explorerConfig = configs['explorer'];

			expect(explorerConfig).toBeDefined();
			expect(explorerConfig.permission).toEqual({ task: 'allow' });
		});

		test('prefixed explorer (local_explorer) gets task:allow permission', () => {
			const config = {
				swarms: {
					local: {
						name: 'Local Swarm',
						agents: {},
					},
				},
			} as any;
			const configs = getAgentConfigs(config);
			const localExplorerConfig = configs['local_explorer'];

			expect(localExplorerConfig).toBeDefined();
			expect(localExplorerConfig.permission).toEqual({ task: 'allow' });
		});

		test('prefixed explorer (cloud_explorer) gets task:allow permission', () => {
			const config = {
				swarms: {
					cloud: {
						name: 'Cloud Swarm',
						agents: {},
					},
				},
			} as any;
			const configs = getAgentConfigs(config);
			const cloudExplorerConfig = configs['cloud_explorer'];

			expect(cloudExplorerConfig).toBeDefined();
			expect(cloudExplorerConfig.permission).toEqual({ task: 'allow' });
		});
	});

	describe('Adversarial: ECC agents that must NOT get task:allow for explorer', () => {
		test('ECC code_reviewer does NOT get task permission', () => {
			const configs = getAgentConfigs();
			const codeReviewer = configs['code_reviewer'];

			expect(codeReviewer).toBeDefined();
			expect(codeReviewer.mode).toBe('subagent');
			expect(codeReviewer.permission).toBeUndefined();
		});

		test('ECC security_reviewer does NOT get task permission', () => {
			const configs = getAgentConfigs();
			const securityReviewer = configs['security_reviewer'];

			expect(securityReviewer).toBeDefined();
			expect(securityReviewer.mode).toBe('subagent');
			expect(securityReviewer.permission).toBeUndefined();
		});

		test('ECC build_error_resolver does NOT get task permission', () => {
			const configs = getAgentConfigs();
			const buildResolver = configs['build_error_resolver'];

			expect(buildResolver).toBeDefined();
			expect(buildResolver.mode).toBe('subagent');
			expect(buildResolver.permission).toBeUndefined();
		});

		test('ECC doc_updater does NOT get task permission (it is approved for delegation, not for having task authority)', () => {
			const configs = getAgentConfigs();
			const docUpdater = configs['doc_updater'];

			expect(docUpdater).toBeDefined();
			expect(docUpdater.mode).toBe('subagent');
			expect(docUpdater.permission).toBeUndefined();
		});

		test('ECC docs_lookup does NOT get task permission (it is approved for delegation, not for having task authority)', () => {
			const configs = getAgentConfigs();
			const docsLookup = configs['docs_lookup'];

			expect(docsLookup).toBeDefined();
			expect(docsLookup.mode).toBe('subagent');
			expect(docsLookup.permission).toBeUndefined();
		});
	});

	describe('EXPLORER_PROMPT export', () => {
		test('EXPLORER_PROMPT is exported and accessible', () => {
			expect(EXPLORER_PROMPT).toBeDefined();
			expect(typeof EXPLORER_PROMPT).toBe('string');
			expect(EXPLORER_PROMPT.length).toBeGreaterThan(1000);
		});

		test('EXPLORER_PROMPT identity line mentions coordination', () => {
			expect(EXPLORER_PROMPT).toContain(
				'coordinate specialist ECC research agents for domain-appropriate delegation',
			);
		});

		test('EXPLORER_PROMPT states explorer remains owner of discovery lane', () => {
			expect(EXPLORER_PROMPT).toContain(
				'You remain the owner of the discovery and investigation lane',
			);
		});
	});
});
