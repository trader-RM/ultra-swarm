import { spawn } from "bun";
import fs from "node:fs";
import path from "node:path";

export interface WatchdogStatus {
  level: string;
  message: string;
}

/**
 * Start the PowerShell watchdog as a managed child process.
 * @param swarmDir Path to the .swarm directory to monitor
 * @returns The spawned Bun.Subprocess handle
 */
export function startWatchdog(swarmDir: string): ReturnType<typeof spawn> {
  const scriptPath = path.join(__dirname, "watchdog-watch.ps1");
  const proc = spawn({
    cmd: [
      "powershell.exe",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
      "-SwarmDir",
      swarmDir,
    ],
    stdout: "pipe",
    stderr: "pipe",
    onExit(_proc, exitCode, _signalCode, _error) {
      if (exitCode !== 0 && exitCode !== null) {
        console.error(`Watchdog exited with code ${exitCode}`);
      }
    },
  });

  return proc;
}

/**
 * Terminate the watchdog child process cleanly.
 * @param proc The Bun.Subprocess handle returned by startWatchdog
 */
export function stopWatchdog(proc: { kill?: () => unknown } | null | undefined): void {
  if (proc && typeof proc.kill === "function") {
    proc.kill();
  }
}

/**
 * Parse a watchdog stdout line into structured status.
 * Expected format: [HH:mm:ss] [LEVEL] Message
 * @param line Raw line from watchdog stdout
 * @returns Parsed status or null if the line doesn't match
 */
export function parseStatusLine(line: string): WatchdogStatus | null {
  const match = line.match(/^\[(\d{2}:\d{2}:\d{2})\]\s+\[(\w+)\]\s+(.*)$/);
  if (!match) {
    return null;
  }

  const [, _timestamp, level, message] = match;
  return { level, message };
}

/**
 * Write a CRITICAL evidence artifact when the watchdog detects a stalled session.
 * @param evidenceDir Path to the evidence directory (e.g., .swarm/evidence)
 * @param durationMinutes How long the session has been stalled
 * @returns Absolute path to the written file
 */
export function writeCriticalEvidence(evidenceDir: string, durationMinutes: number): string {
  fs.mkdirSync(evidenceDir, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(evidenceDir, `watchdog-critical-${timestamp}.md`);
  const createdAt = new Date().toISOString();
  const content = `# Watchdog CRITICAL Alert

Date: ${createdAt}
Staleness: ${durationMinutes} minutes

## Summary

The watchdog detected no new evidence files in .swarm/evidence/ for ${durationMinutes} minutes.
The session may be stalled.

## Suggested Actions

- Check if the swarm is still processing
- Review .swarm/plan.md for blocked tasks
- Verify that the agent pipeline is functioning
`;

  fs.writeFileSync(filePath, content, "utf-8");
  console.error(`[CRITICAL] Watchdog detected stalled session: ${durationMinutes} min`);
  return filePath;
}
