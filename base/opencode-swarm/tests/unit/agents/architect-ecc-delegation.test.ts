import { describe, expect, it } from 'bun:test';
import { ARCHITECT_PROMPT } from '../../../src/agents/architect';

describe('Architect prompt APPROVED AGENTS section', () => {
	it('contains ECC DELEGATION AND OVERSIGHT heading', () => {
		expect(ARCHITECT_PROMPT).toContain('## ECC DELEGATION AND OVERSIGHT');
	});

	it('contains APPROVED AGENTS subheading', () => {
		expect(ARCHITECT_PROMPT).toContain('APPROVED AGENTS');
	});

	it('lists code-architect as approved agent', () => {
		expect(ARCHITECT_PROMPT).toContain('- code-architect');
		expect(ARCHITECT_PROMPT).toContain('code-architect — Designs feature architectures');
	});

	it('lists loop-operator as approved agent', () => {
		expect(ARCHITECT_PROMPT).toContain('- loop-operator');
		expect(ARCHITECT_PROMPT).toContain('loop-operator — Operates autonomous');
	});

	it('does NOT list harness-optimizer (moved to explorer)', () => {
		expect(ARCHITECT_PROMPT).not.toContain('harness-optimizer');
	});

	it('contains DELEGATION RULES section', () => {
		expect(ARCHITECT_PROMPT).toContain('DELEGATION RULES');
		expect(ARCHITECT_PROMPT).toContain('QUALIFIED DELEGATION ONLY');
	});

	it('states 2 approved agents', () => {
		expect(ARCHITECT_PROMPT).toContain('2 agents listed above');
	});
});