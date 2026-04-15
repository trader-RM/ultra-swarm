import { mkdir, writeFile } from 'node:fs/promises';
import * as path from 'node:path';
import type { AgentConfig as SDKAgentConfig } from '@opencode-ai/sdk';
import {
	loadAgentPrompt,
	type PluginConfig,
	type SwarmConfig,
} from '../config';
import { AGENT_TOOL_MAP, DEFAULT_MODELS } from '../config/constants';
import { stripKnownSwarmPrefix } from '../config/schema';
import { type AgentDefinition, createArchitectAgent } from './architect';
import { createCoderAgent } from './coder';
import {
	type CriticRole,
	createCriticAgent,
	createCriticAutonomousOversightAgent,
} from './critic';
import { type CuratorRole, createCuratorAgent } from './curator-agent';
import { createDesignerAgent } from './designer';
import { createDocsAgent } from './docs';
import { createExplorerAgent } from './explorer';
import { createReviewerAgent } from './reviewer';
import { createSMEAgent } from './sme';
import { createTestEngineerAgent } from './test-engineer';

export type { AgentDefinition } from './architect';

// Track agents for which we've already warned about missing config
const warnedAgents = new Set<string>();

// Module-level reference to swarm agents config for runtime fallback resolution by guardrails
let _swarmAgents:
	| Record<
			string,
			{ model?: string; fallback_models?: string[]; disabled?: boolean }
	  >
	| undefined;

/**
 * Strip the swarm prefix from an agent name to get the base name.
 * e.g., "local_coder" with prefix "local" → "coder"
 * Returns the name unchanged if no prefix matches.
 */
export function stripSwarmPrefix(
	agentName: string,
	swarmPrefix?: string,
): string {
	if (!swarmPrefix || !agentName) return agentName;
	const prefixWithUnderscore = `${swarmPrefix}_`;
	if (agentName.startsWith(prefixWithUnderscore)) {
		return agentName.substring(prefixWithUnderscore.length);
	}
	return agentName;
}

/**
 * Get the model for an agent within a specific swarm config
 */
function getModelForAgent(
	agentName: string,
	swarmAgents?: Record<
		string,
		{
			model?: string;
			temperature?: number;
			disabled?: boolean;
			fallback_models?: string[];
		}
	>,
	swarmPrefix?: string,
): string {
	// Strip swarm prefix if present (e.g., "local_coder" -> "coder")
	// Only strip if we have a known swarm prefix, not just any underscore
	const baseAgentName = stripSwarmPrefix(agentName, swarmPrefix);

	// 1. Check explicit override
	const explicit = swarmAgents?.[baseAgentName]?.model;
	if (explicit) return explicit;

	// NOTE: fallback_models resolution happens at runtime in guardrails (toolAfter),
	// not here. getModelForAgent runs once at agent creation. The guardrails hook
	// modifies _swarmAgents[name].model directly when session.model_fallback_index > 0.
	// The config's fallback_models array is read by guardrails to select the fallback.

	// 2. Default from constants — warn once per agent if not in config
	const resolvedModel = DEFAULT_MODELS[baseAgentName] ?? DEFAULT_MODELS.default;
	if (!warnedAgents.has(baseAgentName)) {
		warnedAgents.add(baseAgentName);
		console.warn(
			"[swarm] Agent '%s' not found in config — using default model '%s'. Add it to opencode-swarm.json to customize.",
			baseAgentName,
			resolvedModel,
		);
	}
	return resolvedModel;
}

/**
 * Resolve the fallback model for an agent based on its config and fallback index.
 * Called by guardrails at runtime when a transient model error is detected.
 */
export function resolveFallbackModel(
	agentBaseName: string,
	fallbackIndex: number,
	swarmAgents?: Record<
		string,
		{
			model?: string;
			temperature?: number;
			disabled?: boolean;
			fallback_models?: string[];
		}
	>,
): string | null {
	const fallbackModels = swarmAgents?.[agentBaseName]?.fallback_models;
	if (!fallbackModels || fallbackModels.length === 0) return null;
	if (fallbackIndex < 1 || fallbackIndex > fallbackModels.length) return null;
	return fallbackModels[fallbackIndex - 1];
}

/**
 * Get the swarm agents config (for runtime fallback resolution by guardrails).
 */
