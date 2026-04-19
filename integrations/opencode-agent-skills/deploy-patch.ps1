# Deploy Phase 12 patch to opencode-agent-skills
# Copies the patched plugin.ts from staging to the live node_modules location
$source = Join-Path $PSScriptRoot "plugin.patch.ts"
$target = "C:\Users\Ryan McNish\.config\opencode\node_modules\opencode-agent-skills\src\plugin.ts"

if (-not (Test-Path $source)) {
    Write-Error "Staging file not found: $source"
    exit 1
}

if (-not (Test-Path (Split-Path $target -Parent))) {
    Write-Error "Target directory not found: $(Split-Path $target -Parent)"
    exit 1
}

# Backup original
$backup = Join-Path $PSScriptRoot "plugin.original.ts.bak"
if (-not (Test-Path $backup)) {
    Copy-Item $target $backup -Force
    Write-Host "Backed up original to: $backup"
}

# Version guard: abort if the live plugin.ts has changed since the backup was taken.
# If the upstream opencode-agent-skills package was updated, the patch needs to be
# reviewed and rebased before deploying.
if (Test-Path $backup) {
    $backupHash = (Get-FileHash $backup -Algorithm SHA256).Hash
    $targetHash = (Get-FileHash $target -Algorithm SHA256).Hash
    if ($backupHash -ne $targetHash) {
        Write-Error "ERROR: Live plugin.ts has changed since the backup was taken."
        Write-Error "opencode-agent-skills may have been updated via npm."
        Write-Error "Review the diff: '$backup' vs '$target'"
        Write-Error "Update plugin.patch.ts against the new source, delete the .bak, then re-run."
        exit 1
    }
}

# Deploy patched version
Copy-Item $source $target -Force
Write-Host "Deployed patched plugin.ts to: $target"
Write-Host "Restart OpenCode for changes to take effect."