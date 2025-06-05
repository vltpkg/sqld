#!/bin/bash

# Exit on any error
set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# For independent packages, we need to go up to the parent's parent to find .bin
BIN_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)/.bin"

# Create .bin directory if it doesn't exist
mkdir -p "$BIN_DIR"

# Find the sqld binary in the current package directory
PACKAGE_DIR="$SCRIPT_DIR"
BINARY_SRC="$PACKAGE_DIR/sqld"
BINARY_DEST="$BIN_DIR/sqld"

# Check if the source binary exists
if [ ! -f "$BINARY_SRC" ]; then
    echo "⚠️  Warning: sqld binary not found at $BINARY_SRC"
    exit 0
fi

# Copy the binary
cp "$BINARY_SRC" "$BINARY_DEST"

# Make it executable
chmod +x "$BINARY_DEST"

# Get package name for logging (if package.json exists)
if [ -f "$PACKAGE_DIR/package.json" ]; then
    PACKAGE_NAME=$(grep -o '"name"[[:space:]]*:[[:space:]]*"[^"]*"' "$PACKAGE_DIR/package.json" | cut -d'"' -f4)
    echo "✅ sqld binary installed from $PACKAGE_NAME"
else
    echo "✅ sqld binary installed"
fi 