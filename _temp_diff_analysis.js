// v6.68.0 vs v6.67.1 COMPARISON ANALYSIS

// KEY DIFFERENCES FOUND in constants.ts:
const diff_6_68_vs_6_67 = {
  // 1. QA_AGENTS changed from ['reviewer', 'critic', 'critic_sounding_board'] to ['reviewer', 'critic', 'critic_oversight']
  qa_agents_6_67: ['reviewer', 'critic', 'critic_sounding_board'],
  qa_agents_6_68: ['reviewer', 'critic', 'critic_oversight'],
  
  // 2. NEW AGENT: 'critic_oversight' replaces 'critic_sounding_board' in QA_AGENTS
  //    But 'critic_sounding_board' STILL EXISTS in ALL_SUBAGENT_NAMES
  //    'critic_oversight' is a NEW agent added to both QA_AGENTS and AGENT_TOOL_MAP
  
  // 3. AGENT_TOOL_MAP differences:
  //    - 'critic_oversight' entry ADDED (6 tools: complexity_hotspots, detect_domains, imports, retrieve_summary, symbols, knowledge_recall)
  //    - 'critic' and 'critic_sounding_board' now have 'req_coverage' tool ADDED (was not in 6.67.1)
  //    - 'critic_drift_verifier' now has 'req_coverage' and 'get_approved_plan' tools ADDED
  //    - 'architect' now has 'convene_council', 'declare_council_criteria', 'get_qa_gate_profile', 'set_qa_gates' tools ADDED
  
  // 4. TOOL_DESCRIPTIONS differences:
  //    - Added descriptions for: convene_council, declare_council_criteria, get_qa_gate_profile, set_qa_gates, req_coverage
  //    - These are new tools in v6.68.0
  
  // 5. DEFAULT_MODELS differences:
  //    - Added 'critic_oversight' model entry
  //    - Changed test_engineer from one model to 'opencode/gpt-5-nano'
  
  // 6. SLOP_DETECTOR_DEFAULTS, INCREMENTAL_VERIFY_DEFAULTS, COMPACTION_DEFAULTS likely same
  // 7. TURBO_MODE_BANNER and FULL_AUTO_BANNER added (these are architect prompt additions)
};

console.log('=== v6.68.0 vs v6.67.1 KEY DIFFERENCES ===');
console.log('');
console.log('1. NEW AGENT: critic_oversight (QA agent)');
console.log('   - In QA_AGENTS array: replaces critic_sounding_board position');
console.log('   - In AGENT_TOOL_MAP: 6 tools (complexity_hotspots, detect_domains, imports, retrieve_summary, symbols, knowledge_recall)');
console.log('   - In DEFAULT_MODELS: opencode/trinity-large-preview-free');
console.log('');
console.log('2. NEW TOOLS added to existing agents:');
console.log('   - critic: +req_coverage');
console.log('   - critic_sounding_board: +req_coverage');
console.log('   - critic_drift_verifier: +req_coverage, +get_approved_plan');
console.log('   - architect: +convene_council, +declare_council_criteria, +get_qa_gate_profile, +set_qa_gates');
console.log('');
console.log('3. NEW TOOL DESCRIPTIONS:');
console.log('   - convene_council, declare_council_criteria, get_qa_gate_profile, set_qa_gates, req_coverage');
console.log('');
console.log('4. agent-categories.ts: IDENTICAL to v6.67.1');
console.log('');
console.log('=== IMPACT ON ULTRA SWARM ===');
console.log('');
console.log('OUR MODIFICATIONS (Phase 2-3):');
console.log('  constants.ts: Added 37 ECC names to ALL_SUBAGENT_NAMES, 37 entries to AGENT_TOOL_MAP');
console.log('  architect.ts: Added 37 ECC agents to roster line 51');
console.log('  agent-categories.ts: Added 37 ECC entries to AGENT_CATEGORY');
console.log('');
console.log('RISK IF WE STAY ON v6.67.1:');
console.log('  - Missing critic_oversight agent (new QA gate agent in v6.68.0)');
console.log('  - Missing 5 new tools (convene_council, declare_council_criteria, etc.)');
console.log('  - Our AGENT_TOOL_MAP is based on v6.67.1 tool names - missing new tools won\'t be assigned');
console.log('  - But: our 37 ECC agents do NOT need the new tools (council/oversight are architect-level)');
console.log('');
console.log('RISK IF WE UPGRADE TO v6.68.0:');
console.log('  - Must rebase our 37 ECC additions on top of v6.68.0\'s changes');
console.log('  - Must add critic_oversight to our ECC awareness (it\'s a Swarm-native, not ECC)');
console.log('  - Must verify our AGENT_TOOL_MAP entries are compatible with v6.68.0\'s ToolName union');
console.log('');
console.log('RECOMMENDATION: Upgrade to v6.68.0 first, then re-apply ECC modifications');
console.log('Priority: HIGH - critic_oversight is a gate agent, missing it means incomplete QA system');