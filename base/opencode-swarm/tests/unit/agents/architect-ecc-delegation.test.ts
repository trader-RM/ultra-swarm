import { describe, expect, it } from 'bun:test';
import { ARCHITECT_PROMPT } from '../../../src/agents/architect';

describe('Architect prompt ECC DELEGATION AND OVERSIGHT section', () => {
	it('contains ECC DELEGATION AND OVERSIGHT heading', () => {
		expect(ARCHITECT_PROMPT).toContain('## ECC DELEGATION AND OVERSIGHT');
	});

	it('lists code_architect as approved ECC agent', () => {
		expect(ARCHITECT_PROMPT).toContain('- code_architect');
		expect(ARCHITECT_PROMPT).toContain('code_architect — Designs feature architectures');
	});

	it('lists harness_optimizer as approved ECC agent', () => {
		expect(ARCHITECT_PROMPT).toContain('- harness_optimizer');
		expect(ARCHITECT_PROMPT).toContain('harness_optimizer — Analyzes and improves');
	});

	it('lists loop_operator as approved ECC agent', () => {
		expect(ARCHITECT_PROMPT).toContain('- loop_operator');
		expect(ARCHITECT_PROMPT).toContain('loop_operator — Operates autonomous');
	});

	it('contains DELEGATION RULES section', () => {
		expect(ARCHITECT_PROMPT).toContain('DELEGATION RULES');
		expect(ARCHITECT_PROMPT).toContain('QUALIFIED DELEGATION ONLY');
	});

	it('states 3 approved agents', () => {
		expect(ARCHITECT_PROMPT).toContain('3 agents listed above');
	});
});
