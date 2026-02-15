#!/usr/bin/env node

const https = require('https');

const address = '0x7F85E832Ae9dafA940F9AC0e42E48F1C3F3247DA';

async function requestFromAlchemy() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      jsonrpc: '2.0',
      method: 'requestsFromFaucet',
      params: [address],
      id: 1
    });

    const options = {
      hostname: 'base-sepolia.g.alchemy.com',
      port: 443,
      path: '/v2/demo', // Alchemy faucet endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.result) {
            resolve(true);
          } else {
            reject(new Error(result.error?.message || 'Faucet request failed'));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function requestFromCoinbase() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      address: address
    });

    const options = {
      hostname: 'api.coinbase.com',
      port: 443,
      path: '/v1/faucets/base-sepolia',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(true);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function requestTestnetETH() {
  console.log(`Requesting testnet ETH for: ${address}\n`);

  // Try Coinbase faucet first (most reliable for Base Sepolia)
  try {
    console.log('Attempting Coinbase faucet...');
    await requestFromCoinbase();
    console.log('✓ Request sent to Coinbase faucet');
    console.log('ETH should arrive within 1-2 minutes');
    return;
  } catch (e1) {
    console.log('Coinbase faucet unavailable:', e1.message);
  }

  // Try Alchemy faucet
  try {
    console.log('\nAttempting Alchemy faucet...');
    await requestFromAlchemy();
    console.log('✓ Request sent to Alchemy faucet');
    return;
  } catch (e2) {
    console.log('Alchemy faucet unavailable:', e2.message);
  }

  console.log('\n❌ Automated faucet requests failed');
  console.log('\nPlease manually fund the address:');
  console.log(`Address: ${address}\n`);
  console.log('Use one of these faucets:');
  console.log('1. Coinbase: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
  console.log('2. Alchemy:  https://www.alchemy.com/faucets/base-sepolia');
  console.log('3. QuickNode: https://faucet.quicknode.com/base/sepolia');
}

requestTestnetETH().catch(console.error);
