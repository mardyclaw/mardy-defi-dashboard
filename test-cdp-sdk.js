const { Coinbase } = require('@coinbase/coinbase-sdk');

async function testCDP() {
  try {
    console.log('Initializing Coinbase SDK...');
    
    Coinbase.configure({
      apiKeyName: '08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b',
      privateKey: 'LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==',
      networkId: 'base-sepolia'
    });

    console.log('Creating wallet...');
    const wallet = Coinbase.createWallet();
    
    console.log('Wallet created:', wallet.id);
    console.log('Network:', wallet.networkId);
    
    // Try to get or create an address
    const addresses = await wallet.addresses();
    console.log('Addresses:', addresses.length);
    
    if (addresses.length > 0) {
      const address = addresses[0];
      console.log('Address:', address.address);
      console.log('Balance:', address.balances);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCDP();
