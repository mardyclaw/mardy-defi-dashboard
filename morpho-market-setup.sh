#!/bin/bash

# Morpho Blue Market Creation for RSC/USDC
# Base Sepolia Testnet

echo "🚀 Morpho Blue RSC/USDC Market Setup"
echo "=================================="
echo ""

# Configuration
NETWORK="base-sepolia"
MORPHO_ADDRESS="0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
RSC_ADDRESS="0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1"
USDC_ADDRESS="0x833589fcd6EdB6E08f4c7c32d4f71B1566469c3d"
IRM_ADDRESS="0x870aC11D48B15DB9cb46b394e6f221Fda4836eaa"
LLTV="860000000000000000"  # 86% in 18 decimals
RPC_URL="https://sepolia.base.org"

echo "Configuration:"
echo "  Network: $NETWORK"
echo "  Morpho: $MORPHO_ADDRESS"
echo "  RSC: $RSC_ADDRESS"
echo "  USDC: $USDC_ADDRESS"
echo "  LLTV: 86%"
echo ""

# The oracle address should be passed as argument
if [ -z "$1" ]; then
  echo "❌ Oracle address required as argument"
  echo "Usage: $0 <oracle_address>"
  exit 1
fi

ORACLE_ADDRESS=$1
echo "Oracle: $ORACLE_ADDRESS"
echo ""

# Create market using ethers.js
cat > /tmp/create-morpho-market.js << 'SCRIPT'
const { ethers } = require("ethers");

const oracleAddress = process.argv[2];

// Morpho Blue ABI (essential functions only)
const morphoABI = [
  {
    name: "createMarket",
    inputs: [
      { name: "loanToken", type: "address" },
      { name: "collateralToken", type: "address" },
      { name: "oracle", type: "address" },
      { name: "irm", type: "address" },
      { name: "lltv", type: "uint256" }
    ],
    outputs: [{ name: "marketId", type: "bytes32" }],
    stateMutability: "nonpayable",
    type: "function"
  }
];

const morphoAddress = "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
const rscAddress = "0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1";
const usdcAddress = "0x833589fcd6EdB6E08f4c7c32d4f71B1566469c3d";
const irmAddress = "0x870aC11D48B15DB9cb46b394e6f221Fda4836eaa";
const lltvValue = ethers.parseUnits("0.86", 18);

async function createMarket() {
  try {
    console.log("Creating Morpho Blue market...");
    console.log(`  Loan Token (USDC): ${usdcAddress}`);
    console.log(`  Collateral Token (RSC): ${rscAddress}`);
    console.log(`  Oracle: ${oracleAddress}`);
    console.log(`  IRM: ${irmAddress}`);
    console.log(`  LLTV: 86%`);
    
    // Note: This would need a signer with funds to actually execute
    // For now, we're just showing the parameters
    
    const morpho = new ethers.Contract(morphoAddress, morphoABI);
    
    console.log("\n📋 Market Parameters:");
    console.log(`  Loan Token: ${usdcAddress}`);
    console.log(`  Collateral: ${rscAddress}`);
    console.log(`  Oracle: ${oracleAddress}`);
    console.log(`  IRM: ${irmAddress}`);
    console.log(`  LLTV: ${ethers.formatUnits(lltvValue, 18)}`);
    
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

createMarket();
SCRIPT

node /tmp/create-morpho-market.js "$ORACLE_ADDRESS"

echo ""
echo "✅ Market parameters ready for creation"
echo "📝 Next step: Execute market creation via Remix or ethers.js with signer"
