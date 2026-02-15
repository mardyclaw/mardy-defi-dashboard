const { ethers } = require('ethers');

// Base Mainnet addresses
const config = {
  morpho: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
  loanToken: '0x833589fcd6EdB6E08f4c7c32d4f71b1566469c3d', // USDC
  collateralToken: '0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1', // RSC
  oracle: process.argv[2], // Passed in
  irm: '0xA5Fcd42877abf0B4a8D0236c11986b8b8505b008', // Base mainnet IRM
  lltv: ethers.parseUnits('0.86', 18)
};

// Calculate market ID
const packedParams = ethers.solidityPacked(
  ['address', 'address', 'address', 'address', 'uint256'],
  [
    config.loanToken,
    config.collateralToken,
    config.oracle,
    config.irm,
    config.lltv
  ]
);

const marketId = ethers.keccak256(packedParams);

console.log('📊 Morpho Blue Market Configuration');
console.log('=====================================');
console.log('Network: Base Mainnet');
console.log('');
console.log('Parameters:');
console.log('  Loan Token (USDC):    ', config.loanToken);
console.log('  Collateral (RSC):     ', config.collateralToken);
console.log('  Oracle:               ', config.oracle);
console.log('  IRM:                  ', config.irm);
console.log('  LLTV:                 ', '86%');
console.log('');
console.log('Market ID (keccak256):');
console.log(' ', marketId);
console.log('');
console.log('✅ Market parameters ready for creation on Morpho Blue');
console.log('');
console.log('Next: Call createMarket() on Morpho with these parameters');

// Save to file
const fs = require('fs');
const config_output = {
  network: 'base-mainnet',
  marketId,
  loanToken: config.loanToken,
  collateralToken: config.collateralToken,
  oracle: config.oracle,
  irm: config.irm,
  lltv: '0.86'
};

fs.writeFileSync('market-config.json', JSON.stringify(config_output, null, 2));
console.log('Saved to: market-config.json');
