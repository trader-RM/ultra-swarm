import { describe, test, expect } from 'bun:test';
import { 
	ALL_SUBAGENT_NAMES, 
	AGENT_TOOL_MAP, 
	DEFAULT_MODELS, 
	WRITE_TOOL_NAMES 
} from '../../../src/config/constants';
import { AGENT_CATEGORY, getAgentCategory } from '../../../src/config/agent-categories';
import { createAgents } from '../../../src/agents/index';

describe('Designer Constants Adversarial Registration', () => {
	const A11Y = 'a11y_architect';
	const SEO = 'seo_specialist';

	test('a11y_architect is NOT duplicated in ALL_SUBAGENT_NAMES (appears exactly once)', () => {
		const occurrences = ALL_SUBAGENT_NAMES.filter(name => name === A11Y).length;
		expect(occurrences).toBe(1);
	});

	test('seo_specialist is NOT duplicated in ALL_SUBAGENT_NAMES (appears exactly once)', () => {
		const occurrences = ALL_SUBAGENT_NAMES.filter(name => name === SEO).length;
		expect(occurrences).toBe(1);
	});

	test('a11y_architect tool set is NOT empty', () => {
		const tools = AGENT_TOOL_MAP[A11Y];
		expect(tools).toBeDefined();
		expect(tools?.length).toBeGreaterThan(0);
	});

	test('seo_specialist tool set is NOT empty', () => {
		const tools = AGENT_TOOL_MAP[SEO];
		expect(tools).toBeDefined();
		expect(tools?.length).toBeGreaterThan(0);
	});

	test('a11y_architect AGENT_TOOL_MAP does NOT contain write or edit tools (read-only support agent)', () => {
		const tools = AGENT_TOOL_MAP[A11Y] || [];
		const writeTools = tools.filter(tool => WRITE_TOOL_NAMES.includes(tool as any));
		expect(writeTools).toEqual([]);
	});

	test('seo_specialist AGENT_TOOL_MAP does NOT contain write or edit tools (read-only support agent)', () => {
		const tools = AGENT_TOOL_MAP[SEO] || [];
		const writeTools = tools.filter(tool => WRITE_TOOL_NAMES.includes(tool as any));
		expect(writeTools).toEqual([]);
	});

	test('a11y_architect DEFAULT_MODELS value is NOT undefined or empty string', () => {
		const model = DEFAULT_MODELS[A11Y];
		expect(model).toBeDefined();
		expect(typeof model).toBe('string');
		expect(model?.length).toBeGreaterThan(0);
	});

	test('seo_specialist DEFAULT_MODELS value is NOT undefined or empty string', () => {
		const model = DEFAULT_MODELS[SEO];
		expect(model).toBeDefined();
		expect(typeof model).toBe('string');
		expect(model?.length).toBeGreaterThan(0);
	});

	test('a11y_architect has AGENT_CATEGORY entry with value "support"', () => {
		expect(AGENT_CATEGORY[A11Y]).toBe('support');
	});

	test('seo_specialist has AGENT_CATEGORY entry with value "support"', () => {
		expect(AGENT_CATEGORY[SEO]).toBe('support');
	});

	test('getAgentCategory("a11y_architect") returns "support"', () => {
		expect(getAgentCategory(A11Y)).toBe('support');
	});

	test('getAgentCategory("seo_specialist") returns "support"', () => {
		expect(getAgentCategory(SEO)).toBe('support');
	});

	test('AGENT_CATEGORY total entries >= 52', () => {
		const totalEntries = Object.keys(AGENT_CATEGORY).length;
		expect(totalEntries).toBeGreaterThanOrEqual(52);
	});

	test('a11y_architect is NOT categorized as orchestrator, pipeline, or qa', () => {
		const cat = AGENT_CATEGORY[A11Y];
		expect(['orchestrator', 'pipeline', 'qa']).not.toContain(cat);
	});

	test('seo_specialist is NOT categorized as orchestrator, pipeline, or qa', () => {
		const cat = AGENT_CATEGORY[SEO];
		expect(['orchestrator', 'pipeline', 'qa']).not.toContain(cat);
	});

	test('Both agents are NOT registered as orchestrator or pipeline categories (they should be support only)', () => {
		const a11yCat = AGENT_CATEGORY[A11Y];
		const seoCat = AGENT_CATEGORY[SEO];

		expect(a11yCat).not.toBe('orchestrator');
		expect(a11yCat).not.toBe('pipeline');
		expect(a11yCat).toBe('support');

		expect(seoCat).not.toBe('orchestrator');
		expect(seoCat).not.toBe('pipeline');
		expect(seoCat).toBe('support');
	});

	test('a11y_architect is NOT duplicated in AGENT_CATEGORY (appears exactly once)', () => {
		const entries = Object.entries(AGENT_CATEGORY);
		const occurrences = entries.filter(([name]) => name === A11Y).length;
		expect(occurrences).toBe(1);
	});

	test('seo_specialist is NOT duplicated in AGENT_CATEGORY (appears exactly once)', () => {
		const entries = Object.entries(AGENT_CATEGORY);
		const occurrences = entries.filter(([name]) => name === SEO).length;
		expect(occurrences).toBe(1);
	});

	test('createAgents registers both a11y_architect and seo_specialist', () => {
		const agents = createAgents({});
		const names = agents.map(a => a.name);
		expect(names).toContain(A11Y);
		expect(names).toContain(SEO);
	});

	test('createAgents does NOT reference a non-existent agent name', () => {
		const agents = createAgents({});
		const registeredNames = agents.map(a => a.name);
		const fakeAgents = ['ghost_agent', 'mystery_specialist', 'unknown_bot'];
		for (const fake of fakeAgents) {
			expect(registeredNames).not.toContain(fake);
		}
	});
});
;
;
