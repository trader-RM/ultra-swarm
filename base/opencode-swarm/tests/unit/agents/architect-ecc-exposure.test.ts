import { describe, expect, it } from 'bun:test';
import { ARCHITECT_PROMPT } from '../../../src/agents/architect';

describe('Architect prompt ECC agent exposure', () => {
	it('includes code-architect in AGENTS section', () => {
		expect(ARCHITECT_PROMPT).toContain('code-architect');
		expect(ARCHITECT_PROMPT).toContain('code-architect - Designs');
	});

	it('includes code-architect in Your agents line', () => {
		expect(ARCHITECT_PROMPT).toContain('{{AGENT_PREFIX}}code-architect');
	});

	it('excludes chief-of-staff Support agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('chief-of-staff');
	});

	it('excludes planner Support agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('planner');
	});

	it('excludes gan-planner Support agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('gan-planner');
	});

	it('excludes doc-updater Support agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('doc-updater');
	});

	it('excludes docs-lookup Support agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('docs-lookup');
	});

	it('excludes code-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('code-reviewer');
	});

	it('excludes security-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('security-reviewer');
	});

	it('excludes cpp-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('cpp-reviewer');
	});

	it('excludes go-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('go-reviewer');
	});

	it('excludes kotlin-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('kotlin-reviewer');
	});

	it('excludes java-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('java-reviewer');
	});

	it('excludes rust-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('rust-reviewer');
	});

	it('excludes python-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('python-reviewer');
	});

	it('excludes typescript-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('typescript-reviewer');
	});

	it('excludes csharp-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('csharp-reviewer');
	});

	it('excludes flutter-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('flutter-reviewer');
	});

	it('excludes database-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('database-reviewer');
	});

	it('excludes healthcare-reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('healthcare-reviewer');
	});

	it('excludes gan-evaluator ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('gan-evaluator');
	});

	it('excludes opensource-sanitizer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('opensource-sanitizer');
	});

	it('excludes build-error-resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('build-error-resolver');
	});

	it('excludes cpp-build-resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('cpp-build-resolver');
	});

	it('excludes go-build-resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('go-build-resolver');
	});

	it('excludes kotlin-build-resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('kotlin-build-resolver');
	});

	it('excludes java-build-resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('java-build-resolver');
	});

	it('excludes rust-build-resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('rust-build-resolver');
	});

	it('excludes pytorch-build-resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('pytorch-build-resolver');
	});

	it('excludes dart-build-resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('dart-build-resolver');
	});

	it('excludes tdd-guide ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('tdd-guide');
	});

	it('excludes e2e-runner ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('e2e-runner');
	});

	it('excludes refactor-cleaner ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('refactor-cleaner');
	});

	it('excludes performance-optimizer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('performance-optimizer');
	});

	it('excludes gan-generator ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('gan-generator');
	});

	it('excludes opensource-forker ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('opensource-forker');
	});

	it('excludes opensource-packager ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('opensource-packager');
	});

	it('includes explorer native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('explorer');
	});

	it('includes sme native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('sme');
	});

	it('includes coder native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('coder');
	});

	it('includes reviewer native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('reviewer');
	});

	it('includes test_engineer native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('test_engineer');
	});

	it('includes critic native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('critic');
	});

	it('includes critic_sounding_board native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('critic_sounding_board');
	});

	it('includes critic_drift_verifier native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('critic_drift_verifier');
	});

	it('includes critic_oversight native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('critic_oversight');
	});

	it('includes docs native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('docs');
	});

	it('includes designer native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('designer');
	});

	it('includes curator_init native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('curator_init');
	});

	it('includes curator_phase native agent', () => {
		expect(ARCHITECT_PROMPT).toContain('curator_phase');
	});
});
