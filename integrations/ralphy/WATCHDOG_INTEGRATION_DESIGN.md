# Ralphy Outer Watchdog Integration Design

## Decisions

1. **Trigger mechanism:** Spawn as a child process from a Bun/Node script using `Bun.spawn` or `child_process.spawn`. Rationale: keeps the watchdog lifecycle tied to the outer loop, avoids orphaned jobs, and gives direct start/stop control.
2. **Signal channel:** Use the spawned child process stdout pipe. Rationale: the watchdog already emits status lines to stdout, so the outer loop can parse them without extra files or polling.
3. **Swarm state consumed:** Monitor `.swarm/evidence/` timestamps only; do not use `.swarm/plan.json` progress or `.swarm/context.md` mod time in MVP. Rationale: evidence files are the canonical signal of active work, while plan/context updates create false positives.
4. **Intervention on CRITICAL:** Write a `.swarm/watchdog/watchdog-critical-{ts}.md` artifact and log to stderr. Rationale: creates an observable downstream artifact without modifying swarm session state. The artifact must NOT go into `.swarm/evidence/` because the watchdog monitors that directory for staleness — writing there would reset the staleness timer and mask the very condition being reported. The `.swarm/watchdog/` subdirectory is outside the monitored scope.
5. **Loop boundary:** Use a standalone Bun process in `integrations/ralphy/scripts/watchdog-launcher.ts`. Rationale: keeps watchdog logic out of plugin core and inner repo code, while remaining independently launchable.

## Introduction

The outer watchdog is responsible for observing Ralphy session health from outside the inner execution loop. Its job is to detect stalled progress, surface WARN/CRITICAL conditions quickly, and leave the active swarm session untouched except for a non-invasive evidence artifact when intervention is required.

## Implementation

### Launcher (`watchdog-launcher.ts`)

- Import `path` and use `Bun.spawn` to start `watchdog-watch.ps1`.
- Pass the correct `-SwarmDir` argument pointing at the Ultra Swarm `.swarm/` directory.
- Store the process handle in a mutable variable so the launcher can stop or inspect the child later.
- Expose `start()` and `stop()` functions.
- `start()` resolves when the process spawns, not when it exits.
- `stop()` sends `SIGTERM` (or the Windows `taskkill` equivalent) and waits for process exit.

### Signal Channel (stdout parser)

- Read stdout line-by-line through a `ReadableStream` text decoder.
- Parse lines in the form `[HH:mm:ss] [LEVEL] Message`.
- Expose `getLastStatus(): { level: string, message: string } | null`.
- Forward `CRITICAL` and `WARN` levels to the CRITICAL handler immediately.

### CRITICAL Handler

- Write `.swarm/watchdog/watchdog-critical-{ISO8601}.md`.
- Include timestamp, staleness duration, and a suggested user action.
- Log to stderr in the form: `[CRITICAL] Watchdog detected stalled session: {duration} min`.
- If `.swarm/watchdog/` does not exist, create it recursively with `fs.mkdirSync`.

### Data Source and Scope

- Consume `.swarm/evidence/` file timestamps only.
- Do not use `.swarm/plan.json` progress in MVP.
- Do not use `.swarm/context.md` mod time in MVP.
- Keep the watchdog non-invasive: observe only, and do not write to swarm session state.

### Operational Constraints

- No auto-restart in MVP.
- No configuration UI.
- No plan.json integration in MVP.
- Must work on Windows with a PowerShell child process.
- Must remain testable.

### Expected Flow

1. The launcher starts the PowerShell watchdog child process.
2. Stdout lines are decoded and parsed into structured status updates.
3. Evidence timestamp changes are used to judge liveness.
4. WARN/CRITICAL statuses are surfaced immediately.
5. CRITICAL conditions emit a new evidence artifact and stderr alert.
