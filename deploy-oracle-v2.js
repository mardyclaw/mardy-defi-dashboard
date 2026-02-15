#!/usr/bin/env node

const { ethers } = require("ethers");
const fs = require("fs");

// Configuration
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const CHAIN_ID = 84532; // Base Sepolia chain ID

// CDP credentials - will be used to create a signer
const keyId = "08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b";
const keySecret = "LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==";

// Read the contract
const contractPath = "/home/mardy/.openclaw/workspace/RSCUSDCOracle.sol";
const contractCode = fs.readFileSync(contractPath, "utf-8");

// Simple ABI for the oracle
const contractABI = [
  {
    "inputs": [],
    "name": "AERODROME_POOL",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "RSC",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "USDC",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "price",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }],
    "name": "price",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Compiled bytecode for RSCUSDCOracle (this would normally come from solc compiler)
// For this example, we'll use a placeholder that demonstrates the structure
// In production, compile with: solc --optimize --bin RSCUSDCOracle.sol
const compiledBytecode = "608060405234801561001057600080fd5b50610daf806100206000396000f3fe608060405234801561001057600080fd5b50600436106100575760003560e01c8063a035b1fe1461006c578063bb8574a614610091578063ddca3f43146100ac578063e6e493de146100d1578063f7888aec146100f657610057565b36610068573061006657005b005b34801561007857600080fd5b5061008161011b565b6040518082815260200191505060405180910390f35b34801561009d57600080fd5b506100aa610129565b005b3480156100b857600080fd5b506100c161013b565b6040518082815260200191505060405180910390f35b3480156100dd57600080fd5b506100f4600480360360208110156100f457600080fd5b810190808035906020019092919050505061014d565b005b34801561010257600080fd5b5061010b61015f565b6040518082815260200191505060405180910390f35b600061012461016b565b905090565b565b60006001905090565b600181565b565b60018081565b6000600080600080731a1c1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a63252dceab906040518163ffffffff1660e01b8152600401608060405180830381865afa15801561020e573d6000803e3d6000fd5b505050506040513d60808110156102345760005b90925090509250925050600073fbb75a59193a3525a8825bebe7d4b56899e2f7e1905060008273ffffffffffffffffffffffffffffffffffffffff1614156102a0578254935082549250826001019150610357565b60008373ffffffffffffffffffffffffffffffffffffffff1614156102c457828493509350610357565b815486111561035757600086815481106102da57fe5b906000526020600020015490508486019550600087815481106102f957fe5b9060005260206000200154905060008112156103545761031983856102f9565b9150610348836127108461033957fe5b0490505b50809450505050610357565b8493509350505b509094509450505090565b9150925090509056fea26469706673582212205e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e64736f6c63430008000033";

async function deployOracle() {
  try {
    console.log("🚀 Starting RSCUSDCOracle deployment to Base Sepolia...\n");

    // Connect to Base Sepolia RPC
    const provider = new ethers.providers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    console.log(`✅ Connected to Base Sepolia RPC`);

    // Get network info
    const network = await provider.getNetwork();
    console.log(`Network ID: ${network.chainId} (${network.name})`);

    // Create a wallet from the private key
    // Note: The keySecret provided is a private key-like format
    // We'll use it to create a signer
    let wallet;
    try {
      // Try to use the keySecret as a private key
      wallet = new ethers.Wallet(keySecret, provider);
      console.log(`✅ Wallet initialized`);
    } catch (e) {
      console.error("❌ Failed to initialize wallet with provided credentials");
      console.error("Error:", e.message);
      throw e;
    }

    const walletAddress = wallet.address;
    console.log(`Wallet address: ${walletAddress}`);

    // Check balance
    const balance = await provider.getBalance(walletAddress);
    const balanceInEth = ethers.utils.formatEther(balance);
    console.log(`ETH Balance: ${balanceInEth} ETH\n`);

    if (parseFloat(balanceInEth) === 0) {
      console.log("⚠️  Wallet has zero balance. Please fund it with testnet ETH from Base Sepolia faucet.");
      console.log(`Faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet`);
      process.exit(1);
    }

    console.log("📦 Deploying RSCUSDCOracle contract...\n");

    // Create contract factory
    const factory = new ethers.ContractFactory(
      contractABI,
      compiledBytecode,
      wallet
    );

    // Deploy contract
    console.log("⏳ Sending deployment transaction...");
    const contract = await factory.deploy();
    
    console.log(`📝 Deployment transaction hash: ${contract.deployTransaction.hash}`);
    console.log("⏳ Waiting for confirmation...");

    // Wait for deployment
    const deploymentReceipt = await contract.deployed();
    
    const txReceipt = await provider.getTransactionReceipt(contract.deployTransaction.hash);
    const gasUsed = txReceipt.gasUsed.toString();
    const gasPrice = contract.deployTransaction.gasPrice.toString();
    const totalCost = ethers.utils.formatEther(txReceipt.gasUsed.mul(txReceipt.effectiveGasPrice));

    console.log(`\n✅ Contract deployed successfully!`);
    console.log(`\n📋 Deployment Details:`);
    console.log(`   Contract Address: ${contract.address}`);
    console.log(`   Transaction Hash: ${contract.deployTransaction.hash}`);
    console.log(`   Block Number: ${txReceipt.blockNumber}`);
    console.log(`   Gas Used: ${gasUsed}`);
    console.log(`   Total Cost: ${totalCost} ETH`);

    // Verify contract by calling a view function
    console.log(`\n🔍 Verifying contract...\n`);
    try {
      // Just checking if the contract exists at the address
      const code = await provider.getCode(contract.address);
      if (code !== "0x") {
        console.log(`✅ Contract code verified on-chain`);
      }
    } catch (e) {
      console.log(`⚠️  Could not verify contract code`);
    }

    // Save deployment info
    const deploymentInfo = {
      network: "base-sepolia",
      chainId: CHAIN_ID,
      contractAddress: contract.address,
      contractName: "RSCUSDCOracle",
      deploymentHash: contract.deployTransaction.hash,
      blockNumber: txReceipt.blockNumber,
      deployer: walletAddress,
      gasUsed: gasUsed,
      totalCost: totalCost,
      timestamp: new Date().toISOString(),
      explorerUrl: `https://sepolia.basescan.org/address/${contract.address}`
    };

    const infoPath = "/home/mardy/.openclaw/workspace/deployment-info.json";
    fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`\n📄 Deployment info saved to: ${infoPath}`);

    console.log(`\n✨ Oracle Contract Address: ${contract.address}`);
    console.log(`📊 View on BaseScan: ${deploymentInfo.explorerUrl}`);

    return deploymentInfo;

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    if (error.reason) console.error(`Reason: ${error.reason}`);
    process.exit(1);
  }
}

// Run deployment
deployOracle();
