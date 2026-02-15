# RSC/USDC Oracle Deployment — Ready to Go

**Status:** ✅ Contract written and tested. Ready for Remix deployment to Base Mainnet.

---

## Quick Deploy (5 minutes)

### Step 1: Open Remix
Go to **[remix.ethereum.org](https://remix.ethereum.org)**

### Step 2: Create Contract File
1. In the File Explorer (left sidebar), click the **New File** button
2. Name it: `RSCUSDCOracle.sol`
3. Copy the entire contract from `/home/mardy/.openclaw/workspace/RSCUSDCOracle.sol`
4. Paste into Remix

### Step 3: Compile
1. Click **Solidity Compiler** tab (left sidebar)
2. Select compiler version: **0.8.0** or newer (dropdown at top)
3. Click **Compile RSCUSDCOracle.sol**
4. ✅ Should show green checkmark (no errors)

### Step 4: Connect Wallet & Deploy
1. Click **Deploy & Run Transactions** tab (left sidebar)
2. **Environment:** Select **Injected Provider** (MetaMask window will pop up)
3. **Network:** MetaMask should auto-switch to **Base Mainnet** (if not, add it manually)
   - Network Name: `Base`
   - RPC URL: `https://mainnet.base.org`
   - Chain ID: `8453`
4. **Account:** Make sure you're on the account you want to use
5. **Contract:** Confirm `RSCUSDCOracle` is selected in the dropdown
6. **Constructor Args:** Leave empty (oracle has no constructor params)
7. Click **Deploy**
8. Confirm transaction in MetaMask (~200k gas, expect $0.05–0.20 depending on Base gas)

### Step 5: Save Oracle Address
Once deployed (transaction succeeds):
1. In Remix's **Deployed Contracts** section, you'll see `RSCUSDCOracle` with an address like `0x...`
2. **COPY THIS ADDRESS**
3. Update `ORACLE_ADDRESS` in the next section (for market creation)

---

## Verify Oracle Works

Before creating the market, test that the oracle returns a valid price:

1. In Remix's **Deployed Contracts**, expand `RSCUSDCOracle`
2. Click `price` (the view function)
3. You should see a large number (e.g., `2500000000000000000` = $2.50)
4. ✅ Oracle is working!

---

## Next: Create Morpho Market

Once you have the oracle address, you'll call Morpho Blue's `createMarket()` function.

**Market Parameters:**
```solidity
{
    loanToken: 0x833589fCD6eDb6E08f4c7C32D4f71B1566469c3d,  // USDC on Base
    collateralToken: 0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1,  // RSC
    oracle: 0xYOUR_ORACLE_ADDRESS,  // From Step 5 above
    irm: 0x870aC11D48B15DB9a138Cf899d20F33EaC996490,  // Morpho's default IRM
    lltv: 860000000000000000  // 86% LTV
}
```

**How to Create Market:**
1. Go to [Morpho Blue app](https://morpho.blue) (or use Remix directly)
2. Call `createMarket()` with the params above
3. Confirm transaction
4. Once mined, the market is live! ✅

---

## Oracle Behavior

- **Price Source:** Aerodrome RSC/USDC pool (0x6cCa90E732942D73c276F73b805cA2948f6B3018)
- **Update Frequency:** Real-time (reads pool reserves on every call)
- **Decimal Precision:** 18 decimals (Morpho standard)
- **Gas Cost:** ~5-10k gas per price() call (~$0.0001–0.0005)

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Network mismatch" in MetaMask | Add Base Mainnet manually (chainid 8453) |
| Compile error | Check Solidity version is 0.8.0+; click Compile again |
| Deploy fails | Ensure you have ETH on Base for gas (not USDC) |
| Oracle returns 0 | Check Aerodrome pool has liquidity; oracle reads reserves |
| Market creation fails | Verify oracle address is correct; ensure USDC/RSC balances exist |

---

## Success Checklist

- [ ] Oracle deployed to Base Mainnet
- [ ] Oracle address saved
- [ ] `price()` returns valid number (>1000000000000000000)
- [ ] Morpho market created with oracle address
- [ ] Dashboard updated with market address
- [ ] Can supply USDC, borrow RSC (or vice versa)

---

## Timeline

- **Deploy Oracle:** Now (5 min)
- **Verify Oracle:** Immediate (1 min)
- **Create Market:** Immediate (5 min)
- **Full Live Market:** Within 10 min total ✨

