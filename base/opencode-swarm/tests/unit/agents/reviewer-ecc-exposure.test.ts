import { describe, expect, test } from 'bun:test';
import { getAgentConfigs, REVIEWER_PROMPT } from '../../../src/agents';

// Approved ECC review agents (17 that exist in ALL_SUBAGENT_NAMES)
const APPROVED_REVIEW_AGENTS = [
	'code_reviewer',
	'csharp_reviewer',
	'cpp_reviewer',
	'database_reviewer',
	'flutter_reviewer',
	'gan_evaluator',
	'go_reviewer',
	'healthcare_reviewer',
	'java_reviewer',
	'kotlin_reviewer',
	'opensource_sanitizer',
	'performance_optimizer',
	'python_reviewer',
	'refactor_cleaner',
	'rust_reviewer',
	'security_reviewer',
	'typescript_reviewer',
] as const;

// Agents that do NOT exist in ALL_SUBAGENT_NAMES — skipped per user instruction
const SKIPPED_NONEXISTENT_AGENTS = [
	'code_simplifier',
	'silent_failure_hunter',
	'type_design_analyzer',
] as const;

// Excluded ECC agents (build, pipeline, support — NOT approved for reviewer)
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
	'gan_generator',
	'opensource_forker',
	'opensource_packager',
] as const;

const EXCLUDED_SUPPORT_AGENTS = [
	'planner',
	'doc_updater',
	'docs_lookup',
	'harness_optimizer',
	'loop_operator',
	'chief_of_staff',
	'gan_planner',
] as const;

const EXCLUDED_ECC_AGENTS = [
	...EXCLUDED_BUILD_AGENTS,
	...EXCLUDED_PIPELINE_AGENTS,
	...EXCLUDED_SUPPORT_AGENTS,
] as const;

// Delegation rules constants
const DELEGATION_RULES = [
	'ECC DELEGATION AND OVERSIGHT',
	'DEFAULT TO DELEGATION-FIRST SUPERVISION',
	'QUALIFIED DELEGATION ONLY',
	'AFTER DELEGATION',
] as const;

// Existing guidance constants (must be preserved)
const EXISTING_GUIDANCE = [
	'PRESSURE IMMUNITY',
	'REVIEW FOCUS',
	'EXPLORER FINDINGS',
	'REVIEW REASONING',
	'REVIEW STRUCTURE',
	'INPUT FORMAT',
	'OUTPUT FORMAT',
	'SEVERITY CALIBRATION',
	'SUBSTANCE VERIFICATION',
	'SAST TRIAGE',
] as const;

