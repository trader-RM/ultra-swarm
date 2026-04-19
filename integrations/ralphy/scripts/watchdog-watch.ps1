# Ultra Swarm Watchdog — Staleness Monitor
# Watches .swarm/evidence/ for new files. Alerts if no activity for N minutes.
# This script does NOT modify any files — it is purely observational.

param(
    [int]$StaleMinutes = 15,
    [int]$CriticalMinutes = 30,
    [string]$SwarmDir = ".swarm"
)

$ErrorActionPreference = "Stop"
$WatchdogStart = Get-Date
$LastAlertTime = $null
$AlertIntervalMinutes = 5  # Don't re-alert more often than every 5 minutes

function Write-Status {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Level) {
        "WARN"  { "Yellow" }
        "CRIT"  { "Red" }
        default { "Cyan" }
    }
    Write-Host "[$timestamp] [$Level] $Message" -ForegroundColor $color
}

function Send-ToastAlert {
    param([string]$Title, [string]$Message)
    try {
        # Windows balloon tip notification (WinForms NotifyIcon)
        # This is the most reliable cross-Windows notification without extra dependencies
        [System.Reflection.Assembly]::LoadWithPartialName("System.Windows.Forms") | Out-Null
        $balloon = New-Object System.Windows.Forms.NotifyIcon
        $balloon.Icon = [System.Drawing.SystemIcons]::Warning
        $balloon.BalloonTipTitle = $Title
        $balloon.BalloonTipText = $Message
        $balloon.BalloonTipIcon = [System.Windows.Forms.ToolTipIcon]::Warning
        $balloon.Visible = $True
        $balloon.ShowBalloonTip(10000)
        Start-Sleep -Seconds 2
        $balloon.Visible = $False
        $balloon.Dispose()
    }
    catch {
        # Fallback: console-only notification
        Write-Host "  (notification unavailable - check console)" -ForegroundColor DarkGray
    }
}

function Get-NewestEvidenceFile {
    $evidenceDir = Join-Path $SwarmDir "evidence"
    if (-not (Test-Path $evidenceDir)) {
        return $null
    }
    $newest = Get-ChildItem $evidenceDir -Recurse -File | 
        Sort-Object LastWriteTime -Descending | 
        Select-Object -First 1
    return $newest
}

function Get-ContextModTime {
    $contextFile = Join-Path $SwarmDir "context.md"
    if (-not (Test-Path $contextFile)) {
        return $null
    }
    return (Get-Item $contextFile).LastWriteTime
}

Write-Status "Ultra Swarm Watchdog started"
Write-Status "Monitoring: $SwarmDir/evidence/"
Write-Status "Stale threshold: $StaleMinutes min, Critical: $CriticalMinutes min"
Write-Status "Press Ctrl+C to stop"
Write-Host ""

while ($true) {
    $now = Get-Date
    $newestFile = Get-NewestEvidenceFile
    $contextTime = Get-ContextModTime

    # Calculate staleness from evidence files only
    # context.md updates independently (plan writes) and shouldn't trigger false alerts
    $evidenceAgeMinutes = if ($newestFile) {
        [math]::Floor(($now - $newestFile.LastWriteTime).TotalMinutes)
    } else {
        999  # No evidence files = very stale
    }

    # Track context age separately for info display only (not used in alerting)
    $contextAgeMinutes = if ($contextTime) {
        [math]::Floor(($now - $contextTime).TotalMinutes)
    } else {
        0
    }

    $maxAge = $evidenceAgeMinutes  # Alert based on evidence only
    $running = [math]::Floor(($now - $WatchdogStart).TotalMinutes)

    # Status line
    $evidenceInfo = if ($newestFile) { "$($newestFile.Name) ($evidenceAgeMinutes min ago)" } else { "none" }
    $contextInfo = if ($contextTime) { "$contextAgeMinutes min ago" } else { "missing" }

    Write-Status "Running: ${running}m | Evidence: $evidenceInfo | Context: $contextInfo"

    # Alert logic
    $shouldAlert = $LastAlertTime -eq $null -or (($now - $LastAlertTime).TotalMinutes -ge $AlertIntervalMinutes)

    if ($maxAge -ge $CriticalMinutes -and $shouldAlert) {
        Write-Status "CRITICAL: No progress for $maxAge minutes! Session may be stuck." "CRIT"
        Send-ToastAlert "Ultra Swarm CRITICAL" "No progress for $maxAge minutes. Session may be stuck."
        $LastAlertTime = $now
    }
    elseif ($maxAge -ge $StaleMinutes -and $shouldAlert) {
        Write-Status "WARNING: No progress for $maxAge minutes. Session may be stalling." "WARN"
        Send-ToastAlert "Ultra Swarm Warning" "No progress for $maxAge minutes."
        $LastAlertTime = $now
    }

    Start-Sleep -Seconds 60
}
