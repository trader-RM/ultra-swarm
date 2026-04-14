import { describe, expect, it } from 'bun:test';
import { ARCHITECT_PROMPT } from '../../../src/agents/architect';

describe('Architect prompt ECC agent exposure', () => {
	it('includes harness_optimizer in AGENTS section', () => {
		expect(ARCHITECT_PROMPT).toContain('harness_optimizer');
		expect(ARCHITECT_PROMPT).toContain('harness_optimizer - Analyzes');
	});

	it('includes loop_operator in AGENTS section', () => {
		expect(ARCHITECT_PROMPT).toContain('loop_operator');
		expect(ARCHITECT_PROMPT).toContain('loop_operator - Operates');
	});

	it('excludes chief_of_staff Support agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('chief_of_staff');
	});

	it('excludes planner Support agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('planner');
	});

	it('excludes gan_planner Support agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('gan_planner');
	});

	it('excludes doc_updater Support agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('doc_updater');
	});

	it('excludes docs_lookup Support agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('docs_lookup');
	});

	it('excludes code_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('code_reviewer');
	});

	it('excludes security_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('security_reviewer');
	});

	it('excludes cpp_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('cpp_reviewer');
	});

	it('excludes go_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('go_reviewer');
	});

	it('excludes kotlin_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('kotlin_reviewer');
	});

	it('excludes java_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('java_reviewer');
	});

	it('excludes rust_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('rust_reviewer');
	});

	it('excludes python_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('python_reviewer');
	});

	it('excludes typescript_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('typescript_reviewer');
	});

	it('excludes csharp_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('csharp_reviewer');
	});

	it('excludes flutter_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('flutter_reviewer');
	});

	it('excludes database_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('database_reviewer');
	});

	it('excludes healthcare_reviewer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('healthcare_reviewer');
	});

	it('excludes gan_evaluator ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('gan_evaluator');
	});

	it('excludes opensource_sanitizer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('opensource_sanitizer');
	});

	it('excludes build_error_resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('build_error_resolver');
	});

	it('excludes cpp_build_resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('cpp_build_resolver');
	});

	it('excludes go_build_resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('go_build_resolver');
	});

	it('excludes kotlin_build_resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('kotlin_build_resolver');
	});

	it('excludes java_build_resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('java_build_resolver');
	});

	it('excludes rust_build_resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('rust_build_resolver');
	});

	it('excludes pytorch_build_resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('pytorch_build_resolver');
	});

	it('excludes dart_build_resolver ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('dart_build_resolver');
	});

	it('excludes tdd_guide ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('tdd_guide');
	});

	it('excludes e2e_runner ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('e2e_runner');
	});

	it('excludes refactor_cleaner ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('refactor_cleaner');
	});

	it('excludes performance_optimizer ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('performance_optimizer');
	});

	it('excludes gan_generator ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('gan_generator');
	});

	it('excludes opensource_forker ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('opensource_forker');
	});

	it('excludes opensource_packager ECC agent', () => {
		expect(ARCHITECT_PROMPT).not.toContain('opensource_packager');
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
