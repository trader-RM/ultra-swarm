import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createAgents, getAgentConfigs } from '../../../src/agents';
import type { PluginConfig } from '../../../src/config';

let originalXDG: string | undefined;
let tempDir: string | undefined;

beforeEach(() => {
	originalXDG = process.env.XDG_CONFIG_HOME;
	tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'factory-test-'));
	process.env.XDG_CONFIG_HOME = tempDir;
});

afterEach(() => {
	if (originalXDG === undefined) delete process.env.XDG_CONFIG_HOME;
	else process.env.XDG_CONFIG_HOME = originalXDG;
	if (tempDir) {
		fs.rmSync(tempDir, { recursive: true, force: true });
		tempDir = undefined;
	}
});

describe('createAgents', () => {
	describe('no config', () => {
	it('returns 60 agents (15 native + 45 ECC, docs enabled by default, designer opt-in)', () => {
		const agents = createAgents();
		expect(agents).toHaveLength(60);
	});

		it('agent names are correct', () => {
			const agents = createAgents();
			const names = agents.map((a) => a.name).sort();
			expect(names).toEqual([
				'a11y_architect',
				'architect',
				'build_error_resolver',
				'chief_of_staff',
				'code_architect',
				'code_explorer',
				'code_reviewer',
				'code_simplifier',
				'coder',
				'comment_analyzer',
				'conversation_analyzer',
				'cpp_build_resolver',
				'cpp_reviewer',
				'critic',
				'critic_drift_verifier',
				'critic_oversight',
				'critic_sounding_board',
				'csharp_reviewer',
				'curator_init',
				'curator_phase',
				'dart_build_resolver',
				'database_reviewer',
				'doc_updater',
				'docs',
				'docs_lookup',
				'e2e_runner',
				'explorer',
				'flutter_reviewer',
				'gan_evaluator',
				'gan_generator',
				'gan_planner',
				'go_build_resolver',
				'go_reviewer',
				'harness_optimizer',
				'healthcare_reviewer',
				'java_build_resolver',
				'java_reviewer',
				'kotlin_build_resolver',
				'kotlin_reviewer',
				'loop_operator',
				'opensource_forker',
				'opensource_packager',
				'opensource_sanitizer',
				'performance_optimizer',
				'planner',
				'pr_test_analyzer',
				'python_reviewer',
				'pytorch_build_resolver',
				'refactor_cleaner',
				'reviewer',
				'rust_build_resolver',
				'rust_reviewer',
				'security_reviewer',
				'seo_specialist',
				'silent_failure_hunter',
				'sme',
				'tdd_guide',
				'test_engineer',
				'type_design_analyzer',
				'typescript_reviewer',
				// Note: designer is opt-in (ui_review.enabled=true), not included by default
			]);
		});

		it('each agent has temperature, prompt, description', () => {
			const agents = createAgents();

			for (const agent of agents) {
				expect(agent).toHaveProperty('name');
				expect(agent).toHaveProperty('config');
				expect(agent.config).toHaveProperty('temperature');
				expect(agent.config).toHaveProperty('prompt');
				expect(agent).toHaveProperty('description');

				// Verify properties are not empty
				expect(agent.name.length).toBeGreaterThan(0);
				expect(typeof agent.config.temperature).toBe('number');
				expect(agent.config.temperature).toBeGreaterThanOrEqual(0);
				expect(agent.config.temperature).toBeLessThanOrEqual(2);
				expect(agent.config.prompt?.length ?? 0).toBeGreaterThan(0);
				expect(agent.description?.length ?? 0).toBeGreaterThan(0);
			}
		});

		it('each subagent has model (primary agents created with model but getAgentConfigs strips it)', () => {
			const agents = createAgents();

			for (const agent of agents) {
				// All agents initially have model in their config
				expect(agent.config).toHaveProperty('model');
				expect(agent.config.model?.length ?? 0).toBeGreaterThan(0);
			}
		});
	});

	describe('with agent overrides', () => {
		it('model override applies correctly', () => {
			const config = {
				agents: {
					coder: {
						model: 'custom/model',
					},
				},
			};

			const agents = createAgents(config as unknown as PluginConfig);
			const coder = agents.find((a) => a.name === 'coder');
			expect(coder?.config.model).toBe('custom/model');
		});

		it('temperature override applies correctly', () => {
			const config = {
				agents: {
					coder: {
						temperature: 0.5,
					},
				},
			};

			const agents = createAgents(config as unknown as PluginConfig);
			const coder = agents.find((a) => a.name === 'coder');
			expect(coder?.config.temperature).toBe(0.5);
		});

		it('disabled agent is filtered out', () => {
			const config = {
				agents: {
					sme: {
						disabled: true,
					},
				},
			};

			const agents = createAgents(config as unknown as PluginConfig);
			const sme = agents.find((a) => a.name === 'sme');
			expect(sme).toBeUndefined();
			// 60 agents - 1 disabled = 59 agents (docs still included by default)
			expect(agents).toHaveLength(59);
		});
	});

	describe('with swarms', () => {
		it('single swarm named default has no prefix', () => {
			const config = {
				swarms: {
					default: {},
				},
			};

			const agents = createAgents(config as unknown as PluginConfig);
			const names = agents.map((a) => a.name).sort();
			expect(names).toEqual([
				'a11y_architect',
				'architect',
				'build_error_resolver',
				'chief_of_staff',
				'code_architect',
				'code_explorer',
				'code_reviewer',
				'code_simplifier',
				'coder',
				'comment_analyzer',
				'conversation_analyzer',
				'cpp_build_resolver',
				'cpp_reviewer',
				'critic',
				'critic_drift_verifier',
				'critic_oversight',
				'critic_sounding_board',
				'csharp_reviewer',
				'curator_init',
				'curator_phase',
				'dart_build_resolver',
				'database_reviewer',
				'doc_updater',
				'docs',
				'docs_lookup',
				'e2e_runner',
				'explorer',
				'flutter_reviewer',
				'gan_evaluator',
				'gan_generator',
				'gan_planner',
				'go_build_resolver',
				'go_reviewer',
				'harness_optimizer',
				'healthcare_reviewer',
				'java_build_resolver',
				'java_reviewer',
				'kotlin_build_resolver',
				'kotlin_reviewer',
				'loop_operator',
				'opensource_forker',
				'opensource_packager',
				'opensource_sanitizer',
				'performance_optimizer',
				'planner',
				'pr_test_analyzer',
				'python_reviewer',
				'pytorch_build_resolver',
				'refactor_cleaner',
				'reviewer',
				'rust_build_resolver',
				'rust_reviewer',
				'security_reviewer',
				'seo_specialist',
				'silent_failure_hunter',
				'sme',
				'tdd_guide',
				'test_engineer',
				'type_design_analyzer',
				'typescript_reviewer',
				// Note: designer is opt-in, not included by default
			]);
		});

		it('single named swarm adds prefix to all agents', () => {
			const config = {
				swarms: {
					local: {
						name: 'Local',
					},
				},
			};

			const agents = createAgents(config as unknown as PluginConfig);
			const names = agents.map((a) => a.name).sort();
			expect(names).toEqual([
				'local_a11y_architect',
				'local_architect',
				'local_build_error_resolver',
				'local_chief_of_staff',
				'local_code_architect',
				'local_code_explorer',
				'local_code_reviewer',
				'local_code_simplifier',
				'local_coder',
				'local_comment_analyzer',
				'local_conversation_analyzer',
				'local_cpp_build_resolver',
				'local_cpp_reviewer',
				'local_critic',
				'local_critic_drift_verifier',
				'local_critic_oversight',
				'local_critic_sounding_board',
				'local_csharp_reviewer',
				'local_curator_init',
				'local_curator_phase',
				'local_dart_build_resolver',
				'local_database_reviewer',
				'local_doc_updater',
				'local_docs',
				'local_docs_lookup',
				'local_e2e_runner',
				'local_explorer',
				'local_flutter_reviewer',
				'local_gan_evaluator',
				'local_gan_generator',
				'local_gan_planner',
				'local_go_build_resolver',
				'local_go_reviewer',
				'local_harness_optimizer',
				'local_healthcare_reviewer',
				'local_java_build_resolver',
				'local_java_reviewer',
				'local_kotlin_build_resolver',
				'local_kotlin_reviewer',
				'local_loop_operator',
				'local_opensource_forker',
				'local_opensource_packager',
				'local_opensource_sanitizer',
				'local_performance_optimizer',
				'local_planner',
				'local_pr_test_analyzer',
				'local_python_reviewer',
				'local_pytorch_build_resolver',
				'local_refactor_cleaner',
				'local_reviewer',
				'local_rust_build_resolver',
				'local_rust_reviewer',
				'local_security_reviewer',
				'local_seo_specialist',
				'local_silent_failure_hunter',
				'local_sme',
				'local_tdd_guide',
				'local_test_engineer',
				'local_type_design_analyzer',
				'local_typescript_reviewer',
				// Note: designer is opt-in, not included by default
			]);
		});

		it('architect prompt contains swarm header for non-default swarms', () => {
			const config = {
				swarms: {
					cloud: {
						name: 'Cloud',
					},
				},
			};

			const agents = createAgents(config as unknown as PluginConfig);
			const cloudArchitect = agents.find((a) => a.name === 'cloud_architect');
			expect(cloudArchitect?.description).toContain('[Cloud]');
			expect(cloudArchitect?.config.prompt).toContain(
				'## ⚠️ YOU ARE THE CLOUD SWARM ARCHITECT',
			);
			expect(cloudArchitect?.config.prompt).toContain('cloud_');
		});
	});

	describe('architect template replacement', () => {
		it('default swarm replaces SWARM_ID with "default"', () => {
			const agents = createAgents();
			const architect = agents.find((a) => a.name === 'architect');
			expect(architect?.config.prompt).toContain('Swarm: default');
			expect(architect?.config.prompt).not.toContain('{{SWARM_ID}}');
		});

		it('default swarm replaces AGENT_PREFIX with empty string', () => {
			const agents = createAgents();
			const architect = agents.find((a) => a.name === 'architect');
			expect(architect?.config.prompt).not.toContain('{{AGENT_PREFIX}}');
		});

		it('default swarm replaces QA_RETRY_LIMIT with default value 3', () => {
			const agents = createAgents();
			const architect = agents.find((a) => a.name === 'architect');
			expect(architect?.config.prompt).toContain('3');
			expect(architect?.config.prompt).not.toContain('{{QA_RETRY_LIMIT}}');
		});

		it('custom qa_retry_limit replaces correctly', () => {
			const config = {
				qa_retry_limit: 5,
			};

			const agents = createAgents(config as unknown as PluginConfig);
			const architect = agents.find((a) => a.name === 'architect');
			expect(architect?.config.prompt).toContain('5');
			expect(architect?.config.prompt).not.toContain('{{QA_RETRY_LIMIT}}');
		});
	});
});

