#!/usr/bin/env node

const { ethers } = require("ethers");
const solc = require("solc");
const fs = require("fs");
const crypto = require("crypto");

// Configuration
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";
const BASE_SEPOLIA_CHAIN_ID = 84532;

// CDP Credentials
const CDP_KEY_ID = "08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b";
const CDP_KEY_SECRET = "LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==";

// Read contract source
const contractPath = "/home/mardy/.openclaw/workspace/RSCUSDCOracle.sol";
const contractSource = fs.readFileSync(contractPath, "utf-8");

function compileContract(source) {
  console.log("📝 Compiling contract...");
  
  const input = {
    language: "Solidity",
    sources: {
      "RSCUSDCOracle.sol": {
        content: source
      }
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "evm.deployedBytecode"]
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    output.errors.forEach(error => {
      console.error(error.message);
    });
    if (output.errors.some(e => e.severity === "error")) {
      throw new Error("Compilation failed");
    }
  }

  const contract = output.contracts["RSCUSDCOracle.sol"]["RSCUSDCOracle"];
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
    deployedBytecode: contract.evm.deployedBytecode.object
  };
}

async function deployWithEthers(compiledContract) {
  try {
    console.log("\n🚀 Starting deployment to Base Sepolia...\n");

    // Create provider (ethers v6)
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    console.log("✅ Connected to Base Sepolia RPC");

    // Verify network
    const network = await provider.getNetwork();
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);

    // Try to create signer from the keySecret
    // First, try as raw hex private key
    let signer;
    let wallet;
    
    try {
      // Try as hex-encoded private key
      let privateKey = CDP_KEY_SECRET;
      if (!privateKey.startsWith("0x")) {
        // Try decoding from base64
        const decoded = Buffer.from(CDP_KEY_SECRET, "base64").toString("hex");
        if (decoded.length >= 64) {
          privateKey = "0x" + decoded.slice(0, 64);
        }
      }
      
      wallet = new ethers.Wallet(privateKey, provider);
      signer = wallet;
      console.log(`✅ Signer initialized`);
    } catch (e) {
      console.error("Could not create signer from credentials");
      console.error(e.message);
      throw e;
    }

    const signerAddress = await signer.getAddress();
    console.log(`Wallet address: ${signerAddress}`);

    // Check balance
    const balance = await provider.getBalance(signerAddress);
    const balanceETH = ethers.formatEther(balance);
    console.log(`ETH Balance: ${balanceETH} ETH`);

    if (parseFloat(balanceETH) === 0) {
      console.log("\n⚠️  ZERO BALANCE - Cannot deploy!");
      console.log("Please fund wallet with testnet ETH:");
      console.log("https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet");
      process.exit(1);
    }

    console.log("\n📦 Deploying RSCUSDCOracle...\n");

    // Create contract factory
    const factory = new ethers.ContractFactory(
      compiledContract.abi,
      "0x" + compiledContract.bytecode,
      signer
    );

    // Deploy
    console.log("⏳ Sending deployment transaction...");
    const contract = await factory.deploy();
    
    const deployTx = contract.deployTransaction;
    console.log(`📝 Transaction hash: ${deployTx.hash}`);
    console.log(`⏳ Waiting for confirmation (this may take a minute)...`);

    // Wait for deployment
    const deploymentReceipt = await contract.deployed();
    
    // Get receipt details
    const receipt = await provider.getTransactionReceipt(deployTx.hash);
    
    console.log(`\n✅ Deployment successful!\n`);
    console.log(`═══════════════════════════════════════════════════`);
    console.log(`🎉 ORACLE CONTRACT DEPLOYED`);
    console.log(`═══════════════════════════════════════════════════`);
    console.log(`\nOracle Address:    ${contract.address}`);
    console.log(`Transaction Hash:  ${deployTx.hash}`);
    console.log(`Block Number:      ${receipt.blockNumber}`);
    console.log(`Gas Used:          ${receipt.gasUsed.toString()}`);
    console.log(`Gas Price:         ${ethers.formatUnits(receipt.effectiveGasPrice, "gwei")} gwei`);
    console.log(`\nBaseScan Link:`);
    console.log(`https://sepolia.basescan.org/address/${contract.address}`);
    console.log(`═══════════════════════════════════════════════════\n`);

    // Verify contract is callable
    try {
      const code = await provider.getCode(contract.address);
      if (code !== "0x") {
        console.log("✅ Contract code verified on-chain\n");
      }
    } catch (e) {
      console.log("⚠️  Could not verify contract\n");
    }

    // Save deployment info
    const deploymentInfo = {
      network: "base-sepolia",
      chainId: BASE_SEPOLIA_CHAIN_ID,
      contractAddress: contract.address,
      contractName: "RSCUSDCOracle",
      transactionHash: deployTx.hash,
      blockNumber: receipt.blockNumber,
      deployer: signerAddress,
      timestamp: new Date().toISOString(),
      basescan: `https://sepolia.basescan.org/address/${contract.address}`
    };

    fs.writeFileSync(
      "/home/mardy/.openclaw/workspace/deployment-info.json",
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log(`📄 Deployment info saved to deployment-info.json`);
    return contract.address;

  } catch (error) {
    console.error("\n❌ Deployment failed");
    console.error("Error:", error.message);
    if (error.code) console.error("Code:", error.code);
    process.exit(1);
  }
}

async function main() {
  try {
    console.log("🔧 RSCUSDCOracle Deployment Script");
    console.log("═══════════════════════════════════════════════════\n");

    // Compile contract
    const compiled = compileContract(contractSource);
    console.log(`✅ Compilation successful`);
    console.log(`   ABI entries: ${compiled.abi.length}`);
    console.log(`   Bytecode size: ${compiled.bytecode.length / 2} bytes\n`);

    // Deploy
    const contractAddress = await deployWithEthers(compiled);

    console.log("\n✨ Oracle deployment complete!");
    console.log(`📋 Address: ${contractAddress}`);
    process.exit(0);

  } catch (error) {
    console.error("Fatal error:", error.message);
    process.exit(1);
  }
}

main();
