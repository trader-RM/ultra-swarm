import { describe, expect, test } from 'bun:test';
import { createAgents } from '../../../src/agents/index';
import { AGENT_CATEGORY, getAgentCategory } from '../../../src/config/agent-categories';
import {
	ALL_SUBAGENT_NAMES,
	AGENT_TOOL_MAP,
	DEFAULT_MODELS,
} from '../../../src/config/constants';

describe('Swarm Agent Constants Adversarial Registration', () => {
	test('ECC agents are NOT in ALL_SUBAGENT_NAMES', () => {
		const eccAgents = ['a11y_architect', 'seo_specialist'];
		for (const agent of eccAgents) {
			expect(ALL_SUBAGENT_NAMES).not.toContain(agent);
		}
	});

	test('ECC agents do NOT have AGENT_TOOL_MAP entries', () => {
		expect(AGENT_TOOL_MAP['a11y_architect']).toBeUndefined();
		expect(AGENT_TOOL_MAP['seo_specialist']).toBeUndefined();
	});

	test('ECC agents do NOT have DEFAULT_MODELS entries', () => {
		expect(DEFAULT_MODELS['a11y_architect']).toBeUndefined();
		expect(DEFAULT_MODELS['seo_specialist']).toBeUndefined();
	});

	test('ECC agents do NOT have AGENT_CATEGORY entries', () => {
		expect(AGENT_CATEGORY['a11y_architect']).toBeUndefined();
		expect(AGENT_CATEGORY['seo_specialist']).toBeUndefined();
	});

	test('AGENT_CATEGORY total entries is 14 (13 subagents + architect)', () => {
		const totalEntries = Object.keys(AGENT_CATEGORY).length;
		expect(totalEntries).toBe(14);
	});

	test('createAgents does NOT register ECC agents', () => {
		const agents = createAgents({});
		const names = agents.map(a => a.name);
		expect(names).not.toContain('a11y_architect');
		expect(names).not.toContain('seo_specialist');
	});

	test('createAgents registers only Swarm agents (13 by default)', () => {
		const agents = createAgents({});
		expect(agents).toHaveLength(13);
	});

	test('Swarm agents have correct categories', () => {
		expect(getAgentCategory('reviewer')).toBe('qa');
		expect(getAgentCategory('coder')).toBe('pipeline');
		expect(getAgentCategory('explorer')).toBe('pipeline');
		expect(getAgentCategory('sme')).toBe('support');
	});
});