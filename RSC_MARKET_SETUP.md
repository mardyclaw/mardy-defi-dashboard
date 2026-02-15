# RSC/USDC Morpho Market Setup Guide

## Phase 1: Deploy Oracle (Remix)

### Step 1: Aerodrome Pool Address (Already Configured!)
The RSC/USDC Aerodrome pool is already set in the contract:
```
Pool: 0x6cCa90E732942D73c276F73b805cA2948f6B3018
```
This provides real-time liquidity data for accurate RSC/USDC pricing.

### Step 2: Deploy via Remix
1. Go to remix.ethereum.org
2. Create new file: `RSCUSDCOracle.sol`
3. Paste the contract code
4. Compile (Solidity ^0.8.0)
5. **Network:** Base Mainnet
6. Deploy with no constructor arguments
7. **SAVE THE ORACLE ADDRESS**

---

## Phase 2: Create Morpho Market

Once oracle is deployed, you need to call:

```solidity
ImorphoBlue.createMarket(
    MorphoBlueLib.MarketParams({
        loanToken: 0x833589fCD6eDb6E08f4c7C32D4f71b1566469c3d, // USDC on Base
        collateralToken: 0xfbb75a59193a3525a8825bebe7d4b56899e2f7e1, // RSC
        oracle: 0xYOUR_ORACLE_ADDRESS, // From Step 1
        irm: 0x870aC11D48B15DB9a138Cf899d20F33EaC996490, // Morpho's default IRM on Base
        lltv: 860000000000000000 // 86% LTV (86e16)
    })
);
```

**Contract Address on Base:**
`0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` (Morpho Blue)

---

## Phase 3: Dashboard

Once market is created, we'll build a dashboard showing:
- RSC/USDC current price
- Market TVL
- Borrow rate (IRM)
- Your market details
- Real-time analytics

---

## Important Notes

1. **LLTV (Loan-to-Loan-Value):** Set to 86% - conservative but allows good utilization
2. **IRM:** Interest Rate Model - use Morpho's default
3. **Oracle:** Must implement `price()` function returning price with 18 decimals
4. **Gas:** Expect ~200k gas for oracle deploy, ~300k for market creation

---

## Verification

After deployment, verify:
- Oracle returns correct price: `oracle.price()` 
- Check it matches Aerodrome pool rates
- Market appears on Morpho app

---

## Base Network Optimization

**Why Base is Perfect for This:**
- **Low fees**: ~$0.001 per transaction (2-part fee structure)
- **Fast blocks**: 2-second block time
- **EVM-compatible**: Standard Solidity tools work
- **Scalability**: Can support many oracle calls without cost

**Fee Breakdown:**
- L2 execution fee: Variable (elasticity multiplier 6)
- L1 security fee: Usually higher (depends on Ethereum gas)
- **Pro tip**: Deploy during low Ethereum gas periods (weekends) to minimize L1 fees

**Network Details:**
- RPC: `https://mainnet.base.org`
- Chain ID: 8453
- Explorer: `https://basescan.org`
- Min base fee: 0.002 gwei (hard floor)

**For Your Dashboard:**
- Frequent price updates are affordable
- Can show real-time market activity
- Oracle price refreshes cost <$0.001 each
- Perfect for displaying up-to-date borrow/supply rates

