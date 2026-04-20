import { describe, expect, test } from 'bun:test';
import { DESIGNER_PROMPT } from '../../../src/agents/designer';

describe('Designer Prompt ECC Exposure Adversarial Tests', () => {

	const eccReviewAgents = [
		'code-reviewer',
		'security-reviewer',
		'cpp-reviewer',
		'go-reviewer',
		'kotlin-reviewer',
		'java-reviewer',
		'rust-reviewer',
		'python-reviewer',
		'typescript-reviewer',
		'csharp-reviewer',
		'flutter-reviewer',
		'database-reviewer',
		'healthcare-reviewer',
		'gan-evaluator',
		'opensource-sanitizer',
	];
	const eccBuildAgents = [
		'build-error-resolver',
		'cpp-build-resolver',
		'go-build-resolver',
		'kotlin-build-resolver',
		'java-build-resolver',
		'rust-build-resolver',
		'pytorch-build-resolver',
		'dart-build-resolver',
	];
	const eccPipelineAgents = [
		'tdd-guide',
		'e2e-runner',
		'refactor-cleaner',
		'performance-optimizer',
		'opensource-forker',
		'opensource-packager',
	];
	const eccSupportAgents = [
		'planner',
		'doc-updater',
		'docs-lookup',
		'harness-optimizer',
		'loop-operator',
		'chief-of-staff',
		'gan-planner',
	];

	test('DESIGNER_PROMPT does NOT leak references to ECC Review agents', () => {
		for (const agent of eccReviewAgents) {
			expect(DESIGNER_PROMPT).not.toContain(agent);
		}
	});

	test('DESIGNER_PROMPT does NOT leak references to ECC Build agents', () => {
		for (const agent of eccBuildAgents) {
			expect(DESIGNER_PROMPT).not.toContain(agent);
		}
	});

	test('DESIGNER_PROMPT does NOT leak references to ECC Pipeline agents', () => {
		for (const agent of eccPipelineAgents) {
			expect(DESIGNER_PROMPT).not.toContain(agent);
		}
	});

	test('DESIGNER_PROMPT does NOT leak references to ECC Support agents', () => {
		for (const agent of eccSupportAgents) {
			expect(DESIGNER_PROMPT).not.toContain(agent);
		}
	});

	test('DESIGNER_PROMPT does NOT contain legacy blanket prohibition "you do NOT delegate"', () => {
		expect(DESIGNER_PROMPT).not.toContain('you do NOT delegate');
	});

	test('DESIGNER_PROMPT preserves all 5 DESIGN CHECKLIST sub-sections', () => {
		const requiredSections = [
			'1. Component Architecture',
			'2. Layout & Responsiveness',
			'3. Accessibility',
			'4. Visual Design',
			'5. Interaction Design'
		];
		for (const section of requiredSections) {
			expect(DESIGNER_PROMPT).toContain(section);
		}
	});

	test('DESIGNER_PROMPT does NOT contain factory function name "createDesignerAgent"', () => {
		expect(DESIGNER_PROMPT).not.toContain('createDesignerAgent');
	});
});