export function getSwarmAgents():
	| Record<
			string,
			{ model?: string; fallback_models?: string[]; disabled?: boolean }
	  >
	| undefined {
	return _swarmAgents;
}

/**
 * Check if an agent is disabled in swarm config
 */
function isAgentDisabled(
	agentName: string,
	swarmAgents?: Record<string, { disabled?: boolean }>,
	swarmPrefix?: string,
): boolean {
	const baseAgentName = stripSwarmPrefix(agentName, swarmPrefix);
	return swarmAgents?.[baseAgentName]?.disabled === true;
}

/**
 * Get temperature override for an agent
 */
function getTemperatureOverride(
	agentName: string,
	swarmAgents?: Record<string, { temperature?: number }>,
	swarmPrefix?: string,
): number | undefined {
	const baseAgentName = stripSwarmPrefix(agentName, swarmPrefix);
	return swarmAgents?.[baseAgentName]?.temperature;
}

/**
 * Apply config overrides to an agent definition
 */
function applyOverrides(
	agent: AgentDefinition,
	swarmAgents?: Record<string, { temperature?: number }>,
	swarmPrefix?: string,
): AgentDefinition {
	const tempOverride = getTemperatureOverride(
		agent.name,
		swarmAgents,
		swarmPrefix,
	);
	if (tempOverride !== undefined) {
		agent.config.temperature = tempOverride;
	}
	return agent;
}

/**
 * Factory for creating ECC (Everything Claude Code) specialist agent definitions.
 * ECC agents run as subagents by default — they don't have custom prompt modules
 * in the Swarm codebase. Their detailed behavior comes from the ECC agent registration
 * system (descriptions, tool assignments, and agent categories).
 *
 * @param name - Base agent name (e.g., 'code_reviewer', 'cpp_build_resolver')
 * @param model - Model string for this agent
 * @param description - Short description of the agent's specialist role
 * @param temperature - Temperature override (default: 0.3 for specialists)
 * @returns AgentDefinition ready for Swarm registration
 */
function createECCAgent(
	name: string,
	model: string,
	description: string,
	temperature: number = 0.3,
): AgentDefinition {
	return {
		name,
		description,
		config: {
			model,
			temperature,
			prompt: `## IDENTITY\nYou are the ${name} specialist agent. You operate as a subagent within the Swarm delegation system.\n\nTASK: [delegated by architect]\nFILE: [delegated by architect]\nINPUT: [delegated by architect]\nOUTPUT: [deliverable format as specified]\nCONSTRAINT: [as specified by architect]\n\nYou MUST ONLY perform the specific task delegated to you. Do not expand scope or make assumptions beyond what is explicitly requested.`,
		},
	};
}

/**
 * Create agents for a single swarm
 */
