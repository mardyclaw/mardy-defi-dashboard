const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');
const { Coinbase } = require('@coinbase/coinbase-sdk');

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';
const CDP_KEY_ID = '08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b';
const CDP_KEY_SECRET = 'LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==';

async function compileContract(solidityCode) {
  const input = {
    language: 'Solidity',
    sources: {
      'RSCUSDCOracle.sol': { content: solidityCode }
    },
    settings: {
      outputSelection: {
        '*': { '*': ['abi', 'evm.bytecode'] }
      },
      optimizer: { enabled: true, runs: 200 }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  if (output.errors && output.errors.some(e => e.severity === 'error')) {
    throw new Error('Compilation failed');
  }

  const contract = output.contracts['RSCUSDCOracle.sol']['RSCUSDCOracle'];
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  };
}

async function deploy() {
  try {
    // Configure Coinbase SDK
    Coinbase.configure({
      apiKeyName: CDP_KEY_ID,
      privateKey: CDP_KEY_SECRET,
      networkId: 'base-sepolia'
    });

    // Get wallet
    const wallet = await Coinbase.defaultWallet();
    const addresses = await wallet.addresses();
    const address = addresses.length > 0 ? addresses[0] : await wallet.createAddress();
    const walletAddress = address.address;

    // Check balance
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    const balance = await provider.getBalance(walletAddress);

    if (balance === BigInt(0)) {
      console.error('ERROR: Account balance is zero');
      console.error('Address:', walletAddress);
      process.exit(1);
    }

    // Compile
    const contractCode = fs.readFileSync(path.join(__dirname, 'RSCUSDCOracle.sol'), 'utf8');
    const compiled = await compileContract(contractCode);

    // Get signer
    let signer;
    try {
      const exportData = await address.export();
      const privateKey = exportData.privateKeyHex || exportData.private_key;
      signer = new ethers.Wallet(privateKey, provider);
    } catch (e) {
      console.error('ERROR: Cannot export private key from CDP wallet');
      process.exit(1);
    }

    // Deploy
    const factory = new ethers.ContractFactory(compiled.abi, '0x' + compiled.bytecode, signer);
    const contract = await factory.deploy();
    await contract.waitForDeployment();
    const contractAddress = await contract.getAddress();

    console.log('ORACLE_ADDRESS: ' + contractAddress);
    process.exit(0);

  } catch (error) {
    console.error('ERROR: ' + error.message);
    process.exit(1);
  }
}

deploy();
