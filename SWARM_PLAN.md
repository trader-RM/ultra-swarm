# Ultra Swarm ECC Agent Exposure
Swarm: default
Phase: 1 [PENDING] | Updated: 2026-04-13T22:36:02.253Z

---
## Phase 1: Baseline Infrastructure [PENDING]
- [ ] 1.1: Create .swarm/context.md with current project decisions, patterns, and file map for Ultra Swarm [SMALL]
- [ ] 1.2: Run baseline build verification on unmodified base/opencode-swarm. Document pre-existing build/lint failures. Create git checkpoint pre-ecc-modifications for rollback safety. [SMALL]

---
## Phase 2: Register ECC Agent Names and Tool Assignments [PENDING]
- [ ] 2.1: Add 29 ECC agent names to ALL_SUBAGENT_NAMES in constants.ts. Architect excluded: Swarm has ORCHESTRATOR_NAME at constants.ts line 7. Names: code_reviewer, security_reviewer, cpp_reviewer, go_reviewer, kotlin_reviewer, java_reviewer, rust_reviewer, python_reviewer, typescript_reviewer, csharp_reviewer, dart_reviewer, flutter_reviewer, database_reviewer, healthcare_reviewer, cpp_build_resolver, go_build_resolver, kotlin_build_resolver, java_build_resolver, rust_build_resolver, pytorch_build_resolver, dart_build_resolver, build_error_resolver, tdd_guide, e2e_runner, refactor_cleaner, performance_optimizer, planner, doc_updater, docs_lookup [MEDIUM] (depends: 1.2)
- [ ] 2.2: Add 29 ECC agent entries to AGENT_TOOL_MAP in constants.ts. REVIEW (14 agents): diff, imports, lint, pkg_audit, pre_check_batch, secretscan, symbols, complexity_hotspots, retrieve_summary, extract_code_blocks, test_runner, sast_scan, placeholder_scan, knowledge_recall, search, batch_symbols, suggest_patch, repo_map. BUILD (8 agents): diff, imports, lint, symbols, extract_code_blocks, retrieve_summary, search, build_check, syntax_check, knowledge_add, knowledge_recall, repo_map. PIPELINE (4 agents): BUILD tools plus test_runner, pkg_audit, complexity_hotspots. SUPPORT (3 agents): complexity_hotspots, detect_domains, extract_code_blocks, gitingest, imports, retrieve_summary, schema_drift, symbols, todo_extract, knowledge_recall, doc_scan, repo_map. [MEDIUM] (depends: 2.1)
- [ ] 2.3: Update architect prompt roster at architect.ts line 51 to add ECC agent groups: coding specialists (build_error_resolver, lang build resolvers, tdd_guide, e2e_runner, refactor_cleaner, performance_optimizer), review specialists (code_reviewer, security_reviewer, lang/domain reviewers), support specialists (planner, doc_updater, docs_lookup) [SMALL] (depends: 2.1)

---
## Phase 3: Agent Factory and Category Registration [PENDING]
- [ ] 3.1: Add createECCAgent factory function in index.ts for AgentDefinition with name, model, description, tools. Add creation calls for all 29 ECC agents in createSwarmAgents with isAgentDisabled guard and prefixName. [LARGE] (depends: 2.2)
- [ ] 3.2: Add 29 entries to AGENT_CATEGORY in agent-categories.ts: 14 qa (review agents), 12 pipeline (build resolvers plus tdd_guide, e2e_runner, refactor_cleaner, performance_optimizer), 3 support (planner, doc_updater, docs_lookup). [SMALL] (depends: 2.1)
- [ ] 3.3: Verify stripKnownSwarmPrefix in schema.ts resolves ECC names via ALL_AGENT_NAMES membership. Add comment at function noting ECC names are resolvable. Test: stripKnownSwarmPrefix('local_cpp_build_resolver') returns 'cpp_build_resolver'. [SMALL] (depends: 2.1)

---
## Phase 4: Build Verification and Validation [PENDING]
- [ ] 4.1: Run TypeScript build and lint on modified base/opencode-swarm. Compare against task 1.2 baseline. [SMALL] (depends: 3.1, 3.2, 3.3)
- [ ] 4.2: Run test suite for base/opencode-swarm. Cross-reference failures against 1.2 baseline. If regressions, restore from checkpoint pre-ecc-modifications. [SMALL] (depends: 4.1)

---
## Phase 5: Documentation and Commit [PENDING]
- [ ] 5.1: Update README.md and AGENTS.md to document ECC agent exposure with role mappings and naming conventions [SMALL] (depends: 4.2)
- [ ] 5.2: Commit all Phase 1-4 changes with message: feat: expose 29 ECC specialist agents to Swarm delegation system [SMALL] (depends: 5.1)
