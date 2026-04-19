import { describe, expect, it } from 'bun:test';
import {
	ALL_SUBAGENT_NAMES,
	AGENT_TOOL_MAP,
} from '../../../src/config/constants';
import { AGENT_CATEGORY } from '../../../src/config/agent-categories';
import { stripKnownSwarmPrefix } from '../../../src/config/schema';

const ECC_REVIEW_QA_AGENTS = [
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
	'pr_test_analyzer',
	'silent_failure_hunter',
] as const;

const ECC_BUILD_AGENTS = [
	'build_error_resolver',
	'cpp_build_resolver',
	'go_build_resolver',
	'kotlin_build_resolver',
	'java_build_resolver',
	'rust_build_resolver',
	'pytorch_build_resolver',
	'dart_build_resolver',
] as const;

const ECC_PIPELINE_AGENTS = [
	'tdd_guide',
	'e2e_runner',
	'refactor_cleaner',
	'performance_optimizer',
	'gan_generator',
	'opensource_forker',
	'opensource_packager',
	'code_simplifier',
] as const;

const ECC_SUPPORT_AGENTS = [
	'planner',
	'doc_updater',
	'docs_lookup',
	'harness_optimizer',
	'loop_operator',
	'chief_of_staff',
	'gan_planner',
	'code_architect',
	'code_explorer',
	'comment_analyzer',
	'conversation_analyzer',
] as const;

const ECC_DESIGN_SUPPORT_AGENTS = [
	'a11y_architect',
	'seo_specialist',
] as const;

const ECC_ANALYSIS_AGENTS = [
	'type_design_analyzer',
] as const;

const ALL_ECC_AGENTS = [
	...ECC_REVIEW_QA_AGENTS,
	...ECC_BUILD_AGENTS,
	...ECC_PIPELINE_AGENTS,
	...ECC_SUPPORT_AGENTS,
	...ECC_DESIGN_SUPPORT_AGENTS,
	...ECC_ANALYSIS_AGENTS,
] as const;

describe('ECC Agent Registration', () => {
	describe('ALL_SUBAGENT_NAMES contains all 47 ECC agents', () => {
		it('has all ECC Review/QA agents (15)', () => {
			for (const name of ECC_REVIEW_QA_AGENTS) {
				expect(ALL_SUBAGENT_NAMES).toContain(name);
			}
		});

		it('has all ECC Build agents (8)', () => {
			for (const name of ECC_BUILD_AGENTS) {
				expect(ALL_SUBAGENT_NAMES).toContain(name);
			}
		});

		it('has all ECC Pipeline agents (7)', () => {
			for (const name of ECC_PIPELINE_AGENTS) {
				expect(ALL_SUBAGENT_NAMES).toContain(name);
			}
		});

		it('has all ECC Support agents (7)', () => {
			for (const name of ECC_SUPPORT_AGENTS) {
				expect(ALL_SUBAGENT_NAMES).toContain(name);
			}
		});

		it('has all ECC Design Support agents (2)', () => {
			for (const name of ECC_DESIGN_SUPPORT_AGENTS) {
				expect(ALL_SUBAGENT_NAMES).toContain(name);
			}
		});

		it('has all ECC Analysis agents (1)', () => {
			for (const name of ECC_ANALYSIS_AGENTS) {
				expect(ALL_SUBAGENT_NAMES).toContain(name);
			}
		});

		it('total ECC agent count is 47', () => {
			expect(ALL_ECC_AGENTS.length).toBe(47);
		});
	});

	describe('AGENT_TOOL_MAP has entries for all 47 ECC agents', () => {
		it('all Review/QA agents have tool assignments', () => {
			for (const name of ECC_REVIEW_QA_AGENTS) {
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP]).toBeDefined();
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP].length).toBeGreaterThan(0);
			}
		});

		it('all Build agents have tool assignments', () => {
			for (const name of ECC_BUILD_AGENTS) {
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP]).toBeDefined();
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP].length).toBeGreaterThan(0);
			}
		});

		it('all Pipeline agents have tool assignments', () => {
			for (const name of ECC_PIPELINE_AGENTS) {
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP]).toBeDefined();
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP].length).toBeGreaterThan(0);
			}
		});

		it('all Support agents have tool assignments', () => {
			for (const name of ECC_SUPPORT_AGENTS) {
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP]).toBeDefined();
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP].length).toBeGreaterThan(0);
			}
		});

		it('all Design Support agents have tool assignments', () => {
			for (const name of ECC_DESIGN_SUPPORT_AGENTS) {
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP]).toBeDefined();
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP].length).toBeGreaterThan(0);
			}
		});

		it('all Analysis agents are registered in AGENT_TOOL_MAP (empty tool list is intentional)', () => {
			// type_design_analyzer uses [] — native OpenCode tools pass through via AgentConfig.permission.
			// Only assert the entry exists; do NOT assert length > 0.
			for (const name of ECC_ANALYSIS_AGENTS) {
				expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP]).toBeDefined();
			}
		});
	});

	describe('AGENT_CATEGORY has entries for all 47 ECC agents', () => {
		it('Review/QA agents are in "qa" category', () => {
			for (const name of ECC_REVIEW_QA_AGENTS) {
				expect(AGENT_CATEGORY[name as keyof typeof AGENT_CATEGORY]).toBe('qa');
			}
		});

		it('Build agents are in "pipeline" category', () => {
			for (const name of ECC_BUILD_AGENTS) {
				expect(AGENT_CATEGORY[name as keyof typeof AGENT_CATEGORY]).toBe('pipeline');
			}
		});

		it('Pipeline agents are in "pipeline" category', () => {
			for (const name of ECC_PIPELINE_AGENTS) {
				expect(AGENT_CATEGORY[name as keyof typeof AGENT_CATEGORY]).toBe('pipeline');
			}
		});

		it('Support agents are in "support" category', () => {
			for (const name of ECC_SUPPORT_AGENTS) {
				expect(AGENT_CATEGORY[name as keyof typeof AGENT_CATEGORY]).toBe('support');
			}
		});

		it('Design Support agents are in "support" category', () => {
			for (const name of ECC_DESIGN_SUPPORT_AGENTS) {
				expect(AGENT_CATEGORY[name as keyof typeof AGENT_CATEGORY]).toBe('support');
			}
		});

		it('Analysis agents are in "qa" category', () => {
			for (const name of ECC_ANALYSIS_AGENTS) {
				expect(AGENT_CATEGORY[name as keyof typeof AGENT_CATEGORY]).toBe('qa');
			}
		});
	});

	describe('stripKnownSwarmPrefix resolves ECC names', () => {
		it('strips "local_" prefix from gan_evaluator', () => {
			expect(stripKnownSwarmPrefix('local_gan_evaluator')).toBe('gan_evaluator');
		});

		it('strips "local_" prefix from code_reviewer', () => {
			expect(stripKnownSwarmPrefix('local_code_reviewer')).toBe('code_reviewer');
		});

		it('strips "local_" prefix from build_error_resolver', () => {
			expect(stripKnownSwarmPrefix('local_build_error_resolver')).toBe('build_error_resolver');
		});

		it('strips "local_" prefix from planner', () => {
			expect(stripKnownSwarmPrefix('local_planner')).toBe('planner');
		});

		it('returns bare name unchanged', () => {
			expect(stripKnownSwarmPrefix('tdd_guide')).toBe('tdd_guide');
		});

		it('handles all 37 ECC agent names with local_ prefix', () => {
			for (const name of ALL_ECC_AGENTS) {
				const prefixed = `local_${name}`;
				expect(stripKnownSwarmPrefix(prefixed)).toBe(name);
			}
		});
	});
});