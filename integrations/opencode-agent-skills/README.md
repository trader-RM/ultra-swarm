# opencode-agent-skills Patch Staging

This directory contains patched versions of files from the opencode-agent-skills plugin, staged for deployment to the live node_modules location.

## Why Patch?

The opencode-agent-skills plugin lives in `node_modules` which:
1. Cannot be written by the edit/write tools (cross-drive scope restriction)
2. Gets overwritten on `npm install`

We stage patches here and deploy via PowerShell.

## Current Patches

### Phase 12: Internal Instruction Capture (`plugin.patch.ts`)

**Problem**: The skill matcher in `plugin.ts` filters out all synthetic content (`!part.synthetic`), making internal agent-to-agent delegation instructions invisible to skill matching. When the architect sends a task to `coder` via synthetic injection, the skill matcher never sees keywords like "security", "typescript", "testing" embedded in the delegation envelope.

**Changes**:
1. Added `isAgentInstruction()` helper — identifies synthetic parts with delegation signals while excluding `<skill-evaluation-required>` blocks (preventing feedback loops)
2. Extract `instructionText` from synthetic parts via `isAgentInstruction`
3. Combine `userText + instructionText` into `matchText`
4. Use `matchText` for both early-return check and `matchSkills()` call

**Deploy**: Run `powershell -ExecutionPolicy Bypass -File deploy-patch.ps1` from this directory.

**Rollback**: A backup of the original `plugin.ts` is saved as `plugin.original.ts.bak` on first deploy. To restore, copy the backup back to the target location.

### Phase 5: Plugin Utils Extraction & Behavioral Tests (`plugin.patch.utils.ts`)

**Problem**: Utility functions and constants were inlined in `plugin.patch.ts`, making them untestable in isolation and mixing concerns. Tests relied on fragile source-text inspection instead of verifying observable behavior.

**Changes**:
1. **Extracted `plugin.patch.utils.ts`** — new module with three exported members:
   - `SKILL_MATCH_THRESHOLD` (constant, value `0.70`) — similarity threshold for `matchSkills()`
   - `isAgentInstruction(text: string): boolean` — identifies synthetic parts with delegation signals; excludes `<skill-evaluation-required>` and `<available-skills>` blocks to prevent feedback loops; requires markers at column 0 (no leading whitespace) to avoid false positives on prose or code blocks
   - `appendSkillSuggestion(baseDir, entry): void` — appends a JSONL suggestion entry to `.swarm/skill-suggestions.jsonl`; creates `.swarm/` directory if absent; catches and logs write errors without throwing
2. **Added `mandatorySkillInjection` export** — boolean constant (defaults to `true`); set to `false` when `SKILLS_MANDATORY_INJECTION` env var is `"false"` or `"0"`; when `false`, matched skills are tracked but not injected into the conversation
3. **Updated `plugin.patch.ts`** — imports `appendSkillSuggestion`, `SKILL_MATCH_THRESHOLD`, `isAgentInstruction`, and `mandatorySkillInjection` from `./plugin.patch.utils`; uses extensionless import aligned with deployment convention; `matchSkills()` call preserves 3-arg signature with explicit threshold
4. **Replaced tests with behavioral coverage** (`plugin.patch.test.ts`):
   - **18 `isAgentInstruction` tests** — covering empty input, whitespace, exclusion tags, each delegation signal (`[agent]`, `TASK:`, `CONSTRAINT:`, `ACCEPTANCE:`, `FILE:`, `INPUT:`, `OUTPUT:`, `DESCRIPTION:`), prose with agent names, long text, null bytes, case sensitivity, column-0 enforcement, and adversarial mixed-signal inputs
   - **3 `appendSkillSuggestion` tests** — callable type check, JSONL file creation with field validation, and graceful error handling on invalid paths
   - **1 `SKILL_MATCH_THRESHOLD` test** — verifies exported value is `0.70`
   - **2 `mandatorySkillInjection` tests** — verifies boolean type and default value

**API Reference — `plugin.patch.utils.ts` exports**:

| Export | Type | Description |
|--------|------|-------------|
| `SKILL_MATCH_THRESHOLD` | `number` (0.70) | Minimum cosine-similarity score for skill matching |
| `isAgentInstruction(text)` | `(text: string) => boolean` | Returns `true` if text contains a delegation signal at column 0; excludes plugin injection tags |
| `appendSkillSuggestion(baseDir, entry)` | `(baseDir: string, entry: object) => void` | Appends a skill-suggestion JSONL record; never throws |
| `mandatorySkillInjection` | `boolean` (default `true`) | When `false`, skill matches are tracked but not injected; controlled by `SKILLS_MANDATORY_INJECTION` env var |

**Test approach**: All tests verify observable behavior (return values, file artifacts) rather than source-text patterns. Adversarial cases cover feedback-loop prevention, false-positive rejection, and edge-case inputs with null bytes or mixed signals.
