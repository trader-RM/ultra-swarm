import { describe, expect, it } from 'bun:test';
import {
	ALL_SUBAGENT_NAMES,
	AGENT_TOOL_MAP,
	DEFAULT_MODELS,
} from '../../../src/config/constants';
import { AGENT_CATEGORY } from '../../../src/config/agent-categories';
import { stripKnownSwarmPrefix } from '../../../src/config/schema';

// Swarm agents (14 total)
const SWARM_AGENTS = [
	'architect',
	'explorer',
	'coder',
	'test_engineer',
	'sme',
	'reviewer',
	'critic',
	'critic_sounding_board',
	'critic_drift_verifier',
	'critic_oversight',
	'curator_init',
	'curator_phase',
	'docs',
	'designer',
] as const;

describe('Swarm Agent Registration', () => {
	describe('ALL_SUBAGENT_NAMES contains all 14 Swarm agents', () => {
		it('all Swarm agents are registered in ALL_SUBAGENT_NAMES', () => {
			for (const name of SWARM_AGENTS) {
				if (name !== 'architect') { // architect is not in ALL_SUBAGENT_NAMES
					expect(ALL_SUBAGENT_NAMES).toContain(name);
				}
			}
		});

		it('total Swarm agent count in ALL_SUBAGENT_NAMES is 13 (plus architect separately)', () => {
			// ALL_SUBAGENT_NAMES should contain 13 agents (excluding architect which is separate)
			expect(ALL_SUBAGENT_NAMES.length).toBe(13);
		});
	});

	describe('AGENT_TOOL_MAP has entries for all Swarm agents', () => {
		it('all Swarm agents have tool assignments', () => {
			for (const name of SWARM_AGENTS) {
				if (name !== 'architect') { // architect has special handling
					expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP]).toBeDefined();
					expect(AGENT_TOOL_MAP[name as keyof typeof AGENT_TOOL_MAP].length).toBeGreaterThan(0);
				}
			}
		});
	});

	describe('AGENT_CATEGORY has entries for all Swarm agents', () => {
		it('Swarm agents are in correct categories', () => {
			// Check specific agents are in correct categories
			expect(AGENT_CATEGORY['explorer']).toBe('pipeline');
			expect(AGENT_CATEGORY['coder']).toBe('pipeline');
			expect(AGENT_CATEGORY['test_engineer']).toBe('pipeline');
			expect(AGENT_CATEGORY['reviewer']).toBe('qa');
			expect(AGENT_CATEGORY['critic']).toBe('qa');
			expect(AGENT_CATEGORY['critic_sounding_board']).toBe('qa');
			expect(AGENT_CATEGORY['critic_drift_verifier']).toBe('qa');
			expect(AGENT_CATEGORY['critic_oversight']).toBe('qa');
			expect(AGENT_CATEGORY['sme']).toBe('support');
			expect(AGENT_CATEGORY['docs']).toBe('support');
			expect(AGENT_CATEGORY['designer']).toBe('support');
			expect(AGENT_CATEGORY['curator_init']).toBe('support');
			expect(AGENT_CATEGORY['curator_phase']).toBe('support');
		});
	});

	describe('DEFAULT_MODELS has entries for all Swarm agents', () => {
		it('all Swarm agents have default model assignments', () => {
			for (const name of SWARM_AGENTS) {
				if (name !== 'architect') { // architect has special handling
					expect(DEFAULT_MODELS[name]).toBeDefined();
					expect(typeof DEFAULT_MODELS[name]).toBe('string');
					expect(DEFAULT_MODELS[name].length).toBeGreaterThan(0);
				}
			}
		});
	});

	describe('stripKnownSwarmPrefix resolves Swarm names', () => {
		it('strips "local_" prefix from reviewer', () => {
			expect(stripKnownSwarmPrefix('local_reviewer')).toBe('reviewer');
		});

		it('strips "local_" prefix from critic_sounding_board', () => {
			expect(stripKnownSwarmPrefix('local_critic_sounding_board')).toBe('critic_sounding_board');
		});

		it('strips "default_" prefix from architect', () => {
			expect(stripKnownSwarmPrefix('default_architect')).toBe('architect');
		});

		it('strips "cloud_" prefix from coder', () => {
			expect(stripKnownSwarmPrefix('cloud_coder')).toBe('coder');
		});

		it('returns bare name unchanged', () => {
			expect(stripKnownSwarmPrefix('explorer')).toBe('explorer');
		});

		it('handles all Swarm agent names with prefixes', () => {
			const testPrefixes = ['local', 'cloud', 'default', 'paid'];
			for (const name of SWARM_AGENTS) {
				for (const prefix of testPrefixes) {
					const prefixed = `${prefix}_${name}`;
					expect(stripKnownSwarmPrefix(prefixed)).toBe(name);
				}
			}
		});
	});
});