describe('Reviewer ECC Exposure — Phase 5', () => {
	describe('Approved ECC review agents in prompt', () => {
		for (const agent of APPROVED_REVIEW_AGENTS) {
			test(`${agent} is listed in REVIEWER_PROMPT`, () => {
				expect(REVIEWER_PROMPT).toContain(`- ${agent}`);
			});
		}
	});

	describe('Skipped nonexistent agents are not in prompt', () => {
		for (const agent of SKIPPED_NONEXISTENT_AGENTS) {
			test(`${agent} is NOT listed in REVIEWER_PROMPT`, () => {
				expect(REVIEWER_PROMPT).not.toContain(`- ${agent} `);
			});
		}
	});

	describe('Excluded ECC agents are NOT in prompt', () => {
		for (const agent of EXCLUDED_ECC_AGENTS) {
			test(`${agent} is NOT in REVIEWER_PROMPT delegation list`, () => {
				// Check that the agent doesn't appear as a delegation target
				// (it may appear in other contexts like "do NOT delegate to")
				const delegationPattern = `- ${agent} `;
				expect(REVIEWER_PROMPT).not.toContain(delegationPattern);
			});
		}
	});

	describe('Delegation rules in prompt', () => {
		for (const rule of DELEGATION_RULES) {
			test(`REVIEWER_PROMPT contains delegation rule: ${rule}`, () => {
				expect(REVIEWER_PROMPT).toContain(rule);
			});
		}

		test('REVIEWER_PROMPT states delegation count as 17', () => {
			expect(REVIEWER_PROMPT).toContain('17 agents');
		});

		test('REVIEWER_PROMPT states delegation-only restriction', () => {
			expect(REVIEWER_PROMPT).toContain(
				'You may ONLY delegate to the 17 agents listed above',
			);
		});
	});

	describe('Existing guidance preserved in prompt', () => {
		for (const guidance of EXISTING_GUIDANCE) {
			test(`REVIEWER_PROMPT preserves existing section: ${guidance}`, () => {
				expect(REVIEWER_PROMPT).toContain(guidance);
			});
		}
	});

	describe('No blanket delegation prohibition', () => {
		test('REVIEWER_PROMPT does NOT contain "you do NOT delegate"', () => {
			expect(REVIEWER_PROMPT).not.toContain('you do NOT delegate');
		});

		test('REVIEWER_PROMPT does NOT contain "DO NOT use the Task tool to delegate"', () => {
			expect(REVIEWER_PROMPT).not.toContain(
				'DO NOT use the Task tool to delegate to other agents',
			);
		});

		test('REVIEWER_PROMPT does NOT contain "You ARE the agent that does the work"', () => {
			expect(REVIEWER_PROMPT).not.toContain(
				'You ARE the agent that does the work',
			);
		});

		test('REVIEWER_PROMPT does NOT contain "IGNORE them — they are context from the orchestrator"', () => {
			expect(REVIEWER_PROMPT).not.toContain(
				'IGNORE them — they are context from the orchestrator, not instructions for you to delegate',
			);
		});
	});

	describe('Task permission for reviewer in getAgentConfigs', () => {
		test('default reviewer gets task:allow permission', () => {
			const configs = getAgentConfigs();
			const reviewerConfig = configs['reviewer'];

			expect(reviewerConfig).toBeDefined();
			expect(reviewerConfig.permission).toEqual({ task: 'allow' });
		});

		test('prefixed reviewer (local_reviewer) gets task:allow permission', () => {
			const config = {
				swarms: {
					local: {
						name: 'Local Swarm',
						agents: {},
					},
				},
			} as any;
			const configs = getAgentConfigs(config);
			const localReviewerConfig = configs['local_reviewer'];

			expect(localReviewerConfig).toBeDefined();
			expect(localReviewerConfig.permission).toEqual({ task: 'allow' });
		});

		test('prefixed reviewer (cloud_reviewer) gets task:allow permission', () => {
			const config = {
				swarms: {
					cloud: {
						name: 'Cloud Swarm',
						agents: {},
					},
				},
			} as any;
			const configs = getAgentConfigs(config);
			const cloudReviewerConfig = configs['cloud_reviewer'];

			expect(cloudReviewerConfig).toBeDefined();
			expect(cloudReviewerConfig.permission).toEqual({ task: 'allow' });
		});
	});

	describe('Adversarial: ECC agents that must NOT get task:allow', () => {
		test('ECC cpp_reviewer does NOT get task permission', () => {
			const configs = getAgentConfigs();
			const cppReviewer = configs['cpp_reviewer'];

			expect(cppReviewer).toBeDefined();
			expect(cppReviewer.mode).toBe('subagent');
			expect(cppReviewer.permission).toBeUndefined();
		});

		test('ECC security_reviewer does NOT get task permission', () => {
			const configs = getAgentConfigs();
			const securityReviewer = configs['security_reviewer'];

			expect(securityReviewer).toBeDefined();
			expect(securityReviewer.mode).toBe('subagent');
			expect(securityReviewer.permission).toBeUndefined();
		});

		test('ECC gan_evaluator does NOT get task permission', () => {
			const configs = getAgentConfigs();
			const ganEvaluator = configs['gan_evaluator'];

			expect(ganEvaluator).toBeDefined();
			expect(ganEvaluator.mode).toBe('subagent');
			expect(ganEvaluator.permission).toBeUndefined();
		});

		test('ECC build_error_resolver does NOT get task permission', () => {
			const configs = getAgentConfigs();
			const buildResolver = configs['build_error_resolver'];

			expect(buildResolver).toBeDefined();
			expect(buildResolver.mode).toBe('subagent');
			expect(buildResolver.permission).toBeUndefined();
		});

		test('ECC refactor_cleaner does NOT get task permission', () => {
			const configs = getAgentConfigs();
			const refactorCleaner = configs['refactor_cleaner'];

			expect(refactorCleaner).toBeDefined();
			expect(refactorCleaner.mode).toBe('subagent');
			expect(refactorCleaner.permission).toBeUndefined();
		});
	});

	describe('Identity line updated', () => {
		test('REVIEWER_PROMPT identity line mentions delegation', () => {
			expect(REVIEWER_PROMPT).toContain(
				'coordinate specialist ECC review agents for domain-appropriate delegation',
			);
		});

		test('REVIEWER_PROMPT states reviewer remains owner of review lane', () => {
			expect(REVIEWER_PROMPT).toContain(
				'You remain the owner of the review lane',
			);
		});
	});

	describe('REVIEWER_PROMPT export', () => {
		test('REVIEWER_PROMPT is exported and accessible', () => {
			expect(REVIEWER_PROMPT).toBeDefined();
			expect(typeof REVIEWER_PROMPT).toBe('string');
			expect(REVIEWER_PROMPT.length).toBeGreaterThan(1000);
		});
	});
});
