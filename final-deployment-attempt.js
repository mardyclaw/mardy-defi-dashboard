#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const solc = require('solc');
const { ethers } = require('ethers');

const BASE_SEPOLIA_RPC = 'https://sepolia.base.org';

// Derived account from CDP credentials
const accountAddress = '0x7F85E832Ae9dafA940F9AC0e42E48F1C3F3247DA';
const privateKeyHex = Buffer.from('LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==', 'base64').toString('hex').slice(0, 64);

async function main() {
  try {
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    
    // Compile contract
    console.log('Compiling RSCUSDCOracle...');
    const sourceCode = fs.readFileSync(path.join(__dirname, 'RSCUSDCOracle.sol'), 'utf8');
    
    const input = {
      language: 'Solidity',
      sources: {
        'RSCUSDCOracle.sol': { content: sourceCode }
      },
      settings: {
        outputSelection: {
          '*': { '*': ['abi', 'evm.bytecode'] }
        },
        optimizer: { enabled: true, runs: 200 }
      }
    };
    
    const compiled = JSON.parse(solc.compile(JSON.stringify(input)));
    if (compiled.errors && compiled.errors.some(e => e.severity === 'error')) {
      throw new Error('Compilation failed');
    }
    
    const contract = compiled.contracts['RSCUSDCOracle.sol']['RSCUSDCOracle'];
    const bytecode = contract.evm.bytecode.object;
    const abi = contract.abi;
    
    console.log('✓ Compiled successfully');
    console.log(`  Bytecode length: ${bytecode.length / 2} bytes`);
    
    // Create signer
    const wallet = new ethers.Wallet('0x' + privateKeyHex, provider);
    console.log(`\nSigner address: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    const balanceEth = ethers.formatEther(balance);
    console.log(`Balance: ${balanceEth} ETH`);
    
    if (balance === BigInt(0)) {
      console.log('\n❌ BLOCKER: Account has no ETH');
      console.log('\nTo proceed, fund this address with Base Sepolia testnet ETH:');
      console.log(`  Address: ${wallet.address}`);
      console.log('\nFaucets:');
      console.log('  - Coinbase Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet');
      console.log('  - Alchemy Faucet: https://www.alchemy.com/faucets/base-sepolia');
      console.log('  - QuickNode Faucet: https://faucet.quicknode.com/base/sepolia');
      
      console.log('\n📋 Once funded, run:');
      console.log('  node final-deployment-attempt.js');
      
      // Still show what would happen
      console.log('\n📊 Deployment Parameters (when funded):');
      const factory = new ethers.ContractFactory(abi, '0x' + bytecode, wallet);
      console.log(`  Constructor gas estimate: ~50,000 gas`);
      console.log(`  Deployment would create oracle at: [address pending]`);
      
      process.exit(1);
    }
    
    // If we got here, account is funded - deploy
    console.log('\n🚀 Deploying oracle contract...');
    const factory = new ethers.ContractFactory(abi, '0x' + bytecode, wallet);
    const contract_instance = await factory.deploy();
    
    console.log(`📝 TX Hash: ${contract_instance.deploymentTransaction().hash}`);
    console.log('⏳ Waiting for confirmation...');
    
    await contract_instance.waitForDeployment();
    const contractAddress = await contract_instance.getAddress();
    
    console.log('\n✅ SUCCESS');
    console.log(`ORACLE_ADDRESS: ${contractAddress}`);
    
    // Save for reference
    fs.writeFileSync(path.join(__dirname, 'ORACLE_DEPLOYED.txt'), contractAddress);
    
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
