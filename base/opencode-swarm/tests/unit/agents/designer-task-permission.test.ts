import { describe, test, expect } from 'bun:test';
import { getAgentConfigs } from '../../../src/agents/index';

describe('getAgentConfigs designer task permission', () => {
	test('should grant designer agent task:allow permission and verify critical agent modes', () => {
		// 1. Setup: getAgentConfigs with minimum config
		// We need ui_review.enabled === true for the designer agent to be created
		const config = {
			ui_review: {
				enabled: true,
			},
		};

		const configs = getAgentConfigs(config);

		// 2. Find the designer agent
		const designerAgentName = Object.keys(configs).find((name) => name.includes('designer'));
		
		if (!designerAgentName) {
			throw new Error('Designer agent not found in getAgentConfigs result');
		}

		const designerConfig = configs[designerAgentName];

		// 3. Assert designer agent has permission.task === 'allow'
		expect(designerConfig.permission).toEqual({ task: 'allow' });

		// 4. Assert designer agent has mode === 'subagent'
		expect(designerConfig.mode).toBe('subagent');

		// 5. Regression: Assert architect agent still has mode === 'primary'
		const architectAgentName = Object.keys(configs).find((name) => name.includes('architect'));
		if (!architectAgentName) {
			throw new Error('Architect agent not found in getAgentConfigs result');
		}
		expect(configs[architectAgentName].mode).toBe('primary');

		// 6. Regression: Assert coder agent still has task: 'allow'
		const coderAgentName = Object.keys(configs).find((name) => name.includes('coder'));
		if (!coderAgentName) {
			throw new Error('Coder agent not found in getAgentConfigs result');
		}
		expect(configs[coderAgentName].permission).toEqual({ task: 'allow' });
	});
});
