const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ethers } = require('ethers');
const { Coinbase } = require('@coinbase/coinbase-sdk');

// CDP Wallet credentials
const CDP_KEY_ID = '08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b';
const CDP_KEY_SECRET = 'LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==';

// Contract bytecode (compiled)
const CONTRACT_ABI = [{"type":"function","name":"AERODROME_POOL","inputs":[],"outputs":[{"name":"","type":"address","internalType":"contract IAerodromePair"}],"stateMutability":"view"},{"type":"function","name":"RSC","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"RSC_DECIMALS","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"SCALE","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"USDC","inputs":[],"outputs":[{"name":"","type":"address","internalType":"address"}],"stateMutability":"view"},{"type":"function","name":"USDC_DECIMALS","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"price","inputs":[{"name":"","type":"bytes","internalType":"bytes"}],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"},{"type":"function","name":"price","inputs":[],"outputs":[{"name":"","type":"uint256","internalType":"uint256"}],"stateMutability":"view"}];

const CONTRACT_BYTECODE = '0x6080604052348015600e575f5ffd5b506109858061001c5f395ff3fe608060405234801561000f575f5ffd5b5060043610610086575f3560e01c8063ad4e5c5a11610059578063ad4e5c5a14610114578063bbc0951a14610132578063c1419def14610150578063eced55261461016e57610086565b80634611fb0e1461008a578063484e886e146100a857806389a30271146100d8578063a035b1fe146100f6575b5f5ffd5b61009261018c565b60405161009f9190610445565b60405180910390f35b6100c260048036038101906100bd91906104c7565b6101a4565b6040516100cf919061052a565b60405180910390f35b6100e06101b5565b6040516100ed9190610445565b60405180910390f35b6100fe6101cd565b60405161010b919061052a565b60405180910390f35b61011c6103d1565b604051610129919061052a565b60405180910390f35b61013a6103d6565b604051610147919061059e565b60405180910390f35b6101586103ee565b604051610165919061052a565b60405180910390f35b6101766103f3565b604051610183919061052a565b60405180910390f35b73fbb75a59193a3525a8825bebe7d4b56899e2f7e181565b5f6101ad6101cd565b905092915050565b73833589fcd6edb6e08f4c7c32d4f71b1566469c3d81565b5f5f5f736cca90e732942d73c276f73b805ca2948f6b301873ffffffffffffffffffffffffffffffffffffffff16630902f1ac6040518163ffffffff1660e01b8152600401606060405180830381865afa15801561022d573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906102519190610633565b50915091505f736cca90e732942d73c276f73b805ca2948f6b301873ffffffffffffffffffffffffffffffffffffffff16630dfe16816040518163ffffffff1660e01b8152600401602060405180830381865afa1580156102b4573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906102d891906106ad565b90505f5f73fbb75a59193a3525a8825bebe7d4b56899e2f7e173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff160361034e57846dffffffffffffffffffffffffffff169150836dffffffffffffffffffffffffffff169050610375565b836dffffffffffffffffffffffffffff169150846dffffffffffffffffffffffffffff1690505b5f826012600a6103859190610834565b83610390919061087e565b61039a91906108ec565b90505f600660126103ab919061091c565b600a6103b79190610834565b826103c2919061087e565b90508097505050505050505090565b601281565b736cca90e732942d73c276f73b805ca2948f6b301881565b600681565b6ec097ce7bc90715b34b9f100000000081565b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61042f82610406565b9050919050565b61043f81610425565b82525050565b5f6020820190506104585f830184610436565b92915050565b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f5ffd5b5f5f83601f84011261048757610486610466565b5b8235905067ffffffffffffffff8111156104a4576104a361046a565b5b6020830191508360018202830111156104c0576104bf61046e565b5b9250929050565b5f5f602083850312156104dd576104dc61045e565b5b5f83013567ffffffffffffffff8111156104fa576104f9610462565b5b61050685828601610472565b92509250509250929050565b5f819050919050565b61052481610512565b82525050565b5f60208201905061053d5f83018461051b565b92915050565b5f819050919050565b5f61056661056161055c84610406565b610543565b610406565b9050919050565b5f6105778261054c565b9050919050565b5f6105888261056d565b9050919050565b6105988161057e565b82525050565b5f6020820190506105b15f83018461058f565b92915050565b5f6dffffffffffffffffffffffffffff82169050919050565b6105d9816105b7565b81146105e3575f5ffd5b50565b5f815190506105f4816105d0565b92915050565b5f63ffffffff82169050919050565b610612816105fa565b811461061c575f5ffd5b50565b5f8151905061062d81610609565b92915050565b5f5f5f6060848603121561064a5761064961045e565b5b5f610657868287016105e6565b9350506020610668868287016105e6565b92505060406106798682870161061f565b9150509250925092565b61068c81610425565b8114610696575f5ffd5b50565b5f815190506106a781610683565b92915050565b5f602082840312156106c2576106c161045e565b5b5f6106cf84828501610699565b91505092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f8160011c9050919050565b5f5f8291508390505b600185111561075a57808604811115610736576107356106d8565b5b60018516156107455780820291505b808102905061075385610705565b945061071a565b94509492505050565b5f82610772576001905061082d565b8161077f575f905061082d565b8160018114610795576002811461079f576107ce565b600191505061082d565b60ff8411156107b1576107b06106d8565b5b8360020a9150848211156107c8576107c76106d8565b5b5061082d565b5060208310610133831016604e8410600b84101617156108035782820a9050838111156107fe576107fd6106d8565b5b61082d565b6108108484846001610711565b92509050818404811115610827576108266106d8565b5b81810290505b9392505050565b5f61083e82610512565b915061084983610512565b92506108767fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8484610763565b905092915050565b5f61088882610512565b915061089383610512565b92508282026108a181610512565b915082820484148315176108b8576108b76106d8565b5b5092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f6108f682610512565b915061090183610512565b925082610911576109106108bf565b5b828204905092915050565b5f61092682610512565b915061093183610512565b9250828203905081811115610949576109486106d8565b5b9291505056fea26469706673582212201c96bf68b51a8aac89d70ef0173757bc31379d0fded62f7ae0eb23ee3594b33d64736f6c634300081e0033';

async function deployWithCDP() {
  try {
    console.log('Configuring Coinbase SDK...');
    
    // Configure SDK
    Coinbase.configure({
      apiKeyName: CDP_KEY_ID,
      privateKey: CDP_KEY_SECRET,
    });
    
    console.log('✓ SDK configured');
    console.log('\nFetching/creating wallet...');
    
    // Get default wallet (or create one)
    let wallet;
    try {
      const wallets = await Coinbase.listWallets();
      if (wallets.data && wallets.data.length > 0) {
        wallet = wallets.data[0];
        console.log('✓ Found existing wallet:', wallet.id);
      } else {
        throw new Error('No wallet found, creating new one');
      }
    } catch (e) {
      console.log('Creating new wallet...');
      wallet = await Coinbase.createWallet();
      console.log('✓ Created wallet:', wallet.id);
    }
    
    // Get addresses
    const addresses = await wallet.getAddresses();
    let address;
    
    if (addresses.data && addresses.data.length > 0) {
      address = addresses.data[0];
      console.log('✓ Using address:', address.address);
    } else {
      console.log('Creating new address...');
      address = await wallet.createAddress();
      console.log('✓ Created address:', address.address);
    }
    
    const walletAddress = address.address;
    
    // Request faucet funds
    console.log('\nRequesting faucet funds for Base Sepolia...');
    try {
      const faucetTx = await address.faucet();
      console.log('✓ Faucet transaction:', faucetTx.id);
      console.log('  Status:', faucetTx.status);
      
      // Wait a bit for the transaction to process
      console.log('Waiting for faucet transaction to process...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (e) {
      console.error('Faucet error:', e.message);
      console.log('Trying alternative faucet...');
    }
    
    // Check balance
    const balances = await address.getBalance({ assetId: 'eth' });
    console.log('\nAccount balance:', balances.display, 'ETH');
    
    if (parseFloat(balances.amount) === 0) {
      console.error('\n❌ No balance after faucet. Account may need manual funding.');
      console.error('Manual funding URL: https://www.alchemy.com/faucets/base-sepolia');
      console.error('Address to fund:', walletAddress);
      process.exit(1);
    }
    
    // Deploy contract
    console.log('\n' + '='.repeat(60));
    console.log('Deploying RSCUSDCOracle to Base Sepolia...');
    console.log('='.repeat(60));
    
    // Use ethers.js to deploy
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    
    // Derive private key for signing
    const hash = crypto.createHash('sha256')
      .update(CDP_KEY_SECRET + CDP_KEY_ID)
      .digest('hex');
    const privateKey = '0x' + hash;
    
    const signer = new ethers.Wallet(privateKey, provider);
    
    // Create contract factory
    const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, signer);
    
    console.log('Sending deployment transaction...');
    const contract = await factory.deploy({
      gasLimit: ethers.toBeHex(2000000),
    });
    
    console.log('Transaction hash:', contract.deploymentTransaction().hash);
    console.log('Waiting for confirmation (this may take a minute)...');
    
    const deployedContract = await contract.waitForDeployment();
    const contractAddress = await deployedContract.getAddress();
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ CONTRACT DEPLOYED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('Contract Address:', contractAddress);
    console.log('Network: Base Sepolia');
    console.log('Block Explorer: https://sepolia.basescan.org/address/' + contractAddress);
    
    // Save address to file
    fs.writeFileSync(
      path.join(__dirname, 'ORACLE_CONTRACT_ADDRESS.txt'),
      contractAddress
    );
    
    return contractAddress;
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Run
deployWithCDP().then(addr => {
  console.log('\n🎉 Deployment complete!');
  console.log('Oracle address:', addr);
  process.exit(0);
});
