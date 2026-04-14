const fs = require('fs');
const path = require('path');

const filePath = path.join('D:', 'Repos', 'Ultra Swarm', 'base', 'opencode-swarm', 'src', 'agents', 'architect.ts');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

const line51 = lines[50]; // 0-indexed
const agentMatches = line51.match(/\{\{AGENT_PREFIX\}\}(\w+)/g);
if (agentMatches) {
  console.log('Total agents in roster:', agentMatches.length);
  const names = agentMatches.map(m => m.replace('{{AGENT_PREFIX}}', ''));
  
  // Check for Swarm-native 9
  const swarmNative = ['explorer', 'sme', 'coder', 'reviewer', 'test_engineer', 'critic', 'critic_sounding_board', 'docs', 'designer'];
  const swarmFound = swarmNative.filter(n => names.includes(n));
  console.log('Swarm-native agents found:', swarmFound.length, '/9');
  
  // Check for ECC categories
  const reviewQA = ['code_reviewer', 'security_reviewer', 'cpp_reviewer', 'go_reviewer', 'kotlin_reviewer', 'java_reviewer', 'rust_reviewer', 'python_reviewer', 'typescript_reviewer', 'csharp_reviewer', 'flutter_reviewer', 'database_reviewer', 'healthcare_reviewer', 'gan_evaluator', 'opensource_sanitizer'];
  const build = ['build_error_resolver', 'cpp_build_resolver', 'go_build_resolver', 'kotlin_build_resolver', 'java_build_resolver', 'rust_build_resolver', 'pytorch_build_resolver', 'dart_build_resolver'];
  const pipeline = ['tdd_guide', 'e2e_runner', 'refactor_cleaner', 'performance_optimizer', 'gan_generator', 'opensource_forker', 'opensource_packager'];
  const support = ['planner', 'doc_updater', 'docs_lookup', 'harness_optimizer', 'loop_operator', 'chief_of_staff', 'gan_planner'];
  
  const reviewFound = reviewQA.filter(n => names.includes(n));
  const buildFound = build.filter(n => names.includes(n));
  const pipelineFound = pipeline.filter(n => names.includes(n));
  const supportFound = support.filter(n => names.includes(n));
  
  console.log('ECC REVIEW/QA agents found:', reviewFound.length, '/15');
  console.log('ECC BUILD agents found:', buildFound.length, '/8');
  console.log('ECC PIPELINE agents found:', pipelineFound.length, '/7');
  console.log('ECC SUPPORT agents found:', supportFound.length, '/7');
  console.log('Total ECC found:', reviewFound.length + buildFound.length + pipelineFound.length + supportFound.length, '/37');
  console.log('Grand total:', names.length, 'agents (expected 46)');
  
  // Check for exclusions (should NOT be present)
  const excluded = ['architect', 'build'];
  const excludedFound = names.filter(n => excluded.includes(n));
  console.log('Excluded agents found (should be 0):', excludedFound);
  
  // Check for duplicates
  const dupes = names.filter((n, i) => names.indexOf(n) !== i);
  console.log('Duplicate agents:', dupes.length > 0 ? dupes : 'None');
} else {
  console.log('ERROR: No agents found in line 51');
}