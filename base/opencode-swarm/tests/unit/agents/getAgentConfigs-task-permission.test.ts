import { describe, expect, test } from 'bun:test';
import { getAgentConfigs } from '../../../src/agents';
import type { PluginConfig } from '../../../src/config';

// Helper to create minimal valid PluginConfig
const minimalConfig = (partial: Partial<PluginConfig> = {}): PluginConfig =>
	partial as PluginConfig;

describe('getAgentConfigs - Architect Task Permission Hotfix', () => {
	describe('architect agents get task:allow permission', () => {
		test('default architect (no prefix) gets mode:primary and task:allow permission', () => {
			const configs = getAgentConfigs();
			const architectConfig = configs['architect'];

			expect(architectConfig).toBeDefined();
			expect(architectConfig.mode).toBe('primary');
			expect(architectConfig.permission).toEqual({ task: 'allow' });
		});

		test('cloud_architect gets mode:primary and task:allow permission', () => {
			const config = minimalConfig({
				swarms: {
					cloud: {
						name: 'Cloud Swarm',
						agents: {},
					},
				},
			});
			const configs = getAgentConfigs(config);
			const cloudArchitectConfig = configs['cloud_architect'];

			expect(cloudArchitectConfig).toBeDefined();
			expect(cloudArchitectConfig.mode).toBe('primary');
			expect(cloudArchitectConfig.permission).toEqual({ task: 'allow' });
		});

		test('local_architect gets mode:primary and task:allow permission', () => {
			const config = minimalConfig({
				swarms: {
					local: {
						name: 'Local Swarm',
						agents: {},
					},
				},
			});
			const configs = getAgentConfigs(config);
			const localArchitectConfig = configs['local_architect'];

			expect(localArchitectConfig).toBeDefined();
			expect(localArchitectConfig.mode).toBe('primary');
			expect(localArchitectConfig.permission).toEqual({ task: 'allow' });
		});
	});

	describe('non-architect agents remain subagents (coder gets task:allow for ECC delegation)', () => {
		test('default coder gets mode:subagent with task:allow permission (ECC delegation)', () => {
			const configs = getAgentConfigs();
			const coderConfig = configs['coder'];

			expect(coderConfig).toBeDefined();
			expect(coderConfig.mode).toBe('subagent');
			// Coder gets task:allow for ECC build resolver and gan_generator delegation
			expect(coderConfig.permission).toEqual({ task: 'allow' });
		});

		test('cloud_coder gets mode:subagent with task:allow permission (ECC delegation)', () => {
			const config = minimalConfig({
				swarms: {
					cloud: {
						name: 'Cloud Swarm',
						agents: {},
					},
				},
			});
			const configs = getAgentConfigs(config);
			const cloudCoderConfig = configs['cloud_coder'];

			expect(cloudCoderConfig).toBeDefined();
			expect(cloudCoderConfig.mode).toBe('subagent');
			expect(cloudCoderConfig.permission).toEqual({ task: 'allow' });
		});

		test('local_reviewer gets mode:subagent without task permission', () => {
			const config = minimalConfig({
				swarms: {
					local: {
						name: 'Local Swarm',
						agents: {},
					},
				},
			});
			const configs = getAgentConfigs(config);
			const localReviewerConfig = configs['local_reviewer'];

			expect(localReviewerConfig).toBeDefined();
			expect(localReviewerConfig.mode).toBe('subagent');
			expect(localReviewerConfig.permission).toBeUndefined();
		});

		test('explorer gets mode:subagent without task permission', () => {
			const configs = getAgentConfigs();
			const explorerConfig = configs['explorer'];

			expect(explorerConfig).toBeDefined();
			expect(explorerConfig.mode).toBe('subagent');
			expect(explorerConfig.permission).toBeUndefined();
		});

		test('sme gets mode:subagent without task permission', () => {
			const configs = getAgentConfigs();
			const smeConfig = configs['sme'];

			expect(smeConfig).toBeDefined();
			expect(smeConfig.mode).toBe('subagent');
			expect(smeConfig.permission).toBeUndefined();
		});

		test('test_engineer gets mode:subagent without task permission', () => {
			const configs = getAgentConfigs();
			const testEngineerConfig = configs['test_engineer'];

			expect(testEngineerConfig).toBeDefined();
			expect(testEngineerConfig.mode).toBe('subagent');
			expect(testEngineerConfig.permission).toBeUndefined();
		});

		// Adversarial: ECC agents that are NOT coder must NOT get task:allow
		// This verifies that the baseAgentName check prevents false positives
		// (e.g., build_error_resolver, cpp_reviewer, etc. must NOT get task permission)
		test('ECC build_error_resolver gets mode:subagent without task permission', () => {
			const configs = getAgentConfigs();
			const buildResolver = configs['build_error_resolver'];

			expect(buildResolver).toBeDefined();
			expect(buildResolver.mode).toBe('subagent');
			expect(buildResolver.permission).toBeUndefined();
		});

		test('ECC cpp_reviewer gets mode:subagent without task permission', () => {
			const configs = getAgentConfigs();
			const cppReviewer = configs['cpp_reviewer'];

			expect(cppReviewer).toBeDefined();
			expect(cppReviewer.mode).toBe('subagent');
			expect(cppReviewer.permission).toBeUndefined();
		});

		test('ECC gan_generator gets mode:subagent without task permission', () => {
			const configs = getAgentConfigs();
			const ganGenerator = configs['gan_generator'];

			expect(ganGenerator).toBeDefined();
			expect(ganGenerator.mode).toBe('subagent');
			expect(ganGenerator.permission).toBeUndefined();
		});
	});

	describe('multiple swarm scenarios', () => {
		test('both default and cloud swarms have correct architect permissions', () => {
			const config = minimalConfig({
				swarms: {
					default: {
						name: 'Default Swarm',
						agents: {},
					},
					cloud: {
						name: 'Cloud Swarm',
						agents: {},
					},
				},
			});
			const configs = getAgentConfigs(config);

			// Default swarm architect
			const defaultArchitect = configs['architect'];
			expect(defaultArchitect.mode).toBe('primary');
			expect(defaultArchitect.permission).toEqual({ task: 'allow' });

			// Cloud swarm architect
			const cloudArchitect = configs['cloud_architect'];
			expect(cloudArchitect.mode).toBe('primary');
			expect(cloudArchitect.permission).toEqual({ task: 'allow' });

			// Non-architects in both swarms should be subagents
			expect(configs['coder'].mode).toBe('subagent');
			expect(configs['cloud_coder'].mode).toBe('subagent');
		});
	});
});
