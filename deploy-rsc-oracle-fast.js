const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

// Base Sepolia RPC endpoint
const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// CDP Wallet credentials - for deriving a private key
const CDP_KEY_ID = '08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b';
const CDP_KEY_SECRET = 'LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==';

async function compileContract(solidityCode) {
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
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors && output.errors.some(e => e.severity === 'error')) {
    throw new Error('Compilation failed: ' + output.errors.map(e => e.message).join('\n'));
  }

  const contract = output.contracts['RSCUSDCOracle.sol']['RSCUSDCOracle'];
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  };
}

async function deploy() {
  try {
    // Read and compile contract
    const contractPath = path.join(__dirname, 'RSCUSDCOracle.sol');
    const solidityCode = fs.readFileSync(contractPath, 'utf8');
    const compiled = await compileContract(solidityCode);
    
    // Connect to Base Sepolia
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    
    // Create wallet from private key derived from CDP secret
    // Using a deterministic approach from the CDP credentials
    const hash = require('crypto')
      .createHash('sha256')
      .update(CDP_KEY_SECRET + CDP_KEY_ID)
      .digest('hex');
    
    const privateKey = '0x' + hash;
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Get account balance
    const balance = await provider.getBalance(wallet.address);
    
    if (balance === BigInt(0)) {
      console.error('ERROR: Account has zero balance. Cannot deploy.');
      console.error('Address:', wallet.address);
      process.exit(1);
    }
    
    // Create contract factory and deploy
    const ContractFactory = new ethers.ContractFactory(compiled.abi, '0x' + compiled.bytecode, wallet);
    
    const contract = await ContractFactory.deploy();
    await contract.waitForDeployment();
    
    const address = await contract.getAddress();
    console.log('ORACLE_ADDRESS: ' + address);
    
    process.exit(0);
    
  } catch (error) {
    console.error('ERROR: ' + error.message);
    process.exit(1);
  }
}

deploy();
