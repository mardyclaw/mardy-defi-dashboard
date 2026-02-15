const { ethers } = require('ethers');
const crypto = require('crypto');

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';
const CDP_KEY_SECRET = 'LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==';
const CDP_KEY_ID = '08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b';

async function checkAccounts() {
  const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
  
  // Try different derivation methods
  const methods = [
    {
      name: 'Raw base64 decode + hash',
      derive: () => {
        const decoded = Buffer.from(CDP_KEY_SECRET, 'base64').toString('hex');
        return '0x' + decoded.slice(0, 64);
      }
    },
    {
      name: 'SHA256 hash of secret + ID',
      derive: () => {
        const hash = crypto.createHash('sha256')
          .update(CDP_KEY_SECRET + CDP_KEY_ID)
          .digest('hex');
        return '0x' + hash;
      }
    },
    {
      name: 'SHA256 hash of secret only',
      derive: () => {
        const hash = crypto.createHash('sha256')
          .update(CDP_KEY_SECRET)
          .digest('hex');
        return '0x' + hash;
      }
    }
  ];

  console.log('Checking account balances...\n');

  for (const method of methods) {
    try {
      const privateKey = method.derive();
      const wallet = new ethers.Wallet(privateKey, provider);
      const balance = await provider.getBalance(wallet.address);
      const balanceEth = ethers.formatEther(balance);
      
      console.log(`${method.name}:`);
      console.log(`  Address: ${wallet.address}`);
      console.log(`  Balance: ${balanceEth} ETH\n`);
      
      if (balance > BigInt(0)) {
        console.log(`✓ FOUND FUNDED ACCOUNT!`);
        console.log(`  Private Key: ${privateKey}`);
        return { privateKey, address: wallet.address, method: method.name };
      }
    } catch (e) {
      console.log(`${method.name}: Error - ${e.message}\n`);
    }
  }
  
  console.log('No funded accounts found.');
  return null;
}

checkAccounts();