function createSwarmAgents(
	swarmId: string,
	swarmConfig: SwarmConfig,
	isDefault: boolean,
	pluginConfig?: PluginConfig,
): AgentDefinition[] {
	const agents: AgentDefinition[] = [];
	const swarmAgents = swarmConfig.agents;
	_swarmAgents = swarmAgents;

	// Prefix for non-default swarms (e.g., "local" for swarmId "local")
	// We pass swarmId as the prefix identifier, but only prepend to names if not default
	const prefix = isDefault ? '' : `${swarmId}_`;
	const swarmPrefix = isDefault ? undefined : swarmId;

	// Get qa_retry_limit from config (default: 3)
	const qaRetryLimit = pluginConfig?.qa_retry_limit ?? 3;

	// Helper to get model for agent (pass base name, not prefixed)
	const getModel = (baseName: string) =>
		getModelForAgent(baseName, swarmAgents, swarmPrefix);

	// Helper to load custom prompts
	const getPrompts = (name: string) => loadAgentPrompt(name);

	// Helper to create prefixed agent name
	const prefixName = (name: string) => `${prefix}${name}`;

	// 1. Create Architect
	if (!isAgentDisabled('architect', swarmAgents, swarmPrefix)) {
		const architectPrompts = getPrompts('architect');
		const architect = createArchitectAgent(
			getModel('architect'),
			architectPrompts.prompt,
			architectPrompts.appendPrompt,
			pluginConfig?.adversarial_testing,
			pluginConfig?.council,
		);
		architect.name = prefixName('architect');

		// Replace placeholders in architect prompt
		const swarmName = swarmConfig.name || swarmId;
		const swarmIdentity = isDefault ? 'default' : swarmId;
		const agentPrefix = prefix; // Empty for default, "cloud_" for cloud, "local_" for local, etc.

		architect.config.prompt = architect.config.prompt
			?.replace(/\{\{SWARM_ID\}\}/g, swarmIdentity)
			.replace(/\{\{AGENT_PREFIX\}\}/g, agentPrefix)
			.replace(/\{\{QA_RETRY_LIMIT\}\}/g, String(qaRetryLimit));

		// Add swarm identity header for non-default swarms
		if (!isDefault) {
			architect.description = `[${swarmName}] ${architect.description}`;
			const swarmHeader = `## ⚠️ YOU ARE THE ${swarmName.toUpperCase()} SWARM ARCHITECT

Your swarm ID is "${swarmId}". ALL your agents have the "${swarmId}_" prefix:
- @${swarmId}_explorer (not @explorer)
- @${swarmId}_coder (not @coder)
- @${swarmId}_sme (not @sme)
- @${swarmId}_reviewer (not @reviewer)
- etc.

CRITICAL: Agents without the "${swarmId}_" prefix DO NOT EXIST or belong to a DIFFERENT swarm.
If you call @coder instead of @${swarmId}_coder, the call will FAIL or go to the wrong swarm.

`;
			architect.config.prompt = swarmHeader + architect.config.prompt;
		}

		agents.push(applyOverrides(architect, swarmAgents, swarmPrefix));
	}

	// 2. Create Explorer
	if (!isAgentDisabled('explorer', swarmAgents, swarmPrefix)) {
		const explorerPrompts = getPrompts('explorer');
		const explorer = createExplorerAgent(
			getModel('explorer'),
			explorerPrompts.prompt,
			explorerPrompts.appendPrompt,
		);
		explorer.name = prefixName('explorer');
		agents.push(applyOverrides(explorer, swarmAgents, swarmPrefix));
	}

	// 3. Create SME agent
	if (!isAgentDisabled('sme', swarmAgents, swarmPrefix)) {
		const smePrompts = getPrompts('sme');
		const sme = createSMEAgent(
			getModel('sme'),
			smePrompts.prompt,
			smePrompts.appendPrompt,
		);
		sme.name = prefixName('sme');
		agents.push(applyOverrides(sme, swarmAgents, swarmPrefix));
	}

	// 4. Create pipeline agents
	if (!isAgentDisabled('coder', swarmAgents, swarmPrefix)) {
		const coderPrompts = getPrompts('coder');
		const coder = createCoderAgent(
			getModel('coder'),
			coderPrompts.prompt,
			coderPrompts.appendPrompt,
		);
		coder.name = prefixName('coder');
		agents.push(applyOverrides(coder, swarmAgents, swarmPrefix));
	}

	if (!isAgentDisabled('reviewer', swarmAgents, swarmPrefix)) {
		const reviewerPrompts = getPrompts('reviewer');
		const reviewer = createReviewerAgent(
			getModel('reviewer'),
			reviewerPrompts.prompt,
			reviewerPrompts.appendPrompt,
		);
		reviewer.name = prefixName('reviewer');
		agents.push(applyOverrides(reviewer, swarmAgents, swarmPrefix));
	}

	// 5a. Create Critic (Plan Review)
	if (!isAgentDisabled('critic', swarmAgents, swarmPrefix)) {
		const criticPrompts = getPrompts('critic');
		const critic = createCriticAgent(
			getModel('critic'),
			criticPrompts.prompt,
			criticPrompts.appendPrompt,
			'plan_critic' as CriticRole,
		);
		critic.name = prefixName('critic');
		agents.push(applyOverrides(critic, swarmAgents, swarmPrefix));
	}

	// 5b. Create Critic Sounding Board
	if (!isAgentDisabled('critic_sounding_board', swarmAgents, swarmPrefix)) {
		const critic = createCriticAgent(
			swarmAgents?.critic_sounding_board?.model ?? getModel('critic'),
			undefined,
			undefined,
			'sounding_board' as CriticRole,
		);
		critic.name = prefixName('critic_sounding_board');
		agents.push(applyOverrides(critic, swarmAgents, swarmPrefix));
	}

	// 5c. Create Critic Drift Verifier
	if (!isAgentDisabled('critic_drift_verifier', swarmAgents, swarmPrefix)) {
		const critic = createCriticAgent(
			swarmAgents?.critic_drift_verifier?.model ?? getModel('critic'),
			undefined,
			undefined,
			'phase_drift_verifier' as CriticRole,
		);
		critic.name = prefixName('critic_drift_verifier');
		agents.push(applyOverrides(critic, swarmAgents, swarmPrefix));
	}

	// 5d. Create Critic Autonomous Oversight
	if (!isAgentDisabled('critic_oversight', swarmAgents, swarmPrefix)) {
		const critic = createCriticAutonomousOversightAgent(
			swarmAgents?.critic_oversight?.model ?? getModel('critic'),
		);
		critic.name = prefixName('critic_oversight');
		agents.push(applyOverrides(critic, swarmAgents, swarmPrefix));
	}

	// 5e. Create Curator Init agent
	if (!isAgentDisabled('curator_init', swarmAgents, swarmPrefix)) {
		const curatorInitPrompts = getPrompts('curator_init');
		const curatorInit = createCuratorAgent(
			swarmAgents?.curator_init?.model ?? getModel('explorer'),
			curatorInitPrompts.prompt,
			curatorInitPrompts.appendPrompt,
			'curator_init' as CuratorRole,
		);
		curatorInit.name = prefixName('curator_init');
		agents.push(applyOverrides(curatorInit, swarmAgents, swarmPrefix));
	}

	// 5e. Create Curator Phase agent
	if (!isAgentDisabled('curator_phase', swarmAgents, swarmPrefix)) {
		const curatorPhasePrompts = getPrompts('curator_phase');
		const curatorPhase = createCuratorAgent(
			swarmAgents?.curator_phase?.model ?? getModel('explorer'),
			curatorPhasePrompts.prompt,
			curatorPhasePrompts.appendPrompt,
			'curator_phase' as CuratorRole,
		);
		curatorPhase.name = prefixName('curator_phase');
		agents.push(applyOverrides(curatorPhase, swarmAgents, swarmPrefix));
	}

	if (!isAgentDisabled('test_engineer', swarmAgents, swarmPrefix)) {
		const testPrompts = getPrompts('test_engineer');
		const testEngineer = createTestEngineerAgent(
			getModel('test_engineer'),
			testPrompts.prompt,
			testPrompts.appendPrompt,
		);
		testEngineer.name = prefixName('test_engineer');
		agents.push(applyOverrides(testEngineer, swarmAgents, swarmPrefix));
	}

	// 8. Create Docs agent (enabled by default — must be explicitly disabled)
	if (!isAgentDisabled('docs', swarmAgents, swarmPrefix)) {
		const docsPrompts = getPrompts('docs');
		const docs = createDocsAgent(
			getModel('docs'),
			docsPrompts.prompt,
			docsPrompts.appendPrompt,
		);
		docs.name = prefixName('docs');
		agents.push(applyOverrides(docs, swarmAgents, swarmPrefix));
	}

	// 9. Create Designer agent (opt-in — only when ui_review.enabled === true)
	if (
		pluginConfig?.ui_review?.enabled === true &&
		!isAgentDisabled('designer', swarmAgents, swarmPrefix)
	) {
		const designerPrompts = getPrompts('designer');
		const designer = createDesignerAgent(
			getModel('designer'),
			designerPrompts.prompt,
			designerPrompts.appendPrompt,
		);
		designer.name = prefixName('designer');
		agents.push(applyOverrides(designer, swarmAgents, swarmPrefix));
	}

	// === ECC Specialist Agent Registration (37 agents) ===
	// Review/QA category (15 agents)
	for (const eccAgent of [
		{
			name: 'code_reviewer',
			desc: 'Expert code review specialist. Reviews code for correctness, security, and maintainability.',
		},
		{
			name: 'security_reviewer',
			desc: 'Security vulnerability detection and remediation specialist. Evaluates against OWASP Top 10 and common attack vectors.',
		},
		{
			name: 'cpp_reviewer',
			desc: 'Expert C++ code reviewer specializing in memory safety, modern C++ idioms, concurrency, and performance.',
		},
		{
			name: 'go_reviewer',
			desc: 'Expert Go code reviewer specializing in idiomatic Go, concurrency patterns, error handling, and performance.',
		},
		{
			name: 'kotlin_reviewer',
			desc: 'Expert Kotlin and Android/KMP code reviewer specializing in idiomatic patterns, coroutine safety, and Compose best practices.',
		},
		{
			name: 'java_reviewer',
			desc: 'Expert Java and Spring Boot code reviewer specializing in layered architecture, JPA patterns, security, and concurrency.',
		},
		{
			name: 'rust_reviewer',
			desc: 'Expert Rust code reviewer specializing in ownership, lifetimes, concurrency, and performance.',
		},
		{
			name: 'python_reviewer',
			desc: 'Expert Python code reviewer specializing in PEP 8 compliance, type hints, security, and performance.',
		},
		{
			name: 'typescript_reviewer',
			desc: 'Expert TypeScript/JavaScript code reviewer specializing in type safety, async correctness, and idiomatic patterns.',
		},
		{
			name: 'csharp_reviewer',
			desc: 'Expert C# and .NET code reviewer specializing in DI, async patterns, and performance.',
		},
		{
			name: 'flutter_reviewer',
			desc: 'Expert Flutter/Dart code reviewer specializing in widget best practices, state management, and accessibility.',
		},
		{
			name: 'database_reviewer',
			desc: 'PostgreSQL database specialist for query optimization, schema design, indexing, and security.',
		},
		{
			name: 'healthcare_reviewer',
			desc: 'Reviews healthcare application code for clinical safety, CDSS accuracy, PHI compliance, and medical data integrity.',
		},
		{
			name: 'gan_evaluator',
			desc: 'Tests the live running application via Playwright, scores against rubric, and provides actionable feedback.',
		},
		{
			name: 'opensource_sanitizer',
			desc: 'Verifies an open-source fork is fully sanitized before release. Scans for leaked secrets, PII, and dangerous files.',
		},
	] as const) {
		if (!isAgentDisabled(eccAgent.name, swarmAgents, swarmPrefix)) {
			const agent = createECCAgent(
				eccAgent.name,
				getModel(eccAgent.name),
				eccAgent.desc,
			);
			agent.name = prefixName(eccAgent.name);
			agents.push(applyOverrides(agent, swarmAgents, swarmPrefix));
		}
	}

	// Build/pipeline category (8 build resolvers)
	for (const eccAgent of [
		{
			name: 'build_error_resolver',
			desc: 'Build and TypeScript error resolution specialist. Fixes build failures and type errors with minimal diffs.',
		},
		{
			name: 'cpp_build_resolver',
			desc: 'C++ build, CMake, and compilation error resolution specialist.',
		},
		{
			name: 'dart_build_resolver',
			desc: 'Dart/Flutter build, analysis, and dependency error resolution specialist.',
		},
		{
			name: 'go_build_resolver',
			desc: 'Go build, vet, and compilation error resolution specialist.',
		},
		{
			name: 'java_build_resolver',
			desc: 'Java/Maven/Gradle build, compilation, and dependency error resolution specialist.',
		},
		{
			name: 'kotlin_build_resolver',
			desc: 'Kotlin/Gradle build, compilation, and dependency error resolution specialist.',
		},
		{
			name: 'rust_build_resolver',
			desc: 'Rust build, Cargo, and compilation error resolution specialist.',
		},
		{
			name: 'pytorch_build_resolver',
			desc: 'PyTorch runtime, CUDA, and training error resolution specialist.',
		},
	] as const) {
		if (!isAgentDisabled(eccAgent.name, swarmAgents, swarmPrefix)) {
			const agent = createECCAgent(
				eccAgent.name,
				getModel(eccAgent.name),
				eccAgent.desc,
			);
			agent.name = prefixName(eccAgent.name);
			agents.push(applyOverrides(agent, swarmAgents, swarmPrefix));
		}
	}

	// Pipeline category (7 pipeline agents)
	for (const eccAgent of [
		{
			name: 'tdd_guide',
			desc: 'Test-driven development specialist enforcing write-tests-first methodology with 80%+ coverage.',
		},
		{
			name: 'e2e_runner',
			desc: 'End-to-end testing specialist using Playwright for critical user flows.',
		},
		{
			name: 'refactor_cleaner',
			desc: 'Dead code cleanup and consolidation specialist.',
		},
		{
			name: 'performance_optimizer',
			desc: 'Performance analysis and optimization specialist for identifying bottlenecks and improving runtime performance.',
		},
		{
			name: 'gan_generator',
			desc: 'GAN-inspired generator agent for building high-quality applications.',
		},
		{
			name: 'opensource_forker',
			desc: 'Forks and prepares projects for open-sourcing by copying files and stripping secrets.',
		},
		{
			name: 'opensource_packager',
			desc: 'Generates complete open-source packaging including CLAUDE.md, README, LICENSE, and CONTRIBUTING.',
		},
	] as const) {
		if (!isAgentDisabled(eccAgent.name, swarmAgents, swarmPrefix)) {
			const agent = createECCAgent(
				eccAgent.name,
				getModel(eccAgent.name),
				eccAgent.desc,
			);
			agent.name = prefixName(eccAgent.name);
			agents.push(applyOverrides(agent, swarmAgents, swarmPrefix));
		}
	}

	// Support category (7 support agents)
	for (const eccAgent of [
		{
			name: 'planner',
			desc: 'Expert planning specialist for complex features and refactoring.',
		},
		{
			name: 'doc_updater',
			desc: 'Documentation and codemap specialist for updating README, API docs, and guides.',
		},
		{
			name: 'docs_lookup',
			desc: 'Documentation specialist using Context7 MCP to fetch current library and API documentation.',
		},
		{
			name: 'harness_optimizer',
			desc: 'Analyzes and improves the local agent harness configuration for reliability, cost, and throughput.',
		},
		{
			name: 'loop_operator',
			desc: 'Operates autonomous agent loops, monitors progress, and intervenes when loops stall.',
		},
		{
			name: 'chief_of_staff',
			desc: 'Personal communication chief of staff that triages email, Slack, and messaging. Classifies and drafts replies.',
		},
		{
			name: 'gan_planner',
			desc: 'Expands a one-line objective into a full product specification with features, sprints, and evaluation criteria.',
		},
	] as const) {
		if (!isAgentDisabled(eccAgent.name, swarmAgents, swarmPrefix)) {
			const agent = createECCAgent(
				eccAgent.name,
				getModel(eccAgent.name),
				eccAgent.desc,
			);
			agent.name = prefixName(eccAgent.name);
			agents.push(applyOverrides(agent, swarmAgents, swarmPrefix));
		}
	}
	
	// Design Support category (2 design-concerned support specialists)
	for (const eccAgent of [
		{
			name: 'a11y_architect',
			desc: 'Accessibility Architect specializing in WCAG 2.2 compliance for Web and Native platforms. Use PROACTIVELY when designing UI components, establishing design systems, or auditing code for inclusive user experiences.',
		},
		{
			name: 'seo_specialist',
			desc: 'SEO specialist agent for technical SEO, on-page optimization, structured data, Core Web Vitals, and content strategy.',
		},
	] as const) {
		if (!isAgentDisabled(eccAgent.name, swarmAgents, swarmPrefix)) {
			const agent = createECCAgent(
				eccAgent.name,
				getModel(eccAgent.name),
				eccAgent.desc,
			);
			agent.name = prefixName(eccAgent.name);
			agents.push(applyOverrides(agent, swarmAgents, swarmPrefix));
		}
	}

	return agents;
}

