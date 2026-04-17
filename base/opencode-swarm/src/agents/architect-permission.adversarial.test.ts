/**
 * Adversarial Tests for Architect Task-Permission Hotfix (Task 1.21)
 * Focus: Agent naming edge cases, prefix misclassification, permission leakage
 */

import { describe, expect, it } from 'bun:test';
import type { PluginConfig } from '../config';
import { stripKnownSwarmPrefix } from '../config/schema';
import { getAgentConfigs } from './index';

// Helper to create minimal valid PluginConfig (bypasses strict schema)
const minimalConfig = (partial: Partial<PluginConfig> = {}): PluginConfig =>
	partial as PluginConfig;

// Test helper: check if an agent has task permission
function hasTaskPermission(
	config: ReturnType<typeof getAgentConfigs>,
	agentName: string,
): boolean {
	const agentConfig = config[agentName];
	// Use type assertion to bypass SDK type checking
	const permission = agentConfig?.permission as { task?: string } | undefined;
	return permission?.task === 'allow';
}

// Test helper: check if an agent is primary mode
function isPrimaryMode(
	config: ReturnType<typeof getAgentConfigs>,
	agentName: string,
): boolean {
	const agentConfig = config[agentName];
	return agentConfig?.mode === 'primary';
}

describe('ADVERSARIAL: Architect Task Permission Edge Cases', () => {
	describe('Exact "architect" name matching', () => {
		it('should grant task permission for exact "architect" name (default swarm)', () => {
			const config = getAgentConfigs(undefined);
			// Default swarm creates unprefixed "architect"
			expect(hasTaskPermission(config, 'architect')).toBe(true);
			expect(isPrimaryMode(config, 'architect')).toBe(true);
		});

		it('should grant task permission to delegation-allowed agents in default swarm', () => {
			const config = getAgentConfigs(undefined);
			// Core agents with ECC delegation permission
			expect(hasTaskPermission(config, 'coder')).toBe(true);
			expect(hasTaskPermission(config, 'reviewer')).toBe(true);
			expect(hasTaskPermission(config, 'explorer')).toBe(true);
			expect(hasTaskPermission(config, 'sme')).toBe(true);
			expect(hasTaskPermission(config, 'test_engineer')).toBe(true);
			expect(hasTaskPermission(config, 'docs')).toBe(true);
			expect(hasTaskPermission(config, 'critic')).toBe(true);
			expect(hasTaskPermission(config, 'curator_init')).toBe(true);
			expect(hasTaskPermission(config, 'curator_phase')).toBe(true);
			// designer is ECC-only, not in default swarm — skipped here
		});
	});

	describe('Swarm-prefixed architect names (legitimate use case)', () => {
		it('should grant task permission for cloud_architect (cloud swarm)', () => {
			const config = getAgentConfigs(
				minimalConfig({
					swarms: {
						cloud: { name: 'Cloud Swarm', agents: {} },
					},
				}),
			);
			expect(hasTaskPermission(config, 'cloud_architect')).toBe(true);
			expect(isPrimaryMode(config, 'cloud_architect')).toBe(true);
		});

		it('should grant task permission for local_architect (local swarm)', () => {
			const config = getAgentConfigs(
				minimalConfig({
					swarms: {
						local: { name: 'Local Swarm', agents: {} },
					},
				}),
			);
			expect(hasTaskPermission(config, 'local_architect')).toBe(true);
			expect(isPrimaryMode(config, 'local_architect')).toBe(true);
		});

		it('should grant task permission for mega_architect (mega swarm)', () => {
			const config = getAgentConfigs(
				minimalConfig({
					swarms: {
						mega: { name: 'Mega Swarm', agents: {} },
					},
				}),
			);
			expect(hasTaskPermission(config, 'mega_architect')).toBe(true);
			expect(isPrimaryMode(config, 'mega_architect')).toBe(true);
		});

		it('should grant task permission for paid_architect (paid swarm)', () => {
			const config = getAgentConfigs(
				minimalConfig({
					swarms: {
						paid: { name: 'Paid Swarm', agents: {} },
					},
				}),
			);
			expect(hasTaskPermission(config, 'paid_architect')).toBe(true);
			expect(isPrimaryMode(config, 'paid_architect')).toBe(true);
		});

		it('should grant task permission to swarm-prefixed delegation-allowed agents', () => {
			const config = getAgentConfigs(
				minimalConfig({
					swarms: {
						cloud: { name: 'Cloud Swarm', agents: {} },
					},
				}),
			);
			// Core delegation-allowed agents get task permission when swarm-prefixed
			expect(hasTaskPermission(config, 'cloud_coder')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_reviewer')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_explorer')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_sme')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_critic')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_test_engineer')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_docs')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_curator_init')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_curator_phase')).toBe(true);
			// cloud_designer is ECC-only, not in default Cloud swarm — skipped here
		});
	});

	describe('String matching logic edge cases (stripKnownSwarmPrefix)', () => {
		const testCases = [
			['architect', 'architect', 'exact match resolves to architect base name'],
			['cloud_architect', 'architect', 'prefix_architect strips to architect'],
			['local_coder', 'coder', 'prefix_coder strips to coder'],
			['mega_reviewer', 'reviewer', 'prefix_reviewer strips to reviewer'],
			['architect_', 'architect_', 'does not match any ALL_AGENT_NAMES entry'],
			[
				'architect_extra',
				'architect_extra',
				'does not match any ALL_AGENT_NAMES entry',
			],
			[
				'not_an_architect',
				'architect',
				'Strategy 2 suffix match: ends with _architect which is a known agent name',
			],
			[
				'architected',
				'architected',
				'no underscore separator — "architected" not in ALL_AGENT_NAMES, returns original',
			],
			[
				'ARCHITECT',
				'architect',
				'case insensitive — normalized to lowercase, matches known agent',
			],
			[
				'Architect',
				'architect',
				'case insensitive — normalized to lowercase, matches known agent',
			],
			['', '', 'empty string returns empty'],
		] as const;

		testCases.forEach(([input, expectedBase, description]) => {
			it(`stripKnownSwarmPrefix("${input}") → "${expectedBase}" (${description})`, () => {
				expect(stripKnownSwarmPrefix(input)).toBe(expectedBase);
			});
		});
	});

	describe('Potential permission leakage vectors', () => {
		it('should grant task permission to coder and reviewer regardless of custom agent config', () => {
			const config = getAgentConfigs(
				minimalConfig({
					agents: {
						coder: { model: 'gpt-4' },
						reviewer: { model: 'gpt-4' },
					},
				}),
			);
			// Coder and reviewer get task:allow regardless of custom model config
			expect(hasTaskPermission(config, 'coder')).toBe(true);
			expect(hasTaskPermission(config, 'reviewer')).toBe(true);
		});

		it('should NOT grant task permission in legacy single-swarm mode with prefix', () => {
			// Legacy mode uses 'default' swarm - no prefix
			const config = getAgentConfigs(
				minimalConfig({
					agents: {
						architect: { model: 'gpt-4' },
					},
				}),
			);
			expect(hasTaskPermission(config, 'architect')).toBe(true);
			// But any prefixed names shouldn't appear
			expect(config.local_architect).toBeUndefined();
		});
	});

	describe('Multiple swarm interaction edge cases', () => {
		it('should correctly handle multiple swarms with different prefixes', () => {
			const config = getAgentConfigs(
				minimalConfig({
					swarms: {
						local: { name: 'Local', agents: {} },
						cloud: { name: 'Cloud', agents: {} },
						mega: { name: 'Mega', agents: {} },
					},
				}),
			);

			// All three swarm architects should have permission
			expect(hasTaskPermission(config, 'local_architect')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_architect')).toBe(true);
			expect(hasTaskPermission(config, 'mega_architect')).toBe(true);

			// Coder and reviewer get task permission for ECC delegation
			expect(hasTaskPermission(config, 'local_coder')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_coder')).toBe(true);
			expect(hasTaskPermission(config, 'mega_coder')).toBe(true);
			expect(hasTaskPermission(config, 'local_reviewer')).toBe(true);
			expect(hasTaskPermission(config, 'cloud_reviewer')).toBe(true);
			expect(hasTaskPermission(config, 'mega_reviewer')).toBe(true);
		});

		it('should handle "architect" as swarm name (edge case)', () => {
			// What if someone names a swarm "architect"?
			const config = getAgentConfigs(
				minimalConfig({
					swarms: {
						architect: { name: 'Architect Swarm', agents: {} },
					},
				}),
			);
			// The agent would be named "architect_architect" which ends with _architect
			// So it would get permission - this is correct behavior
			expect(hasTaskPermission(config, 'architect_architect')).toBe(true);
		});
	});

	describe('Permission object structure validation', () => {
		it('should set permission to { task: "allow" } for all delegation-allowed agents', () => {
			const config = getAgentConfigs(undefined);
			expect(config.architect?.permission as { task: string }).toEqual({
				task: 'allow',
			});
			expect(config.coder?.permission as { task: string }).toEqual({ task: 'allow' });
			expect(config.reviewer?.permission as { task: string }).toEqual({ task: 'allow' });
			expect(config.explorer?.permission as { task: string }).toEqual({ task: 'allow' });
			expect(config.sme?.permission as { task: string }).toEqual({ task: 'allow' });
			expect(config.test_engineer?.permission as { task: string }).toEqual({ task: 'allow' });
			expect(config.docs?.permission as { task: string }).toEqual({ task: 'allow' });
			// designer is ECC-only, not in default swarm — permissions checked in designer-specific tests
			expect(config.critic?.permission as { task: string }).toEqual({ task: 'allow' });
			expect(config.curator_init?.permission as { task: string }).toEqual({ task: 'allow' });
			expect(config.curator_phase?.permission as { task: string }).toEqual({ task: 'allow' });
		});

		it('should set mode to "primary" for architect, "subagent" for others', () => {
			const config = getAgentConfigs(undefined);
			expect(config.architect?.mode).toBe('primary');
			expect(config.coder?.mode).toBe('subagent');
			expect(config.reviewer?.mode).toBe('subagent');
		});
	});
});
