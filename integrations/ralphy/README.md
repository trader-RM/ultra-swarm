# Ralphy Integration -- Outer Watchdog

Ralphy serves as the **outer watchdog layer** for Ultra Swarm. It runs independently of the Swarm's internal architect->coder->reviewer pipeline, observing but never entering it.

## Architecture

```
┌──────────────────────────────────────┐
│  Ralphy (OUTER loop)                 │
│  - Observes .swarm/evidence/         │
│  - Detects staleness (no progress)   │
│  - Alerts user when session stuck    │
│  - NEVER writes to .swarm/           │
│  - NEVER calls coder/reviewer        │
└──────────────────────────────────────┘
         │ observes (read-only)
         ▼
┌──────────────────────────────────────┐
│  Ultra Swarm (INNER loop)            │
│  - Architect -> Coder -> Reviewer      │
│  - Test Engineer -> QA Gates          │
│  - Owns .swarm/ state                │
│  - Ralphy does NOT interfere         │
└──────────────────────────────────────┘
```

## Critical Rules

1. **RALPHY NEVER ENTERS THE INNER LOOP** -- It does not delegate to coder, reviewer, or test_engineer
2. **RALPHY NEVER WRITES TO .swarm/** -- It observes plan.md and evidence/ in read-only mode
3. **CORRECTIVE ACTION = ALERT USER** -- When staleness is detected, the watchdog alerts via Windows toast notification + console warning. It does NOT restart or modify the Swarm.

## Files

| File | Purpose |
|------|---------|
| `repo/` | Cloned Ralphy repository (from https://github.com/michaelshimeles/ralphy) |
| `configs/watchdog.yaml` | Ralphy configuration for read-only watchdog mode |
| `scripts/watchdog-watch.ps1` | PowerShell staleness monitor (recommended for Windows) |
| `scripts/watchdog-run.sh` | Bash wrapper with safety warnings |

## Usage

### Watchdog Mode (Recommended -- Safe)

Run the PowerShell watchdog script to monitor `.swarm/evidence/` for staleness:

```powershell
# From project root (D:\Repos\Ultra Swarm):
powershell -ExecutionPolicy Bypass -File integrations\ralphy\scripts\watchdog-watch.ps1

# Custom thresholds:
powershell -ExecutionPolicy Bypass -File integrations\ralphy\scripts\watchdog-watch.ps1 -StaleMinutes 10 -CriticalMinutes 20
```

The watchdog will:
- Check for new evidence files every 60 seconds
- Warn when no evidence has been written for 15 minutes (configurable)
- Alert critically when no evidence for 30 minutes (configurable)
- Show Windows toast notifications on alerts

### Direct Ralphy Execution (Advanced -- NOT Read-Only)

⚠ **WARNING**: Direct Ralphy execution will modify files. Only use this when you intentionally want an outer coding loop that drives the AI independently.

```bash
# Uses .swarm/plan.md as the PRD source:
./integrations/ralphy/repo/ralphy.sh --opencode --prd .swarm/plan.md
```

This runs Ralphy's standard PRD-driven loop against the Swarm's plan. Each incomplete task becomes a Ralphy iteration. **This bypasses the Swarm's QA gates entirely** -- use with caution.

## Why Read-Only?

The Swarm's internal loop has rigorous quality gates (reviewer, test_engineer, pre_check_batch). If Ralphy were to enter this loop, it would bypass these gates, potentially shipping unreviewed code. The watchdog maintains the boundary: observe, alert, but never interfere.

## Staleness Detection

The watchdog considers the session "stuck" when:
- No new files appear in `.swarm/evidence/` for 15+ minutes
- `.swarm/context.md` has not been updated for 30+ minutes

These thresholds are configurable via script parameters.
