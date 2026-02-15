# Emergency Oracle Deployment - Remix Path

If automated deployment times out, deploy manually via Remix (5 minutes):

## Step-by-Step

1. **Open Remix IDE**
   - Go to: https://remix.ethereum.org

2. **Create File**
   - New file: `RSCUSDCOracle.sol`
   - Copy entire contents from `/home/mardy/.openclaw/workspace/RSCUSDCOracle.sol`

3. **Compile**
   - Go to Solidity Compiler (left sidebar)
   - Select Compiler Version: `0.8.0`
   - Click "Compile RSCUSDCOracle.sol"
   - Should show: ✓ Compilation successful

4. **Deploy**
   - Go to Deploy & Run Transactions (left sidebar)
   - Environment: Select "Injected Provider - MetaMask"
   - Network: Make sure MetaMask is set to **Base Sepolia**
   - Contract: Select `RSCUSDCOracle`
   - Click **Deploy**
   - Sign transaction in MetaMask

5. **Copy Address**
   - Once deployed, copy the contract address from the Remix console
   - Format: `0x...` (should be 42 characters)

## Then Execute Market Creation

```bash
node create-morpho-market.js <ORACLE_ADDRESS>
```

## Fund Wallet if Needed

MetaMask address needs Base Sepolia testnet ETH:
- Faucet: https://www.alchemy.com/faucets/base-sepolia
- Or: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

---

Expected time: ~5 minutes total
