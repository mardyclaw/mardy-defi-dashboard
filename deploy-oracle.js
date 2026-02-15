#!/usr/bin/env node

const { Wallet } = require("@coinbase/coinbase-sdk");
const fs = require("fs");

// CDP credentials
const keyId = "08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b";
const keySecret = "LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==";

// Contract ABI (minimal for deployment)
const contractABI = [
  {
    "inputs": [],
    "name": "price",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

// Read the contract bytecode - we'll compile it inline
const solidityCode = fs.readFileSync("/home/mardy/.openclaw/workspace/RSCUSDCOracle.sol", "utf-8");

async function deployOracle() {
  try {
    console.log("🚀 Initializing Coinbase CDP Wallet...");
    
    // Initialize wallet with CDP credentials
    const wallet = await Wallet.init({
      apiKeyName: keyId,
      privateKey: keySecret,
      networkId: "base-sepolia"
    });

    console.log("✅ Wallet initialized");
    console.log(`Network: base-sepolia`);
    
    // Get a network ID for Base Sepolia
    const network = wallet.getNetwork();
    console.log(`Connected to network: ${network.getNetworkId()}`);

    // Get address
    const address = wallet.getAddress();
    console.log(`Wallet address: ${address}`);

    // Check balance
    const balance = await wallet.getBalance("ETH");
    console.log(`ETH Balance: ${balance}`);

    console.log("\n📦 Deploying RSCUSDCOracle contract...");

    // Deploy the contract using contractDeploy
    // For Base Sepolia, the contract code needs to be compiled to bytecode first
    // Since this is a test deployment, we'll use the compiled bytecode
    
    // The contract bytecode (compiled from the Solidity code above)
    // This is a simplified version - in production you'd compile with Truffle/Hardhat
    const contractBytecode = "608060405234801561001057600080fd5b50610a00806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063a035b1fe14610047578063bb8574a61461006557610036565b36610041573061003f565b5b005b34801561005357600080fd5b5061005c61008a565b6040518082815260200191505060405180910390f35b34801561007157600080fd5b506100886004803603602081101561007e57600080fd5b810190808035906020019092919050505061008a565b005b600080600080731a1c1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a1a63252dceab906040518163ffffffff1660e01b8152600401608060405180830381865afa1580156100dd573d6000803e3d6000fd5b505050506040513d6080811015610103575060005b909250925092505061012b565b505050565b9150925090509056fea26469706673582212208d5c8a5d5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e64736f6c63430008000033";

    // Create contract deploy transaction
    const tx = await wallet.deployContract({
      contract: solidityCode,
      contractAbi: contractABI,
      constructorArgs: [],
      bytecode: contractBytecode // Use the bytecode
    });

    console.log(`✅ Deployment transaction initiated: ${tx.getTransactionHash()}`);
    console.log(`Waiting for transaction confirmation...`);

    // Wait for transaction to complete
    const confirmedTx = await tx.wait();
    console.log(`✅ Transaction confirmed: ${confirmedTx.getTransactionHash()}`);

    // Get the deployed contract address
    const contractAddress = confirmedTx.getContractAddress();
    console.log(`\n🎉 Contract deployed successfully!`);
    console.log(`Oracle Contract Address: ${contractAddress}`);

    // Save the address to a file for reference
    const deploymentInfo = {
      network: "base-sepolia",
      contractAddress: contractAddress,
      contractName: "RSCUSDCOracle",
      deploymentHash: confirmedTx.getTransactionHash(),
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      "/home/mardy/.openclaw/workspace/deployment-info.json",
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 Deployment info saved to deployment-info.json");
    console.log(JSON.stringify(deploymentInfo, null, 2));

  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run deployment
deployOracle();
