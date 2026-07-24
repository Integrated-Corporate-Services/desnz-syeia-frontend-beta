#!/bin/sh
# Generate runtime configuration from environment variables
# This script runs at container startup to inject environment-specific values
# Uses Node.js with JSON.stringify() for secure escaping (prevents script injection)

echo "=========================================="
echo "Generating runtime configuration..."
echo "=========================================="

# Use the secure Node.js script that properly escapes all values
node /app/scripts/generate-runtime-config-js.cjs

# Verify the config was created
if [ -f "/app/dist-serve/runtime-config.js" ]; then
    echo " Runtime configuration generated successfully"
    echo "Configuration preview:"
    head -n 10 /app/dist-serve/runtime-config.js
else
    echo "Failed to generate runtime configuration"
    echo "Using default configuration from build"
fi

echo "=========================================="

