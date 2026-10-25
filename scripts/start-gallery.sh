#!/bin/sh
# Extend the existing local Kajenn environment, preserving its Caddy CA/volumes.
set -eu
GRAMLOT_CAPACITOR_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
export GRAMLOT_CAPACITOR_DIR
KAJENN_HTTPS_DIR=${KAJENN_HTTPS_DIR:-"$GRAMLOT_CAPACITOR_DIR/../../kajenn/kajenn/deploy/local-https"}
KAJENN_HTTPS_DIR=$(CDPATH= cd -- "$KAJENN_HTTPS_DIR" && pwd)
cd "$KAJENN_HTTPS_DIR"
docker compose build --pull --no-cache kajenn
docker compose -f compose.yaml -f "$GRAMLOT_CAPACITOR_DIR/deploy/local-https/compose.gallery.yaml" build --no-cache kajenn
docker compose -f compose.yaml -f "$GRAMLOT_CAPACITOR_DIR/deploy/local-https/compose.gallery.yaml" up -d --wait --wait-timeout 90
sh verify.sh
