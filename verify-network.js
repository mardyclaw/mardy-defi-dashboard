const { ethers } = require('ethers');

async function check() {
  const networks = {
    'Base Sepolia': 'https://sepolia.base.org',
    'Ethereum Sepolia': 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    'Ethereum Mainnet': 'https://eth.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
  };

  const address = '0x7F85E832Ae9dafA940F9AC0e42E48F1C3F3247DA';

  for (const [name, rpc] of Object.entries(networks)) {
    try {
      const provider = new ethers.JsonRpcProvider(rpc);
      const balance = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balance);
      console.log(`${name}: ${balanceEth} ETH`);
    } catch (e) {
      console.log(`${name}: Error`);
    }
  }
}

check();
