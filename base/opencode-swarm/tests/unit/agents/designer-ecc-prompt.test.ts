import { describe, expect, test } from 'bun:test';
import { DESIGNER_PROMPT } from '../../../src/agents/designer';

describe('Designer Prompt ECC Exposure Adversarial Tests', () => {

	const eccReviewAgents = [
		'code_reviewer',
		'security_reviewer',
		'cpp_reviewer',
		'go_reviewer',
		'kotlin_reviewer',
		'java_reviewer',
		'rust_reviewer',
		'python_reviewer',
		'typescript_reviewer',
		'csharp_reviewer',
		'flutter_reviewer',
		'database_reviewer',
		'healthcare_reviewer',
		'gan_evaluator',
		'opensource_sanitizer',
	];
	const eccBuildAgents = [
		'build_error_resolver',
		'cpp_build_resolver',
		'go_build_resolver',
		'kotlin_build_resolver',
		'java_build_resolver',
		'rust_build_resolver',
		'pytorch_build_resolver',
		'dart_build_resolver',
	];
	const eccPipelineAgents = [
		'tdd_guide',
		'e2e_runner',
		'refactor_cleaner',
		'performance_optimizer',
		'opensource_forker',
		'opensource_packager',
	];
	const eccSupportAgents = [
		'planner',
		'doc_updater',
		'docs_lookup',
		'harness_optimizer',
		'loop_operator',
		'chief_of_staff',
		'gan_planner',
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
