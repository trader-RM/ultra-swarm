import { describe, expect, test } from 'bun:test';
import {
	ALL_SUBAGENT_NAMES,
	AGENT_TOOL_MAP,
	DEFAULT_MODELS,
} from '../../../src/config/constants';

describe('Agent Registration Constants (Swarm Only)', () => {
	test('Swarm agents are registered in ALL_SUBAGENT_NAMES', () => {
		const swarmAgents = [
			'sme',
			'docs',
			'designer',
			'critic_sounding_board',
			'critic_drift_verifier',
			'curator_init',
			'curator_phase',
			'reviewer',
			'critic',
			'critic_oversight',
			'explorer',
			'coder',
			'test_engineer',
		];
		
		for (const agent of swarmAgents) {
			expect(ALL_SUBAGENT_NAMES).toContain(agent);
		}
	});

	test('ECC agents are NOT in ALL_SUBAGENT_NAMES', () => {
		const eccAgents = ['a11y_architect', 'seo_specialist', 'code_reviewer', 'build_error_resolver', 'planner'];
		for (const agent of eccAgents) {
			expect(ALL_SUBAGENT_NAMES).not.toContain(agent);
		}
	});

	test('Total agent count in ALL_SUBAGENT_NAMES is 13', () => {
		expect(ALL_SUBAGENT_NAMES.length).toBe(13);
	});

	test('designer has AGENT_TOOL_MAP entry', () => {
		const tools = AGENT_TOOL_MAP['designer'];
		expect(tools).toBeDefined();
		expect(Array.isArray(tools)).toBe(true);
	});

	test('designer has DEFAULT_MODELS entry', () => {
		expect(DEFAULT_MODELS['designer']).toBeDefined();
	});
});