describe('getAgentConfigs', () => {
	it('returns Record<string, SDKAgentConfig>', () => {
		const configs = getAgentConfigs();
		expect(typeof configs).toBe('object');
		expect(configs).not.toBeNull();

		for (const [name, config] of Object.entries(configs)) {
			expect(typeof name).toBe('string');
			expect(name.length).toBeGreaterThan(0);
			expect(config).toHaveProperty('temperature');
			expect(config).toHaveProperty('prompt');
			expect(config).toHaveProperty('description');
			expect(config).toHaveProperty('mode');
		}
	});

	it('primary agents omit model (architect and *_architect)', () => {
		const configs = getAgentConfigs();

		// architect is a primary agent
		expect(configs.architect).not.toHaveProperty('model');

		// Verify other agents have model (they are subagents)
		for (const [name, config] of Object.entries(configs)) {
			if (name !== 'architect') {
				expect(config).toHaveProperty('model');
			}
		}
	});

	it('subagents retain model', () => {
		const configs = getAgentConfigs();

		for (const [name, config] of Object.entries(configs)) {
			if (config.mode === 'subagent') {
				expect(config).toHaveProperty('model');
				expect(config.model?.length ?? 0).toBeGreaterThan(0);
			}
		}
	});

	it('prefixed architect configs omit model', () => {
		const config = {
			swarms: {
				local: {
					name: 'Local',
				},
			},
		};

		const configs = getAgentConfigs(config as unknown as PluginConfig);

		// Prefixed architect should not have model
		const localArchitect = configs.local_architect;
		expect(localArchitect).not.toHaveProperty('model');

		// Other prefixed agents should have model
		const localCoder = configs.local_coder;
		expect(localCoder).toHaveProperty('model');
	});

	it('architect has mode primary', () => {
		const configs = getAgentConfigs();
		const architect = configs.architect;
		expect(architect.mode).toBe('primary');
	});

	it('all other agents have mode subagent', () => {
		const configs = getAgentConfigs();
		const agentNames = Object.keys(configs).filter(
			(name) => name !== 'architect',
		);

		for (const name of agentNames) {
			expect(configs[name].mode).toBe('subagent');
		}
	});

	it('each agent config includes description', () => {
		const configs = getAgentConfigs();

		for (const [name, config] of Object.entries(configs)) {
			expect(config.description?.length ?? 0).toBeGreaterThan(0);
		}
	});

	it('prefixed architect also has mode primary', () => {
		const config = {
			swarms: {
				local: {
					name: 'Local',
				},
			},
		};

		const configs = getAgentConfigs(config as unknown as PluginConfig);
		const localArchitect = configs.local_architect;
		expect(localArchitect.mode).toBe('primary');
	});

	it('handles agent overrides in getAgentConfigs', () => {
		const config = {
			agents: {
				coder: {
					model: 'custom/model',
					temperature: 0.7,
				},
			},
		};

		const configs = getAgentConfigs(config as unknown as PluginConfig);
		const coder = configs.coder;
		expect(coder.model).toBe('custom/model');
		expect(coder.temperature).toBe(0.7);
	});

	it('handles disabled agents in getAgentConfigs', () => {
		const config = {
			agents: {
				sme: {
					disabled: true,
				},
			},
		};

		const configs = getAgentConfigs(config as unknown as PluginConfig);
		expect(configs.sme).toBeUndefined();
		// 60 agents - 1 disabled = 59 agents (docs included by default)
		expect(Object.keys(configs)).toHaveLength(59);
	});
});
