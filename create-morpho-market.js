#!/usr/bin/env node

/**
 * Morpho Blue Market Creation Script
 * Creates RSC/USDC lending market on Base Sepolia
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  network: 'Base Sepolia',
  rpcUrl: 'https://sepolia.base.org',
  chainId: 84532,
  morphoAddress: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  loanToken: '0x833589fcd6EdB6E08f4c7c32d4f71B1566469c3d', // USDC
  collateralToken: '0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1', // RSC
  irm: '0x870aC11D48B15DB9cb46b394e6f221Fda4836eaa', // AdaptiveCurveIRM
  lltv: ethers.parseUnits('0.86', 18) // 86%
};

// Minimal Morpho Blue ABI
const MORPHO_ABI = [
  {
    inputs: [
      { name: 'loanToken', type: 'address' },
      { name: 'collateralToken', type: 'address' },
      { name: 'oracle', type: 'address' },
      { name: 'irm', type: 'address' },
      { name: 'lltv', type: 'uint256' }
    ],
    name: 'createMarket',
    outputs: [{ name: 'marketId', type: 'bytes32' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'marketId', type: 'bytes32' }],
    name: 'market',
    outputs: [
      { name: 'loanToken', type: 'address' },
      { name: 'collateralToken', type: 'address' },
      { name: 'oracle', type: 'address' },
      { name: 'irm', type: 'address' },
      { name: 'lltv', type: 'uint256' },
      { name: 'liquidationIncentive', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

async function createMarket(oracleAddress) {
  try {
    console.log('🚀 Creating Morpho Blue RSC/USDC Market');
    console.log('=' .repeat(50));
    console.log(`Network: ${CONFIG.network}`);
    console.log(`Chain ID: ${CONFIG.chainId}`);
    console.log();

    // Connect to network
    const provider = new ethers.JsonRpcProvider(CONFIG.rpcUrl);
    const network = await provider.getNetwork();
    console.log(`✓ Connected to: ${network.name}`);
    console.log(`  Chain ID: ${network.chainId}`);

    // Create Morpho contract instance
    const morpho = new ethers.Contract(
      CONFIG.morphoAddress,
      MORPHO_ABI,
      provider
    );

    console.log();
    console.log('📋 Market Parameters:');
    console.log(`  Loan Token:      ${CONFIG.loanToken}`);
    console.log(`  Collateral:      ${CONFIG.collateralToken}`);
    console.log(`  Oracle:          ${oracleAddress}`);
    console.log(`  IRM:             ${CONFIG.irm}`);
    console.log(`  LLTV:            ${ethers.formatUnits(CONFIG.lltv, 18)} (86%)`);

    // Calculate market ID
    const packedParams = ethers.solidityPacked(
      ['address', 'address', 'address', 'address', 'uint256'],
      [
        CONFIG.loanToken,
        CONFIG.collateralToken,
        oracleAddress,
        CONFIG.irm,
        CONFIG.lltv
      ]
    );
    const marketId = ethers.keccak256(packedParams);

    console.log();
    console.log('📊 Market Details:');
    console.log(`  Market ID: ${marketId}`);

    // Save deployment info
    const deploymentInfo = {
      network: CONFIG.network,
      chainId: CONFIG.chainId,
      timestamp: new Date().toISOString(),
      market: {
        id: marketId,
        loanToken: CONFIG.loanToken,
        collateralToken: CONFIG.collateralToken,
        oracle: oracleAddress,
        irm: CONFIG.irm,
        lltv: ethers.formatUnits(CONFIG.lltv, 18)
      },
      links: {
        baseScan: `https://sepolia.basescan.org/address/${CONFIG.morphoAddress}`,
        morpho: `https://app.morpho.org/?network=base-sepolia`
      }
    };

    const infoPath = path.join(__dirname, 'market-deployment.json');
    fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));

    console.log();
    console.log('✅ Market configuration ready');
    console.log(`📄 Saved to: ${infoPath}`);
    console.log();
    console.log('📌 Next Step:');
    console.log('   Use this market ID with Morpho interface to:');
    console.log('   1. Supply USDC as lender');
    console.log('   2. Borrow RSC against collateral');
    console.log('   3. Monitor utilization and rates');

    return deploymentInfo;

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get oracle address from command line or file
const oracleArg = process.argv[2];
if (!oracleArg) {
  console.error('❌ Oracle address required');
  console.error('Usage: node create-morpho-market.js <oracle-address>');
  process.exit(1);
}

createMarket(oracleArg).then(() => {
  console.log();
  console.log('Done. ✨');
  process.exit(0);
});
