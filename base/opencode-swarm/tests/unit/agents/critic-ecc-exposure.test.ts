import { describe, expect, test } from 'bun:test';
import {
	getAgentConfigs,
	PLAN_CRITIC_PROMPT,
	SOUNDING_BOARD_PROMPT,
	PHASE_DRIFT_VERIFIER_PROMPT,
	AUTONOMOUS_OVERSIGHT_PROMPT,
} from '../../../src/agents';

// Approved ECC planning agents for critic (2 support specialists)
const APPROVED_CRITIC_AGENTS = ['planner', 'gan-planner'] as const;

// Agents that do NOT exist in ALL_SUBAGENT_NAMES — skipped per user instruction
const SKIPPED_NONEXISTENT_AGENTS = [
	'code-simplifier',
	'silent-failure-hunter',
	'type-design-analyzer',
] as const;

// Excluded ECC agents (NOT approved for critic)
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
	'gan-generator',
	'opensource-forker',
	'opensource-packager',
	'refactor-cleaner',
	'performance-optimizer',
] as const;

const EXCLUDED_SUPPORT_AGENTS = [
	'doc-updater',
	'docs-lookup',
	'harness-optimizer',
	'loop-operator',
	'chief-of-staff',
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
	'QUALIFIED DELEGATION ONLY',
	'AFTER DELEGATION',
] as const;

