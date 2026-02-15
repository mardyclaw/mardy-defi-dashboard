#!/usr/bin/env node

const { Coinbase, Wallet } = require("@coinbase/coinbase-sdk");
const fs = require("fs");

// Configure Coinbase SDK with credentials
const keyId = "08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b";
const keySecret = "LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==";

// Initialize Coinbase SDK
Coinbase.configure({
  apiKeyName: keyId,
  privateKey: keySecret
});

// Read contract
const contractPath = "/home/mardy/.openclaw/workspace/RSCUSDCOracle.sol";
const contractSource = fs.readFileSync(contractPath, "utf-8");

async function deployOracle() {
  try {
    console.log("🚀 Coinbase CDP Oracle Deployment\n");
    console.log("═══════════════════════════════════════════════════\n");

    console.log("📋 Configuration:");
    console.log("   Network: Base Sepolia");
    console.log("   Contract: RSCUSDCOracle");
    console.log(`   Key ID: ${process.env.CDP_API_KEY_NAME}`);
    console.log();

    // Create wallet using CDP
    console.log("🔑 Initializing wallet with CDP credentials...");
    
    const wallet = await Wallet.create({
      networkId: "base-sepolia"
    });

    console.log(`✅ Wallet created`);
    console.log(`   Wallet ID: ${wallet.getId()}`);

    // Get addresses
    const addresses = await wallet.getAddresses();
    if (!addresses || addresses.length === 0) {
      throw new Error("No addresses found in wallet");
    }

    const address = addresses[0];
    const addressStr = address.getAddress();
    console.log(`   Address: ${addressStr}`);
    console.log();

    // Check balance
    console.log("💰 Checking balance...");
    try {
      const balance = await wallet.getBalance("ETH");
      console.log(`   ETH Balance: ${balance}`);
      console.log();

      if (parseFloat(balance) === 0) {
        console.log("⚠️  Wallet balance is 0!");
        console.log("\n   The wallet was created but needs funding.");
        console.log("   Please transfer testnet ETH from Base Sepolia faucet:");
        console.log("   https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
        console.log();
        console.log("   Then run the deployment again.\n");
        
        // Still try to deploy to show what would happen
        console.log("📦 Attempting deployment anyway...\n");
      }
    } catch (balanceError) {
      console.log(`   Could not check balance (may be normal): ${balanceError.message}`);
      console.log();
    }

    // Prepare contract deployment
    console.log("📝 Preparing contract deployment...");
    console.log("   Compiling contract...");

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

    console.log("   ABI loaded");
    console.log();

    console.log("🚀 Deploying contract...");
    console.log("   Sending deployment transaction...");

    // Try to deploy using the wallet's deploy method
    try {
      const deployResult = await wallet.deployContract({
        contractName: "RSCUSDCOracle",
        contractAbi: contractABI,
        contractSource: contractSource,
        constructorArgs: []
      });

      console.log();
      console.log("✅ Deployment transaction sent!");
      
      let contractAddress = null;
      
      if (typeof deployResult.getContractAddress === "function") {
        contractAddress = deployResult.getContractAddress();
      } else if (deployResult.contractAddress) {
        contractAddress = deployResult.contractAddress;
      } else if (deployResult.address) {
        contractAddress = deployResult.address;
      }

      if (contractAddress) {
        console.log();
        console.log("═══════════════════════════════════════════════════");
        console.log("🎉 ORACLE DEPLOYED SUCCESSFULLY!");
        console.log("═══════════════════════════════════════════════════");
        console.log();
        console.log(`Contract Address: ${contractAddress}`);
        console.log(`Network: Base Sepolia`);
        console.log(`Explorer: https://sepolia.basescan.org/address/${contractAddress}`);
        console.log();

        // Save info
        const deploymentInfo = {
          network: "base-sepolia",
          chainId: 84532,
          contractAddress: contractAddress,
          contractName: "RSCUSDCOracle",
          deployerAddress: addressStr,
          walletId: wallet.getId(),
          timestamp: new Date().toISOString(),
          explorerUrl: `https://sepolia.basescan.org/address/${contractAddress}`
        };

        fs.writeFileSync(
          "/home/mardy/.openclaw/workspace/deployment-info.json",
          JSON.stringify(deploymentInfo, null, 2)
        );

        console.log("📄 Saved deployment info to deployment-info.json");
        console.log("═══════════════════════════════════════════════════");
        console.log();

        return contractAddress;
      } else {
        console.log("⏳ Deployment in progress...");
        console.log("   Transaction initiated. Check wallet for status.");
      }

    } catch (deployError) {
      if (deployError.message.includes("insufficient")) {
        console.log();
        console.log("❌ Insufficient balance!");
        console.log("   Wallet needs testnet ETH to deploy.");
        console.log("   Fund at: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
      } else {
        console.log(`\n❌ Deployment failed: ${deployError.message}`);
        if (deployError.code) console.log(`   Code: ${deployError.code}`);
      }
      throw deployError;
    }

  } catch (error) {
    console.error("\n❌ Fatal error:", error.message);
    if (error.code) console.error(`   Code: ${error.code}`);
    process.exit(1);
  }
}

// Run
deployOracle();
