# Coder ECC Agent Exposure
Swarm: default
Phase: 4 [PENDING] | Updated: 2026-04-14T17:31:57.014Z

---
## Phase 4: Expose Coder to ECC Build Resolvers and GAN Generator [PENDING]
- [ ] 4.1: Modify coder.ts to add ECC delegation-and-oversight section to CODER_PROMPT. Remove the blanket Task tool prohibition. Add section listing the 9 approved ECC agents (build_error_resolver, cpp_build_resolver, dart_build_resolver, go_build_resolver, java_build_resolver, kotlin_build_resolver, pytorch_build_resolver, rust_build_resolver, gan_generator) with descriptions and delegation rules. Coder defaults to delegation when task matches specialist domain, supervises the result, and remains implementation lane owner. FR-003, FR-004, FR-005. [MEDIUM]
- [ ] 4.2: Modify index.ts getAgentConfigs function to add task: 'allow' permission for coder agents (alongside architect agents). Coder remains in subagent mode — only the permission changes, not the mode. FR-001, FR-002. [SMALL]
- [ ] 4.3: Add smoke test at base/opencode-swarm/tests/unit/agents/coder-ecc-exposure.test.ts using bun:test framework. Test imports CODER_PROMPT from coder.ts and verifies: (1) all 9 approved ECC agents are named in the prompt, (2) no excluded ECC agents are named, (3) existing non-ECC Coder guidance preserved (ANTI-HALLUCINATION, DEFENSIVE CODING, CROSS-PLATFORM, TEST FRAMEWORK, ERROR HANDLING, OUTPUT FORMAT sections still present), (4) delegation-and-oversight rule is present, (5) Task tool prohibition is qualified not blanket. Also test getAgentConfigs to verify coder gets task: 'allow' and mode remains 'subagent'. FR-010. [MEDIUM]
