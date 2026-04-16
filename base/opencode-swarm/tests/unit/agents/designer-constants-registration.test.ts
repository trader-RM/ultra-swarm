import { describe, expect, test } from 'bun:test';
import {
	ALL_SUBAGENT_NAMES,
	AGENT_TOOL_MAP,
	DEFAULT_MODELS,
} from '../../../src/config/constants';

describe('Agent Registration Constants', () => {
	test('a11y_architect is registered in ALL_SUBAGENT_NAMES', () => {
		expect(ALL_SUBAGENT_NAMES).toContain('a11y_architect');
	});

	test('seo_specialist is registered in ALL_SUBAGENT_NAMES', () => {
		expect(ALL_SUBAGENT_NAMES).toContain('seo_specialist');
	});

	test('a11y_architect has AGENT_TOOL_MAP entry with expected tools', () => {
		const tools = AGENT_TOOL_MAP['a11y_architect'];
		expect(tools).toBeDefined();
		expect(Array.isArray(tools)).toBe(true);
		expect(tools).toContain('complexity_hotspots');
		expect(tools).toContain('repo_map');
		expect(tools).toContain('knowledge_recall');
	});

	test('seo_specialist has AGENT_TOOL_MAP entry with expected tools', () => {
		const tools = AGENT_TOOL_MAP['seo_specialist'];
		expect(tools).toBeDefined();
		expect(Array.isArray(tools)).toBe(true);
		expect(tools).toContain('complexity_hotspots');
		expect(tools).toContain('repo_map');
		expect(tools).toContain('knowledge_recall');
	});

	test('a11y_architect has DEFAULT_MODELS entry', () => {
		expect(DEFAULT_MODELS['a11y_architect']).toBe('opencode/trinity-large-preview-free');
	});

	test('seo_specialist has DEFAULT_MODELS entry', () => {
		expect(DEFAULT_MODELS['seo_specialist']).toBe('opencode/trinity-large-preview-free');
	});

	test('Total agent count in ALL_SUBAGENT_NAMES is 59', () => {
		expect(ALL_SUBAGENT_NAMES.length).toBe(59);
	});

	test('Existing support agents are still present', () => {
		const supportAgents = [
			'planner', 
			'doc_updater', 
			'docs_lookup', 
			'harness_optimizer', 
			'loop_operator', 
			'chief_of_staff', 
			'gan_planner'
		];
		
		for (const agent of supportAgents) {
			expect(ALL_SUBAGENT_NAMES).toContain(agent);
		}
	});
});