/**
 * Create all agent definitions with configuration applied
 */
export function createAgents(config?: PluginConfig): AgentDefinition[] {
	const allAgents: AgentDefinition[] = [];

	// Check if we have swarms configured
	const swarms = config?.swarms;

	if (swarms && Object.keys(swarms).length > 0) {
		// Multiple swarms mode
		// Only a swarm explicitly named "default" gets unprefixed agents
		// All other swarms get prefixed (cloud_*, local_*, etc.)
		for (const swarmId of Object.keys(swarms)) {
			const swarmConfig = swarms[swarmId];
			const isDefault = swarmId === 'default';
			const swarmAgents = createSwarmAgents(
				swarmId,
				swarmConfig,
				isDefault,
				config,
			);
			allAgents.push(...swarmAgents);
		}
	} else {
		// Legacy single swarm mode - use top-level agents config
		const legacySwarmConfig: SwarmConfig = {
			name: 'Default',
			agents: config?.agents,
		};
		const swarmAgents = createSwarmAgents(
			'default',
			legacySwarmConfig,
			true,
			config,
		);
		allAgents.push(...swarmAgents);
	}

	return allAgents;
}

/**
 * Get agent configurations formatted for the OpenCode SDK.
 */
export function getAgentConfigs(
	config?: PluginConfig,
	directory?: string,
	sessionId?: string,
): Record<string, SDKAgentConfig> {
	const agents = createAgents(config);

	// Check if tool filtering is disabled globally
	const toolFilterEnabled = config?.tool_filter?.enabled ?? true;
	const toolFilterOverrides = config?.tool_filter?.overrides ?? {};

	// Track warning for missing whitelist entries (warn once per unique base name)
	const warnedMissingWhitelist = new Set<string>();

	// Accumulate per-agent tool snapshot for evidence writing
	const agentToolSnapshot: Record<string, string[]> = {};

	const result = Object.fromEntries(
		agents.map((agent) => {
			const sdkConfig: SDKAgentConfig = {
				...agent.config,
				description: agent.description,
			};

			// Extract base agent name using canonical prefix stripper (supports underscore, hyphen, space)
			const baseAgentName = stripKnownSwarmPrefix(agent.name);

			// Apply mode based on agent type
			// Architects are primary, everything else is subagent (uses canonical base name)
			if (baseAgentName === 'architect') {
				sdkConfig.mode = 'primary';
				// Allow task delegation for architect agents
				(sdkConfig.permission as Record<string, 'allow'>) = { task: 'allow' };
			} else {
				sdkConfig.mode = 'subagent';
				// Allow task delegation for agents that delegate to ECC specialists
				if (baseAgentName === 'coder') {
					// Coder delegates to ECC build resolvers and gan_generator
					(sdkConfig.permission as Record<string, 'allow'>) = { task: 'allow' };
				} else if (baseAgentName === 'reviewer') {
					// Reviewer delegates to ECC review specialists
					(sdkConfig.permission as Record<string, 'allow'>) = { task: 'allow' };
				} else if (baseAgentName === 'explorer') {
					// Explorer delegates to ECC research specialists
					(sdkConfig.permission as Record<string, 'allow'>) = { task: 'allow' };
				} else if (
					baseAgentName === 'critic' ||
					baseAgentName === 'critic_sounding_board' ||
					baseAgentName === 'critic_drift_verifier' ||
					baseAgentName === 'critic_oversight'
				) {
					// Critic delegates to ECC planning specialists (planner, gan_planner)
					(sdkConfig.permission as Record<string, 'allow'>) = { task: 'allow' };
				} else if (baseAgentName === 'docs') {
					// Docs delegates to ECC doc specialists (doc_updater, docs_lookup)
					(sdkConfig.permission as Record<string, 'allow'>) = { task: 'allow' };
				} else if (baseAgentName === 'designer') {
					// Designer delegates to ECC design specialists (a11y_architect, seo_specialist)
					(sdkConfig.permission as Record<string, 'allow'>) = { task: 'allow' };
				}
			}

			// Remove model for primary agents (model selection handled by orchestrator)
			if (sdkConfig.mode === 'primary') {
				delete sdkConfig.model;
			}

			// If tool filtering is globally disabled, use original tools unchanged
			if (!toolFilterEnabled) {
				sdkConfig.tools = agent.config.tools ?? {};
				agentToolSnapshot[agent.name] = Object.keys(
					sdkConfig.tools ?? {},
				).filter((k) => sdkConfig.tools![k] !== false);
				return [agent.name, sdkConfig];
			}

			// Determine allowed tools: check override first, then fall back to AGENT_TOOL_MAP
			let allowedTools: string[] | undefined;
			const override = toolFilterOverrides[baseAgentName];
			if (override !== undefined) {
				// Override exists - use it (even if empty array)
				allowedTools = override;
			} else {
				// No override - use default AGENT_TOOL_MAP
				allowedTools =
					AGENT_TOOL_MAP[baseAgentName as keyof typeof AGENT_TOOL_MAP];
			}

			// Feature-gate: when council is enabled, the architect's system prompt
			// instructs the model to call `declare_council_criteria` and
			// `convene_council`. A user-supplied tool_filter.overrides.architect
			// that omits these tools would silently break the council workflow
			// (same class as the original 6.66.0 bug: tools present in
			// AGENT_TOOL_MAP but not usable). We refuse to silently override
			// explicit user intent and refuse to silently lose the feature —
			// throw a clear conflict error and make the user resolve it.
			if (
				baseAgentName === 'architect' &&
				config?.council?.enabled === true &&
				override !== undefined
			) {
				const required = ['declare_council_criteria', 'convene_council'];
				const missing = required.filter((t) => !override.includes(t));
				if (missing.length > 0) {
					throw new Error(
						`[opencode-swarm] Conflicting config: council.enabled=true but tool_filter.overrides.architect omits ${missing.join(', ')}. ` +
							`Either set council.enabled=false, remove the architect override entirely to fall back on AGENT_TOOL_MAP, or add the missing council tools to the override. ` +
							`Refusing to silently override your explicit tool_filter.overrides.architect.`,
					);
				}
			}

			// Warn once when base name lacks a whitelist entry (no override and no AGENT_TOOL_MAP)
			if (!allowedTools && !Object.hasOwn(toolFilterOverrides, baseAgentName)) {
				if (!warnedMissingWhitelist.has(baseAgentName)) {
					console.warn(
						`[getAgentConfigs] Unknown agent '${baseAgentName}', defaulting to minimal toolset.`,
					);
					warnedMissingWhitelist.add(baseAgentName);
				}
			}

			// Copy original tools to preserve flags (including write/edit)
			const originalTools = agent.config.tools
				? { ...agent.config.tools }
				: undefined;

			if (allowedTools) {
				// Preserve explicit false flags from original tools
				const baseTools = originalTools ?? {};
				const disabledTools = Object.fromEntries(
					Object.entries(baseTools).filter(([, value]) => value === false),
				);
				const filteredTools: Record<string, boolean> = { ...disabledTools };

				// Add allowed tools (skip if explicitly disabled)
				for (const tool of allowedTools) {
					if (filteredTools[tool] === false) continue;
					filteredTools[tool] = true;
				}
				sdkConfig.tools = filteredTools;
			} else {
				// No whitelist entry: default to minimal safe toolset
				sdkConfig.tools = {
					write: false,
					edit: false,
				};
			}

			agentToolSnapshot[agent.name] = Object.keys(sdkConfig.tools ?? {}).filter(
				(k) => sdkConfig.tools![k] !== false,
			);

			return [agent.name, sdkConfig];
		}),
	);

	// Write agent tool snapshot non-blocking
	if (directory) {
		const sid = sessionId ?? `init-${Date.now()}`;
		const evidenceDir = path.join(directory, '.swarm', 'evidence');
		const filename = `agent-tools-${sid}.json`;
		const snapshotData = JSON.stringify(
			{
				sessionId: sid,
				generatedAt: new Date().toISOString(),
				agents: agentToolSnapshot,
			},
			null,
			2,
		);
		void mkdir(evidenceDir, { recursive: true })
			.then(() => writeFile(path.join(evidenceDir, filename), snapshotData))
			.catch(() => {});
	}

	return result;
}

// Re-export agent types
export { createArchitectAgent } from './architect';
export { CODER_PROMPT, createCoderAgent } from './coder';
export { createCriticAgent } from './critic';
export { createCuratorAgent } from './curator-agent';
export { createDesignerAgent } from './designer';
export { createDocsAgent, DOCS_PROMPT } from './docs';
export { EXPLORER_PROMPT, createExplorerAgent } from './explorer';
export {
	createReviewerAgent,
	REVIEWER_PROMPT,
	SECURITY_CATEGORIES,
	type SecurityCategory,
} from './reviewer';
export { createSMEAgent } from './sme';
export { createTestEngineerAgent } from './test-engineer';
// Re-export Critic prompts for testing
export {
  PLAN_CRITIC_PROMPT,
  SOUNDING_BOARD_PROMPT,
  PHASE_DRIFT_VERIFIER_PROMPT,
  AUTONOMOUS_OVERSIGHT_PROMPT,
  type CriticRole,
  type SoundingBoardVerdict,
  type SoundingBoardResponse,
  parseSoundingBoardResponse,
} from './critic';
