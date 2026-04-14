# Ultra Swarm ECC Agent Exposure
Swarm: default
Phase: 1 [PENDING] | Updated: 2026-04-13T23:07:47.565Z

---
## Phase 1: Baseline Infrastructure [PENDING]
- [ ] 1.1: Create .swarm/context.md and .swarm/spec.md for Ultra Swarm project [SMALL]
- [x] 1.2: Run baseline build verification on unmodified base/opencode-swarm. Document pre-existing build/lint failures. Create git tag pre-ecc-modifications for rollback safety. [SMALL]

---
## Phase 2: Register ECC Agent Names and Tool Assignments [IN PROGRESS]
- [ ] 2.1: Add 37 ECC agent names (underscored) to ALL_SUBAGENT_NAMES in constants.ts. 2 exclusions: architect (collision with ORCHESTRATOR_NAME) and build (mode:primary conflicts with single-orchestrator). REVIEW/QA (15): code_reviewer, security_reviewer, cpp_reviewer, go_reviewer, kotlin_reviewer, java_reviewer, rust_reviewer, python_reviewer, typescript_reviewer, csharp_reviewer, flutter_reviewer, database_reviewer, healthcare_reviewer, gan_evaluator, opensource_sanitizer. BUILD (8): cpp_build_resolver, go_build_resolver, kotlin_build_resolver, java_build_resolver, rust_build_resolver, pytorch_build_resolver, dart_build_resolver, build_error_resolver. PIPELINE (7): tdd_guide, e2e_runner, refactor_cleaner, performance_optimizer, gan_generator, opensource_forker, opensource_packager. SUPPORT (7): planner, doc_updater, docs_lookup, harness_optimizer, loop_operator, chief_of_staff, gan_planner. [MEDIUM] (depends: 1.2)
- [ ] 2.2: Add 37 ECC agent entries to AGENT_TOOL_MAP in constants.ts. REVIEW/QA (15 agents): diff, imports, lint, pkg_audit, pre_check_batch, secretscan, symbols, complexity_hotspots, retrieve_summary, extract_code_blocks, test_runner, sast_scan, placeholder_scan, knowledge_recall, search, batch_symbols, suggest_patch, repo_map. BUILD (8 agents): diff, imports, lint, symbols, extract_code_blocks, retrieve_summary, search, build_check, syntax_check, knowledge_add, knowledge_recall, repo_map. PIPELINE (7 agents): BUILD tools plus test_runner, pkg_audit, complexity_hotspots. SUPPORT (7 agents): complexity_hotspots, detect_domains, extract_code_blocks, gitingest, imports, retrieve_summary, schema_drift, symbols, todo_extract, knowledge_recall, doc_scan, repo_map. [MEDIUM] (depends: 2.1)
- [ ] 2.3: Update architect prompt roster at architect.ts line 51 to add ECC agent groups: REVIEW specialists (code_reviewer, security_reviewer, and all lang/domain reviewers plus gan_evaluator, opensource_sanitizer), CODING specialists (build_error_resolver, all 7 lang build resolvers, tdd_guide, e2e_runner, refactor_cleaner, performance_optimizer, gan_generator, opensource_forker, opensource_packager), SUPPORT specialists (planner, doc_updater, docs_lookup, harness_optimizer, loop_operator, chief_of_staff, gan_planner) [SMALL] (depends: 2.1)

---
## Phase 3: Agent Factory and Category Registration [PENDING]
- [ ] 3.1: Add createECCAgent factory function in index.ts. Add creation calls for all 37 ECC agents inside createSwarmAgents with isAgentDisabled guard and prefixName. ECC agents are subagent-mode by default (no custom prompt module). [LARGE] (depends: 2.2)
- [ ] 3.2: Add 37 entries to AGENT_CATEGORY in agent-categories.ts: 15 review=qa (code_reviewer through opensource_sanitizer), 15 coding=pipeline (8 BUILD plus tdd_guide, e2e_runner, refactor_cleaner, performance_optimizer, gan_generator, opensource_forker, opensource_packager), 7 support=support (planner, doc_updater, docs_lookup, harness_optimizer, loop_operator, chief_of_staff, gan_planner). [SMALL] (depends: 2.1)
- [ ] 3.3: Verify stripKnownSwarmPrefix in schema.ts resolves ECC names via ALL_AGENT_NAMES membership. Add comment noting ECC names are resolvable. Test: stripKnownSwarmPrefix('local_gan_evaluator') returns 'gan_evaluator'. [SMALL] (depends: 2.1)

---
## Phase 4: Build Verification and Validation [PENDING]
- [ ] 4.1: Run TypeScript build and lint on modified base/opencode-swarm. Compare against task 1.2 baseline. [SMALL] (depends: 3.1, 3.2, 3.3)
- [ ] 4.2: Run test suite for base/opencode-swarm. Cross-reference failures against 1.2 baseline. If regressions, restore from pre-ecc-modifications and fix. [SMALL] (depends: 4.1)

---
## Phase 5: Documentation and Commit [PENDING]
- [ ] 5.1: Update README.md and AGENTS.md documenting all 37 ECC agents with their Swarm role mapping and underscore naming convention [SMALL] (depends: 4.2)
- [ ] 5.2: Commit all Phase 1-4 changes with message: feat: expose 37 ECC specialist agents to Swarm delegation system [SMALL] (depends: 5.1)
