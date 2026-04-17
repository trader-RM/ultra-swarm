import { describe, expect, test } from 'bun:test';
import OpenCodeSwarm from './index';

const mockPluginInput = {
	client: {} as any,
	project: {} as any,
	directory: process.cwd(),
	worktree: process.cwd(),
	serverUrl: new URL('http://localhost:3000'),
	$: {} as any,
};

describe('OpenCodeSwarm config agent merge', () => {
	test('merges agents into existing opencodeConfig.agent without replacing it', async () => {
		const plugin = await OpenCodeSwarm(mockPluginInput as any);
		expect(plugin).toBeDefined();
		expect(plugin).toHaveProperty('config');
		expect(typeof plugin.config).toBe('function');

		const existingAgents: Record<string, unknown> = {
			sentinel_agent: { model: 'sentinel' },
		};
		const beforeCount = Object.keys(existingAgents).length;

		const opencodeConfig: Record<string, unknown> = {
			agent: existingAgents,
			default_agent: 'keep-default-agent',
		};

		await plugin.config?.(opencodeConfig);

		// Merge path must not replace the existing object
		expect(opencodeConfig.agent).toBe(existingAgents);
		// Sentinel key must remain
		expect((opencodeConfig.agent as any).sentinel_agent).toBeDefined();
		// At least one new agent config must be merged in
		expect(Object.keys(existingAgents).length).toBeGreaterThan(beforeCount);
		// default_agent must not be overridden
		expect(opencodeConfig.default_agent).toBe('keep-default-agent');
	});
});