# Ultra Swarm

Integration workspace for the Ultra Swarm system.

## Current State

- **OpenCode Swarm** has been copied into `base/opencode-swarm/` as the starting codebase (untouched).
- **Ralphy** is reserved at `integrations/ralphy/` for later outer-loop watchdog integration.
- **ECC**, **opencode-agent-skills**, and **OpenSkills** have placeholder directories under `integrations/`.
- **No behavioral changes have been made yet.** This repo is scaffolding only.
- **Phase 1 complete:** `.swarm/` infrastructure established (context.md, spec.md, plan.md). Baseline build verified. Git tag `pre-ecc-modifications` created for rollback safety.

## Structure

| Path | Purpose |
|------|---------|
| `base/opencode-swarm/` | Untouched copy of OpenCode Swarm base code |
| `integrations/swarm/` | Swarm-specific integration layer (placeholder) |
| `integrations/ecc/` | ECC integration layer (placeholder) |
| `integrations/opencode-agent-skills/` | Modified skills layer (placeholder) |
| `integrations/openskills/` | OpenSkills sync layer (placeholder) |
| `integrations/ralphy/` | Ralphy outer-loop watchdog (reserved) |
| `.opencode/` | OpenCode agent/skill/command/plugin definitions |
| `configs/` | Configuration files |
| `scripts/` | Utility scripts |
| `docs/` | Documentation |
| `tests/` | Test suite |
| `tmp/` | Temporary working files (gitignored) |

