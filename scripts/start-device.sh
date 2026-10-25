#!/bin/sh
# Run from the isolated Node 24 environment used by this PoC.
set -eu
GRAMLOT_CAPACITOR_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
GRAMLOT_CORE_DIR=$(cat "$GRAMLOT_CAPACITOR_DIR/.local/core-path")
KAJENN_HTTPS_DIR=$(CDPATH= cd -- "$GRAMLOT_CAPACITOR_DIR/../../kajenn/kajenn/deploy/local-https" && pwd)
export GRAMLOT_CAPACITOR_DIR
npm --prefix "$GRAMLOT_CORE_DIR/js" run build
mkdir -p "$GRAMLOT_CAPACITOR_DIR/.local/runtime"
cp "$GRAMLOT_CORE_DIR/js/dist/gramlot.min.js" "$GRAMLOT_CAPACITOR_DIR/.local/runtime/gramlot.min.js"
cp -R "$GRAMLOT_CORE_DIR/themes/." "$GRAMLOT_CAPACITOR_DIR/.local/themes/"
# Serve the approved local layout component collection with its matching metadata.
mkdir -p "$GRAMLOT_CAPACITOR_DIR/.local/collections"
rm -rf "$GRAMLOT_CAPACITOR_DIR/.local/collections/layout"
cp -R "$GRAMLOT_CORE_DIR/src/gramlot/collections/layout" "$GRAMLOT_CAPACITOR_DIR/.local/collections/layout"
cp "$GRAMLOT_CORE_DIR/src/gramlot/collections/layout.json" "$GRAMLOT_CAPACITOR_DIR/.local/collections/layout.json"
(cd "$GRAMLOT_CAPACITOR_DIR" && npm run device:build)
cd "$KAJENN_HTTPS_DIR"
docker compose -f compose.yaml \
    -f "$GRAMLOT_CAPACITOR_DIR/deploy/local-https/compose.gallery.yaml" \
    -f "$GRAMLOT_CAPACITOR_DIR/deploy/local-https/compose.device.yaml" \
    up -d --wait --wait-timeout 60
