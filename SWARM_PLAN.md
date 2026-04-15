# Designer ECC Agent Exposure
Swarm: default
Phase: 9 [PENDING] | Updated: 2026-04-15T15:01:20.482Z

---
## Phase 9: Register ECC agents and expose Designer to a11y_architect and seo_specialist [COMPLETE]
- [x] 9.1: Register a11y_architect and seo_specialist in ALL_SUBAGENT_NAMES in constants.ts. Add AGENT_TOOL_MAP entries and DEFAULT_MODELS entries. [MEDIUM]
- [x] 9.2: Add a11y_architect and seo_specialist to AGENT_CATEGORY and createSwarmAgents. [SMALL] (depends: 9.1)
- [x] 9.3: Modify designer.ts to add ECC DELEGATION AND OVERSIGHT section with 2 approved agents. [MEDIUM]
- [x] 9.4: Add task allow permission for designer in getAgentConfigs. [SMALL] (depends: 9.3)
- [x] 9.5: Add smoke test designer-ecc-exposure.test.ts. [MEDIUM] (depends: 9.1, 9.2, 9.3, 9.4)
