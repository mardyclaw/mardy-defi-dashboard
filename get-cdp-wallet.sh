#!/bin/bash

# Quick check: is Foundry installed?
if ! command -v forge &> /dev/null; then
    echo "Installing Foundry..."
    curl -L https://foundry.paradigm.xyz | bash
    source ~/.bashrc
    foundryup
fi

# Get wallet address from CDP credentials stored in auth-profiles.json
# For now, we need to initialize a CDP wallet via API call
# But first - do we have a local private key for deployment?

if [ -z "$PRIVATE_KEY" ]; then
    echo "No PRIVATE_KEY env var. Need to:"
    echo "1. Get it from CDP wallet"
    echo "2. Fund it with testnet ETH"
    echo "3. Set export PRIVATE_KEY=..."
fi

# Check Foundry project setup
if [ ! -f "foundry.toml" ]; then
    echo "Setting up Foundry project..."
    forge init --force
fi
