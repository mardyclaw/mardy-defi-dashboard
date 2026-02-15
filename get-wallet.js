const crypto = require('crypto');

// CDP credentials
const keyId = "08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b";
const keySecret = "LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==";

// Build JWT
const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: keyId, nonce: Date.now() })).toString('base64url');
const payload = Buffer.from(JSON.stringify({ 
  iss: 'cdp_service_sk',
  nbf: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 120,
  sub: keyId
})).toString('base64url');

const signatureInput = `${header}.${payload}`;
const signature = crypto
  .sign('sha256', Buffer.from(signatureInput), {
    key: `-----BEGIN EC PRIVATE KEY-----\n${keySecret.match(/.{1,64}/g).join('\n')}\n-----END EC PRIVATE KEY-----`,
    format: 'pem'
  })
  .toString('base64url');

const jwt = `${signatureInput}.${signature}`;
console.log('JWT:', jwt);
