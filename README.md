# Ultra Swarm

Integration workspace for exposing 37 ECC specialist agents to the OpenCode Swarm delegation system.

## Current State

- **OpenCode Swarm v6.68.0** base code in `base/opencode-swarm/` with ECC modifications applied (Phases 2-4 complete).
- **37 ECC agents** registered in the Swarm architect's delegation roster, agent factory, tool assignments, and category map.
- **Ralphy** is reserved at `integrations/ralphy/` for later outer-loop watchdog integration.
- **Phase 4 complete:** Build verification PASS, test suite PASS (1478/1478, 0 regressions).
- **Git tag `pre-ecc-modifications`** preserved for rollback safety.

## ECC Agent Categories

| Category | Count | Agents |
|----------|-------|--------|
| Review/QA | 15 | code_reviewer, security_reviewer, cpp_reviewer, go_reviewer, kotlin_reviewer, java_reviewer, rust_reviewer, python_reviewer, typescript_reviewer, csharp_reviewer, flutter_reviewer, database_reviewer, healthcare_reviewer, gan_evaluator, opensource_sanitizer |
| Build | 8 | build_error_resolver, cpp_build_resolver, go_build_resolver, kotlin_build_resolver, java_build_resolver, rust_build_resolver, pytorch_build_resolver, dart_build_resolver |
| Pipeline | 7 | tdd_guide, e2e_runner, refactor_cleaner, performance_optimizer, gan_generator, opensource_forker, opensource_packager |
| Support | 7 | planner, doc_updater, docs_lookup, harness_optimizer, loop_operator, chief_of_staff, gan_planner |

## Naming Convention

ECC agent names use **underscores** (not hyphens) to match Swarm identifier conventions:
- `cpp-build-resolver` → `cpp_build_resolver`
- `code-reviewer` → `code_reviewer`

Prefix resolution: `stripKnownSwarmPrefix('local_gan_evaluator')` → `'gan_evaluator'`

## Exclusions

Two ECC agents are **excluded** from exposure:
- `architect` — Collision with Swarm's sole orchestrator (ORCHESTRATOR_NAME)
- `build` — Has `mode: "primary"` which conflicts with Swarm's single-orchestrator architecture

## Structure

| Path | Purpose |
|------|---------|
| `base/opencode-swarm/` | Modified OpenCode Swarm v6.68.0 base with ECC agent registrations |
| `integrations/ralphy/` | Ralphy outer-loop watchdog (reserved) |
| `.swarm/` | Swarm state files (plan.md, context.md, spec.md, evidence/) |

