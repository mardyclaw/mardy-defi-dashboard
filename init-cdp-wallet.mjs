import { Coinbase, Wallet } from '@coinbase/coinbase-sdk';

const keyId = "08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b";
const keySecret = "LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==";

Coinbase.configure({
  apiKeyName: keyId,
  privateKey: keySecret
});

try {
  const wallet = await Wallet.create({ networkId: "base-sepolia" });
  console.log("Wallet created!");
  console.log("Address:", wallet.getDefaultAddress().toString());
  console.log("Wallet ID:", wallet.getId());
  
  // Save wallet seed
  const seed = wallet.exportSeed();
  console.log("Seed:", seed);
} catch (e) {
  console.error("Error:", e.message);
}
