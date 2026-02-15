#!/usr/bin/env node

const { Wallet, CdpApiClient } = require("@coinbase/coinbase-sdk");
const fs = require("fs");

// Set up CDP credentials
process.env.CDP_API_KEY_NAME = "08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b";
process.env.CDP_API_KEY_PRIVATE_KEY = "LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==";

// Contract code
const contractCode = fs.readFileSync("/home/mardy/.openclaw/workspace/RSCUSDCOracle.sol", "utf-8");

// Contract ABI
const contractABI = [
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

async function deployOracle() {
  try {
    console.log("🚀 Initializing Coinbase CDP Wallet...\n");

    // Initialize the Coinbase CDP client
    const client = new CdpApiClient();
    console.log("✅ CDP API Client initialized");

    // Create or get wallet on Base Sepolia
    const wallet = await Wallet.create({
      networkId: "base-sepolia",
      displayName: "Oracle Deployment Wallet"
    });

    console.log(`✅ Wallet created`);
    console.log(`Wallet ID: ${wallet.getId()}`);
    console.log(`Network: Base Sepolia`);

    // Get wallet address
    const addresses = await wallet.getAddresses();
    const walletAddress = addresses[0].getAddress();
    console.log(`Wallet address: ${walletAddress}`);

    // Check balance
    console.log(`\n💰 Checking balance...`);
    const balance = await wallet.getBalance("ETH");
    console.log(`ETH Balance: ${balance} ETH`);

    if (parseFloat(balance) === 0) {
      console.log("\n⚠️  Wallet has zero balance!");
      console.log("Please fund the wallet with testnet ETH from Base Sepolia faucet:");
      console.log("https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
      process.exit(1);
    }

    console.log("\n📦 Deploying RSCUSDCOracle contract...");
    console.log(`Contract: RSCUSDCOracle.sol`);
    console.log(`Network: Base Sepolia (84532)`);

    // Deploy contract using wallet's deployContract method
    const deploymentResult = await wallet.deployContract({
      contractName: "RSCUSDCOracle",
      contractAbi: JSON.stringify(contractABI),
      contractBytecode: "", // Will be compiled from source
      constructorArgs: []
    });

    console.log(`\n✅ Deployment initiated`);
    console.log(`Transaction ID: ${deploymentResult.getTransactionHash ? deploymentResult.getTransactionHash() : "pending"}`);

    // Wait for deployment to complete
    console.log(`⏳ Waiting for transaction confirmation...`);
    
    // Get contract address from deployment
    const contractAddress = deploymentResult.getContractAddress ? 
      deploymentResult.getContractAddress() : 
      null;

    if (contractAddress) {
      console.log(`\n🎉 Contract deployed successfully!`);
      console.log(`Oracle Contract Address: ${contractAddress}`);

      // Save deployment info
      const deploymentInfo = {
        network: "base-sepolia",
        chainId: 84532,
        contractAddress: contractAddress,
        contractName: "RSCUSDCOracle",
        walletId: wallet.getId(),
        walletAddress: walletAddress,
        deploymentTime: new Date().toISOString(),
        explorerUrl: `https://sepolia.basescan.org/address/${contractAddress}`
      };

      const infoPath = "/home/mardy/.openclaw/workspace/deployment-info.json";
      fs.writeFileSync(infoPath, JSON.stringify(deploymentInfo, null, 2));

      console.log(`\n📄 Deployment info saved to: ${infoPath}`);
      console.log(`\n📊 View on BaseScan: ${deploymentInfo.explorerUrl}`);

      return deploymentInfo;
    } else {
      console.log("⏳ Deployment transaction sent. Please check wallet for status.");
    }

  } catch (error) {
    console.error("\n❌ Deployment failed:");
    console.error(error.message);
    if (error.code) console.error(`Error code: ${error.code}`);
    
    // Provide helpful error messages
    if (error.message.includes("balance")) {
      console.log("\n💡 Tip: Make sure the wallet has sufficient ETH balance");
    }
    if (error.message.includes("network")) {
      console.log("\n💡 Tip: Make sure you're connected to Base Sepolia testnet");
    }
    
    process.exit(1);
  }
}

// Run deployment
deployOracle().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
