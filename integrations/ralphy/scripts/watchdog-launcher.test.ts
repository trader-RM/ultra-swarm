import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import {
  startWatchdog,
  stopWatchdog,
  parseStatusLine,
  writeCriticalEvidence,
} from "./watchdog-launcher";
import fs from "node:fs";
import path from "node:path";

describe("watchdog launcher", () => {
  it("starts the watchdog process without throwing", async () => {
    const swarmDir = path.join(__dirname, "..", "..", ".swarm");
    const proc = startWatchdog(swarmDir);
    expect(proc).not.toBeNull();
    stopWatchdog(proc);
  });

  it("can stop the watchdog process cleanly", async () => {
    const swarmDir = path.join(__dirname, "..", "..", ".swarm");
    const proc = startWatchdog(swarmDir);
    expect(proc).not.toBeNull();
    expect(() => stopWatchdog(proc)).not.toThrow();
  });

  it("parses a status line correctly", () => {
    const line = "[12:34:56] [INFO] Running: 5m | Evidence: foo.md (10 min ago) | Context: 2 min ago";
    const status = parseStatusLine(line);
    expect(status).not.toBeNull();
    expect(status!.level).toBe("INFO");
    expect(status!.message).toContain("Running: 5m");
  });

  it("returns null for a non-status line", () => {
    const line = "random text";
    const status = parseStatusLine(line);
    expect(status).toBeNull();
  });
});

describe("critical handler", () => {
  const tmpDir = path.join(__dirname, "tmp-test-evidence");

  beforeEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true });
    }
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true });
    }
  });

  it("writes a critical evidence file to the watchdog subdirectory", () => {
    const swarmDir = tmpDir;
    const writtenPath = writeCriticalEvidence(swarmDir, 30);
    expect(writtenPath).toContain("watchdog");
    expect(path.basename(path.dirname(writtenPath))).toBe("watchdog");
    expect(fs.existsSync(writtenPath)).toBe(true);
    const content = fs.readFileSync(writtenPath, "utf-8");
    expect(content).toContain("CRITICAL");
    expect(content).toContain("30");
  });

  it("does not throw when watchdog directory does not exist", () => {
    const nonexistentSwarmDir = path.join(tmpDir, "nonexistent");
    expect(() => writeCriticalEvidence(nonexistentSwarmDir, 30)).not.toThrow();
  });
});
