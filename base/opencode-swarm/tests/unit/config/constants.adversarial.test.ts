import { describe, expect, it } from 'bun:test';
import {
	AGENT_TOOL_MAP,
	ALL_AGENT_NAMES,
	ALL_SUBAGENT_NAMES,
	DEFAULT_MODELS,
	isQAAgent,
	isSubagent,
	ORCHESTRATOR_NAME,
	PIPELINE_AGENTS,
	QA_AGENTS,
} from '../../../src/config/constants';
import { TOOL_NAMES } from '../../../src/tools/tool-names';

describe('constants.ts Adversarial', () => {
	describe('Registry Coherence', () => {
		it('ALL_AGENT_NAMES should be a strict superset of ALL_SUBAGENT_NAMES + ORCHESTRATOR_NAME', () => {
			const expectedSet = new Set([...ALL_SUBAGENT_NAMES, ORCHESTRATOR_NAME]);
			expect(ALL_AGENT_NAMES.length).toBe(expectedSet.size);
			for (const agent of ALL_AGENT_NAMES) {
				expect(expectedSet.has(agent)).toBe(true);
			}
		});

		it('AGENT_TOOL_MAP should have exactly one entry for every agent in ALL_AGENT_NAMES', () => {
			const toolMapKeys = Object.keys(AGENT_TOOL_MAP);
			expect(toolMapKeys.length).toBe(ALL_AGENT_NAMES.length);
			for (const agent of ALL_AGENT_NAMES) {
				expect(AGENT_TOOL_MAP).toHaveProperty(agent);
			}
		});

		it('No agent should have an empty tool list unless explicitly intended (SME/Docs etc should have some)', () => {
			for (const [agent, tools] of Object.entries(AGENT_TOOL_MAP)) {
				// curator_init/phase and conversation_analyzer are'lightweight' but should still have knowledge_recall
				expect(tools.length).toBeGreaterThan(0);
			}
		});
	});

	describe('DEFAULT_MODELS Fallback Behavior', () => {
		it('Every agent (except architect) resolves to a non-empty string via fallback', () => {
			for (const agent of ALL_AGENT_NAMES) {
				if (agent === 'architect') continue;
				const resolved = DEFAULT_MODELS[agent] ?? DEFAULT_MODELS.default;
				expect(typeof resolved).toBe('string');
				expect(resolved.length).toBeGreaterThan(0);
			}
		});

		it('At least one agent not explicitly listed in DEFAULT_MODELS resolves to DEFAULT_MODELS.default', () => {
			// Find an agent that is NOT explicitly listed in DEFAULT_MODELS
			let foundMissingAgent = false;
			for (const agent of ALL_AGENT_NAMES) {
				if (agent === 'architect') continue;
				if (DEFAULT_MODELS[agent] === undefined) {
					foundMissingAgent = true;
					const resolved = DEFAULT_MODELS[agent] ?? DEFAULT_MODELS.default;
					expect(resolved).toBe(DEFAULT_MODELS.default);
					break;
				}
			}
			// Ensure we actually tested the fallback behavior
			expect(foundMissingAgent).toBe(true);
		});

		it('Ensure DEFAULT_MODELS does not contain "ghost" agents not in ALL_AGENT_NAMES', () => {
			for (const key of Object.keys(DEFAULT_MODELS)) {
				if (key === 'default') continue;
				expect(ALL_AGENT_NAMES).toContain(key);
			}
		});
	});

	describe('Boundary & Type Checks', () => {
		it('isSubagent() handles extreme inputs without crashing', () => {
			expect(isSubagent(null as any)).toBe(false);
			expect(isSubagent(undefined as any)).toBe(false);
			expect(isSubagent('')).toBe(false);
			expect(isSubagent(' '.repeat(1000))).toBe(false);
			expect(isSubagent('architect')).toBe(false);
		});

		it('isQAAgent() handles extreme inputs without crashing', () => {
			expect(isQAAgent(null as any)).toBe(false);
			expect(isQAAgent(undefined as any)).toBe(false);
			expect(isQAAgent('')).toBe(false);
			expect(isQAAgent('reviewer')).toBe(true);
		});

		it('ALL_AGENT_NAMES contains no duplicates', () => {
			const uniqueAgents = new Set(ALL_AGENT_NAMES);
			expect(uniqueAgents.size).toBe(ALL_AGENT_NAMES.length);
		});
	});
});