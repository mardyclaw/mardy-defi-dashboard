const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ethers } = require('ethers');

// CDP Wallet credentials
const CDP_KEY_ID = '08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b';
const CDP_KEY_SECRET = 'LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==';

// Derive private key
function derivePrivateKeyFromCDP() {
  const hash = crypto.createHash('sha256')
    .update(CDP_KEY_SECRET + CDP_KEY_ID)
    .digest('hex');
  return '0x' + hash;
}

async function main() {
  try {
    const pk = derivePrivateKeyFromCDP();
    const wallet = new ethers.Wallet(pk);
    const targetAddress = wallet.address;
    
    console.log('Target address for deployment:', targetAddress);
    console.log('Private key (first 10 chars): 0x' + pk.slice(2, 12) + '...');
    
    // Try to use Coinbase API to fund the address
    const CoinbaseSDK = require('@coinbase/coinbase-sdk').default;
    
    console.log('\nAttempting to use Coinbase SDK...');
    console.log('SDK loaded:', !!CoinbaseSDK);
    
    // Configure Coinbase
    CoinbaseSDK.apiKeyName = CDP_KEY_ID;
    CoinbaseSDK.privateKey = CDP_KEY_SECRET;
    CoinbaseSDK.networkId = 'base-sepolia';
    
    console.log('Coinbase SDK configured');
    
    // Try to get wallet
    try {
      const resp = await CoinbaseSDK.listWallets();
      console.log('Wallets response:', resp);
    } catch(e) {
      console.log('Could not list wallets:', e.message);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
