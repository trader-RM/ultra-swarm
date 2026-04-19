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