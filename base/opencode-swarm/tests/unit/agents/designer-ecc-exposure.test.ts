import { describe, expect, it } from 'bun:test';
import { DESIGNER_PROMPT } from '../../../src/agents/designer';

const EXCLUDED_ECC_AGENTS = [
	'build-error-resolver',
	'cpp-build-resolver',
	'go-build-resolver',
	'kotlin-build-resolver',
	'java-build-resolver',
	'rust-build-resolver',
	'pytorch-build-resolver',
	'dart-build-resolver',
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
	'tdd-guide',
	'e2e-runner',
	'refactor-cleaner',
	'performance-optimizer',
	'gan-generator',
	'opensource-forker',
	'opensource-packager',
	'planner',
	'doc-updater',
	'docs-lookup',
	'harness-optimizer',
	'loop-operator',
	'chief-of-staff',
	'gan-planner',
];

describe('Designer ECC Agent Exposure ΓÇö Smoke Test', () => {
	describe('Group 1: Approved ECC agents in Designer prompt', () => {
		it('contains a11y-architect in prompt', () => {
			expect(DESIGNER_PROMPT).toContain('a11y-architect');
		});
		it('contains seo-specialist in prompt', () => {
			expect(DESIGNER_PROMPT).toContain('seo-specialist');
		});
		it('contains ECC DELEGATION AND OVERSIGHT section', () => {
			expect(DESIGNER_PROMPT).toContain('ECC DELEGATION AND OVERSIGHT');
		});
		it('contains DELEGATION-FIRST SUPERVISION rule', () => {
			expect(DESIGNER_PROMPT).toContain('DELEGATION-FIRST SUPERVISION');
		});
		it('contains QUALIFIED DELEGATION ONLY rule', () => {
			expect(DESIGNER_PROMPT).toContain('QUALIFIED DELEGATION ONLY');
		});
		it('contains delegation extends role statement', () => {
			expect(DESIGNER_PROMPT).toContain('delegation does not replace your role, it extends it');
		});
	});

	describe('Group 2: No excluded ECC agents in Designer prompt', () => {
		it('does not contain old blanket Task prohibition', () => {
			expect(DESIGNER_PROMPT).not.toContain('you do NOT delegate');
		});
		for (const agent of EXCLUDED_ECC_AGENTS) {
			it(`does not contain excluded agent: ${agent}`, () => {
				expect(DESIGNER_PROMPT).not.toContain(agent);
			});
		}
	});

	describe('Group 3: Existing non-ECC Designer guidance preserved', () => {
		it('preserves DESIGN CHECKLIST section', () => {
			expect(DESIGNER_PROMPT).toContain('DESIGN CHECKLIST');
		});
		it('preserves DESIGN SYSTEM DETECTION section', () => {
			expect(DESIGNER_PROMPT).toContain('DESIGN SYSTEM DETECTION');
		});
		it('preserves RESPONSIVE APPROACH section', () => {
			expect(DESIGNER_PROMPT).toContain('RESPONSIVE APPROACH');
		});
		it('preserves OUTPUT FORMAT section', () => {
			expect(DESIGNER_PROMPT).toContain('OUTPUT FORMAT (MANDATORY');
		});
		it('preserves WCAG AA contrast requirement', () => {
			expect(DESIGNER_PROMPT).toContain('WCAG AA contrast');
		});
		it('preserves keyboard accessibility requirement', () => {
			expect(DESIGNER_PROMPT).toContain('keyboard accessibility');
		});
		it('preserves semantic HTML requirement', () => {
			expect(DESIGNER_PROMPT).toContain('Semantic HTML elements');
		});
	});
});