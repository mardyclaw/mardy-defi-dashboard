const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

// Base Sepolia RPC endpoint
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// CDP Wallet credentials
const CDP_KEY_ID = '08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b';
const CDP_KEY_SECRET = 'LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==';

async function compileContract(solidityCode) {
  console.log('Compiling RSCUSDCOracle.sol...');
  
  const input = {
    language: 'Solidity',
    sources: {
      'RSCUSDCOracle.sol': {
        content: solidityCode
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode', 'evm.bytecode.object']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors && output.errors.length > 0) {
    console.error('Compilation errors:', output.errors);
    throw new Error('Compilation failed');
  }

  const contract = output.contracts['RSCUSDCOracle.sol']['RSCUSDCOracle'];
  return {
    abi: contract.abi,
    bytecode: '0x' + contract.evm.bytecode.object
  };
}

async function deployContract() {
  try {
    // Read the contract source
    const contractPath = path.join(__dirname, 'RSCUSDCOracle.sol');
    const solidityCode = fs.readFileSync(contractPath, 'utf8');
    
    // Compile the contract
    const compiled = await compileContract(solidityCode);
    console.log('✓ Contract compiled successfully');
    
    // Connect to Base Sepolia
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    console.log('✓ Connected to Base Sepolia RPC');
    
    // Create wallet from CDP credentials
    // Using CDP wallet - we'll derive a key from the credentials for deployment
    // For now, we'll use a simplified approach with ethers
    
    // Note: CDP SDK uses specialized wallet management
    // Let's use the Coinbase SDK to manage this properly
    const { CoinbaseWalletSDK } = require('@coinbase/coinbase-sdk');
    
    const sdk = new CoinbaseWalletSDK({
      apiKeyName: CDP_KEY_ID,
      privateKey: CDP_KEY_SECRET
    });
    
    // Get or create a wallet
    let wallet = await sdk.listWallets();
    if (wallet.data.length === 0) {
      console.log('Creating new CDP wallet...');
      wallet = await sdk.createWallet();
    } else {
      wallet = wallet.data[0];
    }
    
    console.log('Using CDP wallet:', wallet.id);
    
    // Get accounts and use the first one
    let addresses = await wallet.getAddresses();
    if (addresses.data.length === 0) {
      console.log('Creating new account...');
      const account = await wallet.createAddress();
      addresses = [account];
    }
    
    const account = addresses.data[0];
    const walletAddress = account.address;
    console.log('✓ Using account:', walletAddress);
    
    // Get balance
    const balance = await provider.getBalance(walletAddress);
    console.log('Account balance:', ethers.formatEther(balance), 'ETH');
    
    if (balance === BigInt(0)) {
      console.error('❌ Account has no funds. Please fund the wallet with Base Sepolia testnet ETH.');
      process.exit(1);
    }
    
    // Create contract factory
    const ContractFactory = new ethers.ContractFactory(
      compiled.abi,
      compiled.bytecode,
      new ethers.Wallet(account.getPrivateKey ? account.getPrivateKey() : null, provider)
    );
    
    // Deploy the contract
    console.log('Deploying RSCUSDCOracle to Base Sepolia...');
    const contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
    
    const deployedAddress = await contract.getAddress();
    console.log('✓ Contract deployed successfully!');
    console.log('Contract address:', deployedAddress);
    
    return deployedAddress;
    
  } catch (error) {
    console.error('Deployment error:', error.message);
    throw error;
  }
}

// Run deployment
deployContract()
  .then(address => {
    console.log('\n=== DEPLOYMENT SUCCESSFUL ===');
    console.log('Oracle Contract Address:', address);
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed:', error.message);
    process.exit(1);
  });
