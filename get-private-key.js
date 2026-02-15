const crypto = require('crypto');

// CDP Wallet credentials
const CDP_KEY_ID = '08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b';
const CDP_KEY_SECRET = 'LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==';

// Derive a private key from CDP credentials
function derivePrivateKeyFromCDP() {
  const hash = crypto.createHash('sha256')
    .update(CDP_KEY_SECRET + CDP_KEY_ID)
    .digest('hex');
  
  return hash;
}

const pk = derivePrivateKeyFromCDP();
console.log(pk);
