import { describe, expect, test } from 'bun:test';
import { getAgentConfigs, EXPLORER_PROMPT } from '../../../src/agents';

// Approved ECC agents for explorer (4 research + configuration specialists)
const APPROVED_EXPLORER_AGENTS = ['doc-updater', 'docs-lookup', 'code-explorer', 'harness-optimizer'] as const;

// Excluded ECC agents (build, pipeline, support, review — NOT approved for explorer)
const EXCLUDED_BUILD_AGENTS = [
	'build-error-resolver',
	'cpp-build-resolver',
	'dart-build-resolver',
	'go-build-resolver',
	'java-build-resolver',
	'kotlin-build-resolver',
	'pytorch-build-resolver',
	'rust-build-resolver',
] as const;

const EXCLUDED_PIPELINE_AGENTS = [
	'tdd-guide',
	'e2e-runner',
	'refactor-cleaner',
	'performance-optimizer',
	'gan-generator',
	'opensource-forker',
	'opensource-packager',
] as const;

const EXCLUDED_SUPPORT_AGENTS = [
	'planner',
	'loop-operator',
	'chief-of-staff',
	'gan-planner',
] as const;

const EXCLUDED_REVIEW_AGENTS = [
	'code-reviewer',
	'security-reviewer',
	'cpp-reviewer',
	'go-reviewer',
	'kotlin-reviewer',
	'java-reviewer',
	'rust-reviewer',
	'python-reviewer',
	'typescript-reviewer',
	'csharp-reviewer',
	'flutter-reviewer',
	'database-reviewer',
	'healthcare-reviewer',
	'gan-evaluator',
	'opensource-sanitizer',
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
	'ACT DIRECTLY when delegation is not relevant',
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
				// Convert hyphens to underscores to match actual prompt format
				const agentWithUnderscore = agent.replace(/-/g, '_');
				expect(EXPLORER_PROMPT).toContain(`- ${agentWithUnderscore}`);
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

		test('EXPLORER_PROMPT states delegation count as 4', () => {
			expect(EXPLORER_PROMPT).toContain('4 agents');
		});

		test('EXPLORER_PROMPT states delegation-only restriction', () => {
			expect(EXPLORER_PROMPT).toContain(
				'You may ONLY delegate to the 4 agents listed above',
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
