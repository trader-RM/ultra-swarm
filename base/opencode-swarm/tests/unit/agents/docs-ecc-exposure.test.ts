import { describe, expect, test } from 'bun:test';
import { getAgentConfigs, DOCS_PROMPT } from '../../../src/agents';

// Approved ECC doc agents for docs (3 doc specialists)
const APPROVED_DOCS_AGENTS = ['doc-updater', 'docs-lookup', 'comment-analyzer'] as const;

// Excluded ECC agents (build, pipeline, review, support — NOT approved for docs)
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
	'harness-optimizer',
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
	'QUALIFIED DELEGATION ONLY',
	'AFTER DELEGATION',
] as const;

describe('Docs ECC Exposure — Phase 8', () => {
	describe('Approved ECC doc agents in prompt', () => {
		for (const agent of APPROVED_DOCS_AGENTS) {
			test(`${agent} is listed in DOCS_PROMPT`, () => {
				// Convert hyphens to underscores to match actual prompt format
				const agentWithUnderscore = agent.replace(/-/g, '_');
				expect(DOCS_PROMPT).toContain(`- ${agentWithUnderscore}`);
			});
		}
	});

	describe('Excluded ECC agents are NOT in prompt', () => {
		for (const agent of EXCLUDED_ECC_AGENTS) {
			test(`${agent} is NOT in DOCS_PROMPT delegation list`, () => {
				// Check that the agent doesn't appear as a delegation target
				// (it may appear in other contexts like "do NOT delegate to")
				const delegationPattern = `- ${agent} `;
				expect(DOCS_PROMPT).not.toContain(delegationPattern);
			});
		}
	});

	describe('Delegation rules in prompt', () => {
		for (const rule of DELEGATION_RULES) {
			test(`DOCS_PROMPT contains delegation rule: ${rule}`, () => {
				expect(DOCS_PROMPT).toContain(rule);
			});
		}

		test('DOCS_PROMPT states delegation count as 3', () => {
			expect(DOCS_PROMPT).toContain('3 agents');
		});

		test('DOCS_PROMPT states delegation-only restriction', () => {
			expect(DOCS_PROMPT).toContain(
				'You may ONLY delegate to the 3 agents listed above',
			);
		});
	});

	describe('No blanket delegation prohibition', () => {
		test('DOCS_PROMPT does NOT contain "you do NOT delegate"', () => {
			expect(DOCS_PROMPT).not.toContain('you do NOT delegate');
		});

		test('DOCS_PROMPT does NOT contain "DO NOT use the Task tool to delegate"', () => {
			expect(DOCS_PROMPT).not.toContain(
				'DO NOT use the Task tool to delegate to other agents',
			);
		});

		test('DOCS_PROMPT does NOT contain "You ARE the agent that does the work"', () => {
			expect(DOCS_PROMPT).not.toContain(
				'You ARE the agent that does the work',
			);
		});
	});

	describe('Task permission for docs in getAgentConfigs', () => {
		test('default docs (no prefix) gets task:allow permission', () => {
			const configs = getAgentConfigs();
			const docsConfig = configs['docs'];

			expect(docsConfig).toBeDefined();
			expect(docsConfig.permission).toEqual({ task: 'allow' });
		});

		test('prefixed docs (local_docs) gets task:allow permission', () => {
			const config = {
				swarms: {
					local: {
						name: 'Local Swarm',
						agents: {},
					},
				},
			} as any;
			const configs = getAgentConfigs(config);
			const localDocsConfig = configs['local_docs'];

			expect(localDocsConfig).toBeDefined();
			expect(localDocsConfig.permission).toEqual({ task: 'allow' });
		});

		test('prefixed docs (cloud_docs) gets task:allow permission', () => {
			const config = {
				swarms: {
					cloud: {
						name: 'Cloud Swarm',
						agents: {},
					},
				},
			} as any;
			const configs = getAgentConfigs(config);
			const cloudDocsConfig = configs['cloud_docs'];

			expect(cloudDocsConfig).toBeDefined();
			expect(cloudDocsConfig.permission).toEqual({ task: 'allow' });
		});
	});

	describe('DOCS_PROMPT export', () => {
		test('DOCS_PROMPT is exported and accessible', () => {
			expect(DOCS_PROMPT).toBeDefined();
			expect(typeof DOCS_PROMPT).toBe('string');
			expect(DOCS_PROMPT.length).toBeGreaterThan(1000);
		});

		test('DOCS_PROMPT identity line mentions coordination', () => {
			expect(DOCS_PROMPT).toContain(
				'coordinate specialist ECC doc agents for domain-appropriate delegation',
			);
		});

		test('DOCS_PROMPT states docs remains owner of documentation lane', () => {
			expect(DOCS_PROMPT).toContain(
				'You remain the owner of the documentation lane',
			);
		});
	});
});
