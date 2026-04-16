import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Read the source file directly since prompts are not individually exported
const EXPLORER_SOURCE = readFileSync(
	resolve(import.meta.dir, './explorer.ts'),
	'utf-8',
);

// Extract a prompt block from the source by name
function extractPromptBlock(source: string, promptName: string): string {
	const regex = new RegExp(
		`export\\s+const\\s+${promptName}\\s*=\\s*\x60([\\s\\S]*?)\x60`,
		'm',
	);
	const match = source.match(regex);
	return match ? match[1] : '';
}

const CURATOR_INIT_PROMPT = extractPromptBlock(
	EXPLORER_SOURCE,
	'CURATOR_INIT_PROMPT',
);
const CURATOR_PHASE_PROMPT = extractPromptBlock(
	EXPLORER_SOURCE,
	'CURATOR_PHASE_PROMPT',
);

const APPROVED_ECC_AGENTS = ['conversation_analyzer'];

describe('curator ECC Delegation Exposure', () => {
    it('lists only approved ECC agents in the ECC DELEGATION AND OVERSIGHT section for CURATOR_INIT', () => {
        // Extract the ECC section from the prompt
        const eccSection = CURATOR_INIT_PROMPT.substring(CURATOR_INIT_PROMPT.indexOf('## ECC DELEGATION AND OVERSIGHT'));
        
        // Verify each approved agent appears
        for (const agent of APPROVED_ECC_AGENTS) {
            expect(eccSection).toContain(agent);
        }
        
        // Verify the count matches
        const countMatch = eccSection.match(/APPROVED ECC AGENTS \(delegation allowed\):\s*\n\n([\s\S]*?)(?=\n\nDELEGATION RULES)/);
        expect(countMatch).not.toBeNull();
        const agents = countMatch![1].split('\n').filter(line => line.trim().startsWith('- '));
        expect(agents.length).toBe(1); // count
    });

	it('contains explicit delegation restriction text for CURATOR_INIT', () => {
		const eccSection = CURATOR_INIT_PROMPT.substring(CURATOR_INIT_PROMPT.indexOf('## ECC DELEGATION AND OVERSIGHT'));
		expect(eccSection).toContain('You may ONLY delegate to the');
		expect(eccSection).toContain('agent listed above');
	});
    
    it('lists only approved ECC agents in the ECC DELEGATION AND OVERSIGHT section for CURATOR_PHASE', () => {
        // Extract the ECC section from the prompt
        const eccSection = CURATOR_PHASE_PROMPT.substring(CURATOR_PHASE_PROMPT.indexOf('## ECC DELEGATION AND OVERSIGHT'));
        
        // Verify each approved agent appears
        for (const agent of APPROVED_ECC_AGENTS) {
            expect(eccSection).toContain(agent);
        }
        
        // Verify the count matches
        const countMatch = eccSection.match(/APPROVED ECC AGENTS \(delegation allowed\):\s*\n\n([\s\S]*?)(?=\n\nDELEGATION RULES)/);
        expect(countMatch).not.toBeNull();
        const agents = countMatch![1].split('\n').filter(line => line.trim().startsWith('- '));
        expect(agents.length).toBe(1); // count
    });

	it('contains explicit delegation restriction text for CURATOR_PHASE', () => {
		const eccSection = CURATOR_PHASE_PROMPT.substring(CURATOR_PHASE_PROMPT.indexOf('## ECC DELEGATION AND OVERSIGHT'));
		expect(eccSection).toContain('You may ONLY delegate to the');
		expect(eccSection).toContain('agent listed above');
	});
    
    // Add identity test since the prompt was changed from "DO NOT delegate" to "CAN delegate"
    it('no longer says DO NOT use the Task tool to delegate for CURATOR_INIT', () => {
        // Make sure the old anti-delegation line was removed
        expect(CURATOR_INIT_PROMPT).not.toContain('DO NOT use the Task tool to delegate to other agents');
    });
    
    it('no longer says DO NOT use the Task tool to delegate for CURATOR_PHASE', () => {
        // Make sure the old anti-delegation line was removed
        expect(CURATOR_PHASE_PROMPT).not.toContain('DO NOT use the Task tool to delegate to other agents');
    });
    
    it('explicitly states CAN delegate to approved ECC specialist agents for CURATOR_INIT', () => {
        expect(CURATOR_INIT_PROMPT).toContain('you CAN delegate to approved ECC specialist agents');
    });
    
    it('explicitly states CAN delegate to approved ECC specialist agents for CURATOR_PHASE', () => {
        expect(CURATOR_PHASE_PROMPT).toContain('you CAN delegate to approved ECC specialist agents');
    });
});