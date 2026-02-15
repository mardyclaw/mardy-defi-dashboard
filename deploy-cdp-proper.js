const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

// Import Coinbase SDK properly
const { Coinbase, ApiClients } = require('@coinbase/coinbase-sdk');

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
    const hasErrors = output.errors.some(e => e.severity === 'error');
    if (hasErrors) {
      console.error('Compilation errors:', output.errors);
      throw new Error('Compilation failed');
    }
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
    
    // Initialize Coinbase SDK
    console.log('Initializing Coinbase SDK...');
    Coinbase.configure({
      apiKeyName: CDP_KEY_ID,
      privateKey: CDP_KEY_SECRET,
      networkId: 'base-sepolia'
    });
    
    console.log('✓ Coinbase SDK configured');
    
    // Get wallet
    console.log('Retrieving CDP wallet...');
    const wallet = await Coinbase.defaultWallet();
    console.log('Wallet ID:', wallet.id);
    
    // Get or create address
    const addresses = await wallet.addresses();
    let address;
    
    if (addresses.length > 0) {
      address = addresses[0];
    } else {
      console.log('Creating new address...');
      address = await wallet.createAddress();
    }
    
    const walletAddress = address.address;
    console.log('✓ Using address:', walletAddress);
    
    // Connect to Base Sepolia provider
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    
    // Check balance
    const balance = await provider.getBalance(walletAddress);
    const balanceEth = ethers.formatEther(balance);
    console.log('Account balance:', balanceEth, 'ETH');
    
    if (balance === BigInt(0)) {
      console.error('\n❌ Account has no funds.');
      console.error('Please fund this address with Base Sepolia testnet ETH:');
      console.error('Address:', walletAddress);
      console.error('\nYou can get testnet ETH from:');
      console.error('- Alchemy Faucet: https://www.alchemy.com/faucets/base-sepolia');
      console.error('- Base Faucet: https://www.base.org/faucets');
      process.exit(1);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('Deploying RSCUSDCOracle to Base Sepolia...');
    console.log('='.repeat(50) + '\n');
    
    // Create contract factory
    const ContractFactory = new ethers.ContractFactory(
      compiled.abi,
      compiled.bytecode
    );
    
    // For deployment, we need to sign transactions through CDP
    // Let's try a different approach - use the address to deploy via ethers
    // and sign transactions through the wallet
    
    // Create a signer that signs through CDP
    // This requires using the wallet's signing capabilities
    
    // Try to get the private key from the wallet (if available)
    let signer;
    
    try {
      // Check if we can get export data
      const exportData = await address.export();
      const privateKey = exportData.privateKeyHex || exportData.private_key;
      
      if (privateKey) {
        console.log('Using exported private key for signing');
        signer = new ethers.Wallet(privateKey, provider);
      } else {
        throw new Error('Could not export private key');
      }
    } catch (e) {
      console.log('Cannot export private key, will attempt direct deployment');
      // Fall back to trying without explicit signer
      throw new Error('Need private key to sign transactions');
    }
    
    const factory = ContractFactory.connect(signer);
    
    console.log('Sending deployment transaction...');
    const contract = await factory.deploy({
      gasLimit: 2000000
    });
    
    console.log('Transaction hash:', contract.deploymentTransaction().hash);
    console.log('Waiting for confirmation...');
    
    const deployed = await contract.waitForDeployment();
    const deployedAddress = await contract.getAddress();
    
    console.log('\n' + '='.repeat(50));
    console.log('✓ Contract deployed successfully!');
    console.log('Oracle Contract Address:', deployedAddress);
    console.log('='.repeat(50));
    
    return deployedAddress;
    
  } catch (error) {
    console.error('\nDeployment error:', error.message);
    if (error.code) console.error('Error code:', error.code);
    console.error('Stack:', error.stack);
    throw error;
  }
}

// Run deployment
deployContract()
  .then(address => {
    console.log('\n🎉 DEPLOYMENT SUCCESSFUL 🎉');
    console.log('Oracle Contract Address:', address);
    
    const outputFile = path.join(__dirname, 'deployed-oracle-address.txt');
    fs.writeFileSync(outputFile, address);
    console.log('Address saved to:', outputFile);
    
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  });
