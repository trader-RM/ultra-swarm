#!/usr/bin/env bash
# Informational only — this script does NOT start a watchdog process.
# Ultra Swarm Watchdog — Ralphy-based loop
# Uses Ralphy's PRD mode to drive tasks, but with STRICT read-only boundaries.
# For Windows, use watchdog-watch.ps1 instead.

set -euo pipefail

echo "[WATCHDOG] Ultra Swarm Watchdog"
echo "[WATCHDOG] Project root: $(pwd)"
echo ""
echo "This watchdog runs Ralphy in single-task mode with read-only constraints."
echo "It reads .swarm/plan.md for incomplete tasks and reports progress."
echo ""
echo "NOTE: On Windows, use PowerShell watchdog instead:"
echo "  powershell -File integrations/ralphy/scripts/watchdog-watch.ps1"
echo ""
echo "For direct Ralphy execution (PRD-driven coding loop):"
echo "  cd $(pwd)"
echo "  ./integrations/ralphy/repo/ralphy.sh --opencode --prd .swarm/plan.md"
echo ""
echo "⚠  WARNING: Direct Ralphy execution will modify files."
echo "   The watchdog (watchdog-watch.ps1) is the SAFE observational mode."
echo "   Ralphy execution mode is NOT read-only and should only be used"
echo "   when you intentionally want an outer coding loop."
