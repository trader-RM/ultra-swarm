import { describe, expect, test } from 'bun:test';
import {
	getAgentConfigs,
	PLAN_CRITIC_PROMPT,
	SOUNDING_BOARD_PROMPT,
	PHASE_DRIFT_VERIFIER_PROMPT,
	AUTONOMOUS_OVERSIGHT_PROMPT,
} from 'D:/Repos/Ultra Swarm/base/opencode-swarm/src/agents';

describe('Smoke test for missing exports', () => {
	test('PLAN_CRITIC_PROMPT is exported', () => {
		expect(PLAN_CRITIC_PROMPT).toBeDefined();
		expect(typeof PLAN_CRITIC_PROMPT).toBe('string');
	});

	test('SOUNDING_BOARD_PROMPT is exported', () => {
		expect(SOUNDING_BOARD_PROMPT).toBeDefined();
		expect(typeof SOUNDING_BOARD_PROMPT).toBe('string');
	});

	test('PHASE_DRIFT_VERIFIER_PROMPT is exported', () => {
		expect(PHASE_DRIFT_VERIFIER_PROMPT).toBeDefined();
		expect(typeof PHASE_DRIFT_VERIFIER_PROMPT).toBe('string');
	});

	test('AUTONOMOUS_OVERSIGHT_PROMPT is exported', () => {
		expect(AUTONOMOUS_OVERSIGHT_PROMPT).toBeDefined();
		expect(typeof AUTONOMOUS_OVERSIGHT_PROMPT).toBe('string');
	});

	test('getAgentConfigs is exported and works', () => {
		const configs = getAgentConfigs();
		expect(typeof configs).toBe('object');
		expect(Object.keys(configs).length).toBeGreaterThan(0);
	});
});
