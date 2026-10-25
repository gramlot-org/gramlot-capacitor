#!/bin/sh
set -eu
node -e 'if (Number(process.versions.node.split(".")[0]) !== 24) { console.error("This PoC uses Node 24 LTS."); process.exit(1); }'
version=$(xcodebuild -version | head -n 1)
if [ "$version" != "Xcode 27.1" ]; then
    echo "Selected toolchain: Xcode 27.1. Found: $version" >&2
    exit 1
fi
# These checks do not accept a license or install system components.
xcrun --find devicectl >/dev/null
xcodebuild -checkFirstLaunchStatus
printf '%s\n' "Node 24 and Xcode 27.1 selected; Xcode first-launch checks passed. Signing/device qualification is separate."
