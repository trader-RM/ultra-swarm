import { describe, expect, it } from 'bun:test';
import { DESIGNER_PROMPT } from '../../../src/agents/designer';
import {
	ALL_SUBAGENT_NAMES,
	AGENT_TOOL_MAP,
	DEFAULT_MODELS,
} from '../../../src/config/constants';
import { AGENT_CATEGORY } from '../../../src/config/agent-categories';

const EXCLUDED_ECC_AGENTS = [
	'build_error_resolver',
	'cpp_build_resolver',
	'go_build_resolver',
	'kotlin_build_resolver',
	'java_build_resolver',
	'rust_build_resolver',
	'pytorch_build_resolver',
	'dart_build_resolver',
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
	'tdd_guide',
	'e2e_runner',
	'refactor_cleaner',
	'performance_optimizer',
	'gan_generator',
	'opensource_forker',
	'opensource_packager',
	'planner',
	'doc_updater',
	'docs_lookup',
	'harness_optimizer',
	'loop_operator',
	'chief_of_staff',
	'gan_planner',
];

describe('Designer ECC Agent Exposure — Smoke Test', () => {
	describe('Group 1: Approved ECC agents in Designer prompt', () => {
		it('contains a11y_architect in prompt', () => {
			expect(DESIGNER_PROMPT).toContain('a11y_architect');
		});
		it('contains seo_specialist in prompt', () => {
			expect(DESIGNER_PROMPT).toContain('seo_specialist');
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

	describe('Group 4: New ECC agents registered in system', () => {
		it('a11y_architect is in ALL_SUBAGENT_NAMES', () => {
			expect(ALL_SUBAGENT_NAMES).toContain('a11y_architect');
		});
		it('seo_specialist is in ALL_SUBAGENT_NAMES', () => {
			expect(ALL_SUBAGENT_NAMES).toContain('seo_specialist');
		});
		it('a11y_architect has AGENT_TOOL_MAP entry', () => {
			expect(Object.keys(AGENT_TOOL_MAP)).toContain('a11y_architect');
		});
		it('seo_specialist has AGENT_TOOL_MAP entry', () => {
			expect(Object.keys(AGENT_TOOL_MAP)).toContain('seo_specialist');
		});
		it('a11y_architect is support category', () => {
			expect(AGENT_CATEGORY).toHaveProperty('a11y_architect', 'support');
		});
		it('seo_specialist is support category', () => {
			expect(AGENT_CATEGORY).toHaveProperty('seo_specialist', 'support');
		});
		it('a11y_architect has no write tools', () => {
			expect(AGENT_TOOL_MAP.a11y_architect as string[]).not.toContain('write');
		});
		it('a11y_architect has no edit tools', () => {
			expect(AGENT_TOOL_MAP.a11y_architect as string[]).not.toContain('edit');
		});
		it('seo_specialist has no write tools', () => {
			expect(AGENT_TOOL_MAP.seo_specialist as string[]).not.toContain('write');
		});
		it('seo_specialist has no edit tools', () => {
			expect(AGENT_TOOL_MAP.seo_specialist as string[]).not.toContain('edit');
		});
		it('a11y_architect has DEFAULT_MODELS entry', () => {
			expect(DEFAULT_MODELS).toHaveProperty('a11y_architect');
		});
		it('seo_specialist has DEFAULT_MODELS entry', () => {
			expect(DEFAULT_MODELS).toHaveProperty('seo_specialist');
		});
	});
});