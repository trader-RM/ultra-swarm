import { describe, expect, it } from 'bun:test';
import { createTestEngineerAgent } from './test-engineer';

const APPROVED_ECC_AGENTS = ['e2e-runner', 'tdd-guide', 'pr-test-analyzer'];

describe('test-engineer ECC Delegation Exposure', () => {
    it('lists only approved ECC agents in the ECC DELEGATION AND OVERSIGHT section', () => {
        const agent = createTestEngineerAgent('gpt-4');
        const prompt = agent.config.prompt!;
        
        // Extract the ECC section from the prompt
        const eccSection = prompt.substring(prompt.indexOf('## ECC DELEGATION AND OVERSIGHT'));
        
        // Verify each approved agent appears
        for (const agent of APPROVED_ECC_AGENTS) {
            expect(eccSection).toContain(agent);
        }
        
        // Verify the count matches
        const countMatch = eccSection.match(/APPROVED AGENTS \(delegation allowed\):\s*\n\n([\s\S]*?)(?=\n\nDELEGATION RULES)/);
        expect(countMatch).not.toBeNull();
        const agents = countMatch![1].split('\n').filter(line => line.trim().startsWith('- '));
        expect(agents.length).toBe(3); // count
    });

    it('contains explicit delegation restriction text', () => {
        const agent = createTestEngineerAgent('gpt-4');
        const prompt = agent.config.prompt!;
        const eccSection = prompt.substring(prompt.indexOf('## ECC DELEGATION AND OVERSIGHT'));
        expect(eccSection).toContain('You may ONLY delegate to the');
        expect(eccSection).toContain('agents listed above');
    });
    
    // Add identity test since the prompt was changed from "DO NOT delegate" to "CAN delegate"
    it('no longer says DO NOT use the Task tool to delegate', () => {
        const agent = createTestEngineerAgent('gpt-4');
        const prompt = agent.config.prompt!;
        // Make sure the old anti-delegation line was removed
        expect(prompt).not.toContain('DO NOT use the Task tool to delegate to other agents');
    });
    
    it('explicitly states CAN delegate to approved ECC specialist test agents', () => {
        const agent = createTestEngineerAgent('gpt-4');
        const prompt = agent.config.prompt!;
        expect(prompt).toContain('CAN delegate to approved ECC specialist test agents');
    });
});