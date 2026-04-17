/**
 * Tests for src/db/qa-gate-profile.ts.
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { closeAllProjectDbs, getProjectDb } from './project-db.js';
import {
	computeProfileHash,
	DEFAULT_QA_GATES,
	getEffectiveGates,
	getOrCreateProfile,
	getProfile,
	lockProfile,
	setGates,
} from './qa-gate-profile.js';

let tempDir: string;

beforeEach(() => {
	tempDir = fs.realpathSync(
		fs.mkdtempSync(path.join(process.cwd(), 'qa-gate-profile-test-')),
	);
});

afterEach(() => {
	closeAllProjectDbs();
	try {
		fs.rmSync(tempDir, { recursive: true, force: true });
	} catch {
		// ignore
	}
});

describe('qa-gate-profile', () => {
	test('getProfile returns null for unknown plan_id', () => {
		expect(getProfile(tempDir, 'missing')).toBeNull();
	});

	test('getProfile does NOT create .swarm/swarm.db on read from fresh dir', () => {
		const dbPath = path.join(tempDir, '.swarm', 'swarm.db');
		// Precondition: fresh dir, no .swarm
		expect(fs.existsSync(path.join(tempDir, '.swarm'))).toBe(false);
		expect(fs.existsSync(dbPath)).toBe(false);

		const result = getProfile(tempDir, 'plan-that-does-not-exist');
		expect(result).toBeNull();

		// Postcondition: read-only call must not have created the DB file
		expect(fs.existsSync(dbPath)).toBe(false);
	});

	test('getOrCreateProfile seeds defaults', () => {
		const p = getOrCreateProfile(tempDir, 'plan-1', 'ts');
		expect(p.plan_id).toBe('plan-1');
		expect(p.project_type).toBe('ts');
		expect(p.gates).toEqual(DEFAULT_QA_GATES);
		expect(p.locked_at).toBeNull();
	});

	test('getOrCreateProfile is idempotent', () => {
		const a = getOrCreateProfile(tempDir, 'plan-1');
		const b = getOrCreateProfile(tempDir, 'plan-1');
		expect(a.id).toBe(b.id);
	});

	test('setGates accepts setting an already-enabled gate without error (idempotent)', () => {
		getOrCreateProfile(tempDir, 'plan-1');
		const updated = setGates(tempDir, 'plan-1', { council_mode: true });
		expect(updated.gates.council_mode).toBe(true);
		// council_mode is already true by default; this is a no-op, not a ratchet.
		// The false→true ratchet path is covered by the explicit-false test below.
		expect(updated.gates.reviewer).toBe(true);
	});

	test('setGates rejects attempts to disable an enabled gate', () => {
		getOrCreateProfile(tempDir, 'plan-1');
		expect(() => setGates(tempDir, 'plan-1', { reviewer: false })).toThrow(
			/ratchet/i,
		);
	});

	test('setGates rejects attempts to disable council_mode when it defaults to true (ratchet behavior)', () => {
		getOrCreateProfile(tempDir, 'plan-1');
		// council_mode now defaults to true; passing false should be rejected with ratchet error.
		expect(() => setGates(tempDir, 'plan-1', { council_mode: false })).toThrow(
			/ratchet/i,
		);
	});

	test('setGates ratchets a gate from false to true when explicitly set', () => {
		// Directly insert a profile with one gate set to false so we can exercise
		// the false→true ratchet code path (all production defaults are now true).
		const db = getProjectDb(tempDir);
		db.run(
			'INSERT INTO qa_gate_profile (plan_id, gates) VALUES (?, ?)',
			['plan-ratchet', JSON.stringify({ ...DEFAULT_QA_GATES, hallucination_guard: false })],
		);
		const updated = setGates(tempDir, 'plan-ratchet', { hallucination_guard: true });
		expect(updated.gates.hallucination_guard).toBe(true);
		// Other gates must remain unchanged
		expect(updated.gates.reviewer).toBe(true);
	});

	test('setGates throws on missing profile', () => {
		expect(() => setGates(tempDir, 'nope', { reviewer: true })).toThrow(
			/No QA gate profile/,
		);
	});

	test('lockProfile sets locked_at and snapshot seq', () => {
		getOrCreateProfile(tempDir, 'plan-1');
		const locked = lockProfile(tempDir, 'plan-1', 7);
		expect(locked.locked_at).not.toBeNull();
		expect(locked.locked_by_snapshot_seq).toBe(7);
	});

	test('lockProfile is idempotent (second call returns locked row unchanged)', () => {
		getOrCreateProfile(tempDir, 'plan-1');
		const first = lockProfile(tempDir, 'plan-1', 7);
		const second = lockProfile(tempDir, 'plan-1', 99);
		expect(second.locked_at).toBe(first.locked_at);
		expect(second.locked_by_snapshot_seq).toBe(7);
	});

	test('setGates throws once profile is locked', () => {
		getOrCreateProfile(tempDir, 'plan-1');
		lockProfile(tempDir, 'plan-1', 1);
		expect(() => setGates(tempDir, 'plan-1', { council_mode: true })).toThrow(
			/locked/i,
		);
	});

	test('underlying trigger also rejects raw UPDATE after lock', () => {
		getOrCreateProfile(tempDir, 'plan-1');
		lockProfile(tempDir, 'plan-1', 1);
		const db = getProjectDb(tempDir);
		expect(() => {
			db.run(
				"UPDATE qa_gate_profile SET gates = '{}' WHERE plan_id = 'plan-1'",
			);
		}).toThrow(/locked/i);
	});

	test('computeProfileHash is stable and sensitive to gate changes', () => {
		const p1 = getOrCreateProfile(tempDir, 'plan-1');
		const h1 = computeProfileHash(p1);
		expect(h1).toMatch(/^[0-9a-f]{64}$/);

		// Create a synthetic profile with one gate toggled to ensure hash differs
		const p2 = {
			...p1,
			gates: {
				...p1.gates,
				council_mode: !p1.gates.council_mode, // Flip the council_mode value
			},
		};
		const h2 = computeProfileHash(p2);
		expect(h2).not.toBe(h1);
	});

	test('getEffectiveGates ignores session override when gate already enabled (idempotent)', () => {
		const p = getOrCreateProfile(tempDir, 'plan-1');
		const eff = getEffectiveGates(p, { council_mode: true });
		expect(eff.council_mode).toBe(true);
		expect(eff.reviewer).toBe(true);
	});

	test('getEffectiveGates ignores false overrides (cannot disable)', () => {
		const p = getOrCreateProfile(tempDir, 'plan-1');
		const eff = getEffectiveGates(p, { reviewer: false });
		expect(eff.reviewer).toBe(true);
	});
});