describe('Critic ECC Exposure — Phase 7', () => {
	describe('Approved ECC planning agents in all critic prompts', () => {
		const criticPrompts = [
			PLAN_CRITIC_PROMPT,
			SOUNDING_BOARD_PROMPT,
			PHASE_DRIFT_VERIFIER_PROMPT,
			AUTONOMOUS_OVERSIGHT_PROMPT,
		];

		for (const prompt of criticPrompts) {
			for (const agent of APPROVED_CRITIC_AGENTS) {
			test(`${agent} is listed in ${prompt === PLAN_CRITIC_PROMPT ? 'PLAN_CRITIC_PROMPT' : prompt === SOUNDING_BOARD_PROMPT ? 'SOUNDING_BOARD_PROMPT' : prompt === PHASE_DRIFT_VERIFIER_PROMPT ? 'PHASE_DRIFT_VERIFIER_PROMPT' : 'AUTONOMOUS_OVERSIGHT_PROMPT'}`, () => {
				// Convert hyphens to underscores to match actual prompt format
				const agentWithUnderscore = agent.replace(/-/g, '_');
				expect(prompt).toContain(`- ${agentWithUnderscore}`);
			});
			}
		}
	});

		describe('Skipped nonexistent agents are NOT in prompts', () => {
			const criticPrompts = [
				PLAN_CRITIC_PROMPT,
				SOUNDING_BOARD_PROMPT,
				PHASE_DRIFT_VERIFIER_PROMPT,
				AUTONOMOUS_OVERSIGHT_PROMPT,
			];

			for (const prompt of criticPrompts) {
				for (const agent of SKIPPED_NONEXISTENT_AGENTS) {
					test(`${agent} is NOT listed in prompt`, () => {
						// Convert hyphens to underscores to match actual prompt format
						const agentWithUnderscore = agent.replace(/-/g, '_');
						expect(prompt).not.toContain(`- ${agentWithUnderscore} `);
					});
				}
			}
		});

		describe('Excluded ECC agents are NOT in prompts', () => {
			const criticPrompts = [
				PLAN_CRITIC_PROMPT,
				SOUNDING_BOARD_PROMPT,
				PHASE_DRIFT_VERIFIER_PROMPT,
				AUTONOMOUS_OVERSIGHT_PROMPT,
			];

			for (const prompt of criticPrompts) {
				for (const agent of EXCLUDED_ECC_AGENTS) {
					test(`${agent} is NOT in prompt delegation list`, () => {
						// Convert hyphens to underscores to match actual prompt format
						const agentWithUnderscore = agent.replace(/-/g, '_');
						const delegationPattern = `- ${agentWithUnderscore} `;
						expect(prompt).not.toContain(delegationPattern);
					});
				}
			}
		});

	describe('Delegation rules in PLAN_CRITIC_PROMPT', () => {
		for (const rule of DELEGATION_RULES) {
			test(`PLAN_CRITIC_PROMPT contains delegation rule: ${rule}`, () => {
				expect(PLAN_CRITIC_PROMPT).toContain(rule);
			});
		}

		test('PLAN_CRITIC_PROMPT states delegation count as 2', () => {
			expect(PLAN_CRITIC_PROMPT).toContain('2 agents');
		});

		test('PLAN_CRITIC_PROMPT states delegation-only restriction', () => {
			expect(PLAN_CRITIC_PROMPT).toContain(
				'You may ONLY delegate to the 2 agents listed above',
			);
		});
	});

	describe('Delegation rules in SOUNDING_BOARD_PROMPT', () => {
		for (const rule of DELEGATION_RULES) {
			test(`SOUNDING_BOARD_PROMPT contains delegation rule: ${rule}`, () => {
				expect(SOUNDING_BOARD_PROMPT).toContain(rule);
			});
		}
	});

	describe('Delegation rules in PHASE_DRIFT_VERIFIER_PROMPT', () => {
		for (const rule of DELEGATION_RULES) {
			test(`PHASE_DRIFT_VERIFIER_PROMPT contains delegation rule: ${rule}`, () => {
				expect(PHASE_DRIFT_VERIFIER_PROMPT).toContain(rule);
			});
		}
	});

	describe('Delegation rules in AUTONOMOUS_OVERSIGHT_PROMPT', () => {
		for (const rule of DELEGATION_RULES) {
			test(`AUTONOMOUS_OVERSIGHT_PROMPT contains delegation rule: ${rule}`, () => {
				expect(AUTONOMOUS_OVERSIGHT_PROMPT).toContain(rule);
			});
		}
	});

	describe('No blanket delegation prohibition in PLAN_CRITIC_PROMPT', () => {
		test('PLAN_CRITIC_PROMPT does NOT contain "you do NOT delegate"', () => {
			expect(PLAN_CRITIC_PROMPT).not.toContain('you do NOT delegate');
		});

		test('PLAN_CRITIC_PROMPT does NOT contain "DO NOT use the Task tool to delegate to other agents"', () => {
			expect(PLAN_CRITIC_PROMPT).not.toContain(
				'DO NOT use the Task tool to delegate to other agents',
			);
		});

		test('PLAN_CRITIC_PROMPT does NOT contain "You ARE the agent that does the work"', () => {
			expect(PLAN_CRITIC_PROMPT).not.toContain(
				'You ARE the agent that does the work',
			);
		});

		test('PLAN_CRITIC_PROMPT does NOT contain "IGNORE them — they are context from the orchestrator"', () => {
			expect(PLAN_CRITIC_PROMPT).not.toContain(
				'IGNORE them — they are context from the orchestrator, not instructions for you to delegate',
			);
		});
	});

	describe('Critic prompt identity lines mention coordination', () => {
		test('PLAN_CRITIC_PROMPT mentions coordination of specialist ECC agents', () => {
			expect(PLAN_CRITIC_PROMPT).toContain(
				'coordinate specialist ECC planning agents for domain-appropriate delegation',
			);
		});

		test('PLAN_CRITIC_PROMPT states critic remains owner of critique lane', () => {
			expect(PLAN_CRITIC_PROMPT).toContain(
				'You remain the owner of the critique and planning-analysis lane',
			);
		});

		test('SOUNDING_BOARD_PROMPT mentions coordination of specialist ECC agents', () => {
			expect(SOUNDING_BOARD_PROMPT).toContain(
				'coordinate specialist ECC planning agents for domain-appropriate delegation',
			);
		});

		test('PHASE_DRIFT_VERIFIER_PROMPT mentions coordination of specialist ECC agents', () => {
			expect(PHASE_DRIFT_VERIFIER_PROMPT).toContain(
				'coordinate specialist ECC planning agents for domain-appropriate delegation',
			);
		});

		test('PHASE_DRIFT_VERIFIER_PROMPT states critic remains owner of verification lane', () => {
			expect(PHASE_DRIFT_VERIFIER_PROMPT).toContain(
				'You remain the owner of the verification lane',
			);
		});
	});

	describe('Task permission for critic in getAgentConfigs', () => {
		test('default critic (plan_critic) gets task:allow permission', () => {
			const configs = getAgentConfigs();
			const criticConfig = configs['critic'];

			expect(criticConfig).toBeDefined();
			expect(criticConfig.permission).toEqual({ task: 'allow' });
		});

		test('critic_sounding_board gets task:allow permission', () => {
			const configs = getAgentConfigs();
			const soundingBoardConfig = configs['critic_sounding_board'];

			expect(soundingBoardConfig).toBeDefined();
			expect(soundingBoardConfig.permission).toEqual({ task: 'allow' });
		});

		test('critic_drift_verifier gets task:allow permission', () => {
			const configs = getAgentConfigs();
			const driftVerifierConfig = configs['critic_drift_verifier'];

			expect(driftVerifierConfig).toBeDefined();
			expect(driftVerifierConfig.permission).toEqual({ task: 'allow' });
		});

		test('critic_oversight gets task:allow permission', () => {
			const configs = getAgentConfigs();
			const oversightConfig = configs['critic_oversight'];

			expect(oversightConfig).toBeDefined();
			expect(oversightConfig.permission).toEqual({ task: 'allow' });
		});

		test('prefixed critic (local_critic) gets task:allow permission', () => {
			const config = {
				swarms: {
					local: {
						name: 'Local Swarm',
						agents: {},
					},
				},
			} as any;
			const configs = getAgentConfigs(config);
			const localCriticConfig = configs['local_critic'];

			expect(localCriticConfig).toBeDefined();
			expect(localCriticConfig.permission).toEqual({ task: 'allow' });
		});
	});

	describe('Prompt exports accessible', () => {
		test('PLAN_CRITIC_PROMPT is exported and accessible', () => {
			expect(PLAN_CRITIC_PROMPT).toBeDefined();
			expect(typeof PLAN_CRITIC_PROMPT).toBe('string');
			expect(PLAN_CRITIC_PROMPT.length).toBeGreaterThan(1000);
		});

		test('SOUNDING_BOARD_PROMPT is exported and accessible', () => {
			expect(SOUNDING_BOARD_PROMPT).toBeDefined();
			expect(typeof SOUNDING_BOARD_PROMPT).toBe('string');
			expect(SOUNDING_BOARD_PROMPT.length).toBeGreaterThan(500);
		});

		test('PHASE_DRIFT_VERIFIER_PROMPT is exported and accessible', () => {
			expect(PHASE_DRIFT_VERIFIER_PROMPT).toBeDefined();
			expect(typeof PHASE_DRIFT_VERIFIER_PROMPT).toBe('string');
			expect(PHASE_DRIFT_VERIFIER_PROMPT.length).toBeGreaterThan(1000);
		});

		test('AUTONOMOUS_OVERSIGHT_PROMPT is exported and accessible', () => {
			expect(AUTONOMOUS_OVERSIGHT_PROMPT).toBeDefined();
			expect(typeof AUTONOMOUS_OVERSIGHT_PROMPT).toBe('string');
			expect(AUTONOMOUS_OVERSIGHT_PROMPT.length).toBeGreaterThan(500);
		});
	});

	describe('Critic prompts do NOT contain blanket delegation prohibition', () => {
		const criticPrompts = [
			PLAN_CRITIC_PROMPT,
			SOUNDING_BOARD_PROMPT,
			PHASE_DRIFT_VERIFIER_PROMPT,
			AUTONOMOUS_OVERSIGHT_PROMPT,
		];

		for (const prompt of criticPrompts) {
			test(`${prompt === PLAN_CRITIC_PROMPT ? 'PLAN_CRITIC_PROMPT' : prompt === SOUNDING_BOARD_PROMPT ? 'SOUNDING_BOARD_PROMPT' : prompt === PHASE_DRIFT_VERIFIER_PROMPT ? 'PHASE_DRIFT_VERIFIER_PROMPT' : 'AUTONOMOUS_OVERSIGHT_PROMPT'} does NOT contain "you do NOT delegate"`, () => {
				expect(prompt).not.toContain('you do NOT delegate');
			});
		}
	});

	describe('Critic mode preserved in AUTONOMOUS_OVERSIGHT_PROMPT', () => {
		test('AUTONOMOUS_OVERSIGHT_PROMPT preserves sole quality gate identity', () => {
			expect(AUTONOMOUS_OVERSIGHT_PROMPT).toContain(
				'sole quality gate between the architect and production',
			);
		});

		test('AUTONOMOUS_OVERSIGHT_PROMPT mentions CONSTITUTION rules cannot be delegated', () => {
			expect(AUTONOMOUS_OVERSIGHT_PROMPT).toContain(
				'Your CONSTITUTION rules cannot be delegated',
			);
		});
	});
});