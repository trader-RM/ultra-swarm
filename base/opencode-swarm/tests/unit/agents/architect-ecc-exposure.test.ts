import { describe, expect, it } from 'bun:test';
import { ARCHITECT_PROMPT } from '../../../src/agents/architect';

// Extract the APPROVED AGENTS section from the architect prompt for scoped delegation checks.
// The full prompt legitimately references many agent names in the QA pipeline section,
// so exclusion checks must be scoped to the APPROVED AGENTS section only.
const approvedSection = (() => {
	const start = ARCHITECT_PROMPT.indexOf('APPROVED AGENTS');
	const end = ARCHITECT_PROMPT.indexOf('DELEGATION RULES');
	if (start === -1 || end === -1) return '';
	return ARCHITECT_PROMPT.substring(start, end);
})();

describe('Architect prompt ECC agent exposure', () => {
	it('includes code-architect in AGENTS section', () => {
		expect(ARCHITECT_PROMPT).toContain('code-architect');
		expect(ARCHITECT_PROMPT).toContain('code-architect — Designs');
	});

	it('includes code-architect in Your agents line', () => {
		expect(ARCHITECT_PROMPT).toContain('{{AGENT_PREFIX}}code-architect');
	});

	// Support agents — not approved for architect delegation
	it('excludes chief-of-staff from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('chief-of-staff');
	});

	it('excludes planner from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('planner');
	});

	it('excludes gan-planner from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('gan-planner');
	});

	it('excludes doc-updater from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('doc-updater');
	});

	it('excludes docs-lookup from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('docs-lookup');
	});

	// ECC review agents — not approved for architect delegation
	it('excludes code-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('code-reviewer');
	});

	it('excludes security-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('security-reviewer');
	});

	it('excludes cpp-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('cpp-reviewer');
	});

	it('excludes go-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('go-reviewer');
	});

	it('excludes kotlin-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('kotlin-reviewer');
	});

	it('excludes java-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('java-reviewer');
	});

	it('excludes rust-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('rust-reviewer');
	});

	it('excludes python-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('python-reviewer');
	});

	it('excludes typescript-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('typescript-reviewer');
	});

	it('excludes csharp-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('csharp-reviewer');
	});

	it('excludes flutter-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('flutter-reviewer');
	});

	it('excludes database-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('database-reviewer');
	});

	it('excludes healthcare-reviewer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('healthcare-reviewer');
	});

	it('excludes gan-evaluator from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('gan-evaluator');
	});

	it('excludes opensource-sanitizer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('opensource-sanitizer');
	});

	// ECC build agents — not approved for architect delegation
	it('excludes build-error-resolver from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('build-error-resolver');
	});

	it('excludes cpp-build-resolver from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('cpp-build-resolver');
	});

	it('excludes go-build-resolver from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('go-build-resolver');
	});

	it('excludes kotlin-build-resolver from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('kotlin-build-resolver');
	});

	it('excludes java-build-resolver from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('java-build-resolver');
	});

	it('excludes rust-build-resolver from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('rust-build-resolver');
	});

	it('excludes pytorch-build-resolver from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('pytorch-build-resolver');
	});

	it('excludes dart-build-resolver from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('dart-build-resolver');
	});

	// ECC pipeline agents — not approved for architect delegation
	it('excludes tdd-guide from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('tdd-guide');
	});

	it('excludes e2e-runner from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('e2e-runner');
	});

	it('excludes refactor-cleaner from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('refactor-cleaner');
	});

	it('excludes performance-optimizer from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('performance-optimizer');
	});

	it('excludes gan-generator from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('gan-generator');
	});

	it('excludes opensource-forker from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('opensource-forker');
	});

	it('excludes opensource-packager from APPROVED AGENTS section', () => {
		expect(approvedSection).not.toContain('opensource-packager');
	});

	// Native swarm agents — these are always referenced in the full prompt
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