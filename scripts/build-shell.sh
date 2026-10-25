#!/bin/sh
# Rebuild the provider and embedded Python Source before synchronizing iOS.
set -eu
GRAMLOT_APP_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
GRAMLOT_CORE_ROOT=$(cat "$GRAMLOT_APP_ROOT/.local/core-path")
cd "$GRAMLOT_APP_ROOT"
npm run device:build
PYTHONPATH="$GRAMLOT_CORE_ROOT/src" "$GRAMLOT_CORE_ROOT/.venv/bin/python" scripts/build-shell.py
