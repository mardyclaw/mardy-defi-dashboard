// Oracle Deployment Script for Base Mainnet
// Usage: npx hardhat run deploy-oracle.js --network base

const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying RSC/USDC Oracle to Base Mainnet...\n");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log(`📍 Deploying from: ${deployer.address}\n`);

  // Deploy oracle
  const RSCUSDCOracle = await ethers.getContractFactory("RSCUSDCOracle");
  const oracle = await RSCUSDCOracle.deploy();
  await oracle.deployed();

  console.log(`✅ Oracle deployed to: ${oracle.address}\n`);

  // Verify price function
  console.log("Testing oracle price function...");
  try {
    const price = await oracle.price();
    const priceNum = ethers.utils.formatEther(price);
    console.log(`✅ Current RSC/USDC price: $${priceNum}\n`);
  } catch (e) {
    console.log(`⚠️  Price query failed: ${e.message}\n`);
  }

  // Save oracle address
  const fs = require("fs");
  const config = {
    oracle_address: oracle.address,
    deployed_at: new Date().toISOString(),
    network: "base-mainnet",
    chain_id: 8453,
  };

  fs.writeFileSync(
    "/home/mardy/.openclaw/workspace/oracle-deployment.json",
    JSON.stringify(config, null, 2)
  );

  console.log("📝 Oracle address saved to oracle-deployment.json\n");
  console.log("⚡ Next: Create Morpho market with this oracle address:");
  console.log(`   Oracle: ${oracle.address}`);
  console.log(`   LLTV: 860000000000000000 (86%)`);
  console.log(`   IRM: 0x870aC11D48B15DB9a138Cf899d20F33EaC996490`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
