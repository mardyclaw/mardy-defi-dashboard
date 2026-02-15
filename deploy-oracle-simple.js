const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
const crypto = require('crypto');

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

// Derive a private key from CDP credentials
function derivePrivateKeyFromCDP() {
  // Create a deterministic private key from the CDP secret
  const hash = crypto.createHash('sha256')
    .update(CDP_KEY_SECRET + CDP_KEY_ID)
    .digest('hex');
  
  return '0x' + hash;
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
    
    // Derive private key from CDP credentials
    const privateKey = derivePrivateKeyFromCDP();
    const wallet = new ethers.Wallet(privateKey, provider);
    const walletAddress = wallet.address;
    
    console.log('✓ Using account:', walletAddress);
    
    // Get balance
    const balance = await provider.getBalance(walletAddress);
    const balanceEth = ethers.formatEther(balance);
    console.log('Account balance:', balanceEth, 'ETH');
    
    if (balance === BigInt(0)) {
      console.error('\n❌ Account has no funds.');
      console.error('Please fund this address with Base Sepolia testnet ETH:');
      console.error('Address:', walletAddress);
      console.error('\nYou can get testnet ETH from the Base Sepolia faucet:');
      console.error('https://www.alchemy.com/faucets/base-sepolia');
      process.exit(1);
    }
    
    // Create contract factory
    console.log('\nPreparing deployment...');
    const ContractFactory = new ethers.ContractFactory(
      compiled.abi,
      compiled.bytecode,
      wallet
    );
    
    // Estimate gas
    const estimatedGas = await provider.estimateGas({
      data: compiled.bytecode,
      from: walletAddress
    }).catch(() => BigInt(1000000)); // Fallback estimate
    
    console.log('Estimated gas:', estimatedGas.toString());
    
    // Get gas price
    const gasPrice = await provider.getFeeData();
    console.log('Gas price:', ethers.formatUnits(gasPrice.gasPrice, 'gwei'), 'gwei');
    
    // Deploy the contract
    console.log('\nDeploying RSCUSDCOracle to Base Sepolia...');
    const contract = await ContractFactory.deploy({
      gasLimit: estimatedGas + BigInt(100000)
    });
    
    console.log('Transaction hash:', contract.deploymentTransaction().hash);
    console.log('Waiting for confirmation...');
    
    const receipt = await contract.waitForDeployment();
    const deployedAddress = await contract.getAddress();
    
    console.log('✓ Contract deployed successfully!');
    console.log('\n' + '='.repeat(50));
    console.log('Oracle Contract Address:', deployedAddress);
    console.log('='.repeat(50));
    console.log('Transaction receipt:', receipt);
    
    return deployedAddress;
    
  } catch (error) {
    console.error('\nDeployment error:', error.message);
    if (error.code) console.error('Error code:', error.code);
    throw error;
  }
}

// Run deployment
deployContract()
  .then(address => {
    console.log('\n🎉 DEPLOYMENT SUCCESSFUL 🎉');
    console.log('Oracle Contract Address:', address);
    
    // Save to file for reference
    const outputFile = path.join(__dirname, 'deployed-oracle-address.txt');
    fs.writeFileSync(outputFile, address);
    console.log('\nAddress saved to:', outputFile);
    
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  });
