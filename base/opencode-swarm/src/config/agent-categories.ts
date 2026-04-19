/**
 * Single source of truth for agent categorization.
 * Used by the monitor server /metadata endpoint to classify agents.
 */
export type AgentCategory = 'orchestrator' | 'pipeline' | 'qa' | 'support';

export const AGENT_CATEGORY: Readonly<Record<string, AgentCategory>> = {
	// Orchestrator
	architect: 'orchestrator',

	// Pipeline agents (do the actual work)
	explorer: 'pipeline',
	coder: 'pipeline',
	test_engineer: 'pipeline',

	// QA agents (review and verify)
	reviewer: 'qa',
	critic: 'qa',
	critic_sounding_board: 'qa',
	critic_drift_verifier: 'qa',
	critic_oversight: 'qa',

	// Support agents (advise, document, design)
	sme: 'support',
	docs: 'support',
	designer: 'support',
	curator_init: 'support',
	curator_phase: 'support',

	// ECC Review/QA agents (specialized reviewers and evaluators)
	code_reviewer: 'qa',
	security_reviewer: 'qa',
	cpp_reviewer: 'qa',
	go_reviewer: 'qa',
	kotlin_reviewer: 'qa',
	java_reviewer: 'qa',
	rust_reviewer: 'qa',
	python_reviewer: 'qa',
	typescript_reviewer: 'qa',
	csharp_reviewer: 'qa',
	flutter_reviewer: 'qa',
	database_reviewer: 'qa',
	healthcare_reviewer: 'qa',
	gan_evaluator: 'qa',
	opensource_sanitizer: 'qa',
	pr_test_analyzer: 'qa',
	silent_failure_hunter: 'qa',
	type_design_analyzer: 'qa',

	// ECC Pipeline agents (build resolvers, generators, and executors)
	build_error_resolver: 'pipeline',
	cpp_build_resolver: 'pipeline',
	go_build_resolver: 'pipeline',
	kotlin_build_resolver: 'pipeline',
	java_build_resolver: 'pipeline',
	rust_build_resolver: 'pipeline',
	pytorch_build_resolver: 'pipeline',
	dart_build_resolver: 'pipeline',
	tdd_guide: 'pipeline',
	e2e_runner: 'pipeline',
	refactor_cleaner: 'pipeline',
	performance_optimizer: 'pipeline',
	gan_generator: 'pipeline',
	opensource_forker: 'pipeline',
	opensource_packager: 'pipeline',
	code_simplifier: 'pipeline',

	// ECC Support agents (planning, documentation, operations)
	planner: 'support',
	doc_updater: 'support',
	docs_lookup: 'support',
	harness_optimizer: 'support',
	loop_operator: 'support',
	chief_of_staff: 'support',
	gan_planner: 'support',
	code_architect: 'support',
	code_explorer: 'support',
	comment_analyzer: 'support',
	conversation_analyzer: 'support',

	// ECC Design Support agents (design-concerned support specialists)
	a11y_architect: 'support',
	seo_specialist: 'support',
} as const;

/**
 * Resolve an agent's category.
 * @param agentName - Agent name (e.g. "architect", "critic_sounding_board")
 * @returns The agent's category, or undefined if the agent name is unknown
 */
export function getAgentCategory(agentName: string): AgentCategory | undefined {
	return AGENT_CATEGORY[agentName];
}
