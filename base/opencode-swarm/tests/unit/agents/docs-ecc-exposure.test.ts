import { describe, expect, test } from 'bun:test';
import { getAgentConfigs, DOCS_PROMPT } from '../../../src/agents';

// Approved ECC doc agents for docs (2 doc specialists)
const APPROVED_DOCS_AGENTS = ['doc_updater', 'docs_lookup'] as const;

// Excluded ECC agents (build, pipeline, review, support — NOT approved for docs)
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

describe('Docs ECC Exposure — Phase 8', () => {
	describe('Approved ECC doc agents in prompt', () => {
		for (const agent of APPROVED_DOCS_AGENTS) {
			test(`${agent} is listed in DOCS_PROMPT`, () => {
				expect(DOCS_PROMPT).toContain(`- ${agent}`);
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

		test('DOCS_PROMPT states delegation count as 2', () => {
			expect(DOCS_PROMPT).toContain('2 agents');
		});

		test('DOCS_PROMPT states delegation-only restriction', () => {
			expect(DOCS_PROMPT).toContain(
				'You may ONLY delegate to the 2 agents listed above',
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

	describe('Adversarial: ECC agents that must NOT get task:allow for docs', () => {
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
