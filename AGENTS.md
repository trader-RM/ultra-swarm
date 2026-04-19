# Ultra Swarm — Agent Definitions

> ECC agent exposure implementation — Phases 1-4 in progress.

## Current Policy

- **Implementation is in progress.** ECC agent exposure work (Phase 2+) modifies files in `base/opencode-swarm/`.
- The **Swarm base code** at `base/opencode-swarm/` may be modified for ECC agent registration, factory functions, category mappings, and architect prompt updates.
- **Global ECC registry** (`C:\Users\Ryan McNish\.config\opencode\opencode.json`) remains **read-only** — never modified by Ultra Swarm.
- Agent definitions are being written as part of the integration layer (Phases 2-5).

## Phase 3 Status: COMPLETE (Updated)

### ECC Agent Factory
- `createECCAgent` factory function in `base/opencode-swarm/src/agents/index.ts` creates `AgentDefinition` objects for ECC specialist agents
- 45 ECC agents registered in `createSwarmAgents` via 4 category loops:
  - **Review/QA (18):** code_reviewer, security_reviewer, cpp_reviewer, go_reviewer, kotlin_reviewer, java_reviewer, rust_reviewer, python_reviewer, typescript_reviewer, csharp_reviewer, flutter_reviewer, database_reviewer, healthcare_reviewer, gan_evaluator, opensource_sanitizer, pr_test_analyzer, silent_failure_hunter, type_design_analyzer
  - **Build (8):** build_error_resolver, cpp_build_resolver, go_build_resolver, kotlin_build_resolver, java_build_resolver, rust_build_resolver, pytorch_build_resolver, dart_build_resolver
  - **Pipeline (8):** tdd_guide, e2e_runner, refactor_cleaner, performance_optimizer, gan_generator, opensource_forker, opensource_packager, code_simplifier
  - **Support (11):** planner, doc_updater, docs_lookup, harness_optimizer, loop_operator, chief_of_staff, gan_planner, code_architect, code_explorer, comment_analyzer, conversation_analyzer

### Agent Categories
- 61 entries in `AGENT_CATEGORY` map (base/opencode-swarm/src/config/agent-categories.ts)
- Categories: qa (20 agents), pipeline (16 agents), support (13 agents), orchestrator (1), coding (1)*
- ECC additions: type_design_analyzer, pr_test_analyzer, silent_failure_hunter (qa); code_simplifier (pipeline); code_architect, code_explorer, comment_analyzer, conversation_analyzer (support)

### Name Resolution
- `stripKnownSwarmPrefix` in schema.ts resolves ECC names via membership in `ALL_AGENT_NAMES`
- Example: `stripKnownSwarmPrefix('local_gan_evaluator')` → `'gan_evaluator'`

### Test Coverage
- `factory.test.ts`: 24 tests (agent counts, names, configs, prefix handling)
- `ecc-agents-registration.test.ts`: 19 tests (names, tools, categories, prefix resolution)

### Commit History
- `e4f2776` — Phase 2-3 ECC agent registrations on v6.68.0 base
- `bb72157` — Phase 3 complete: factory + categories + name resolution

