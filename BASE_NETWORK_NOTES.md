# Base Network - Deep Dive Notes

## Core Architecture
- **Type**: OP Stack L2 (Optimistic Rollup)
- **Parent**: Ethereum Mainnet
- **Security**: Batches submitted to Ethereum L1
- **Block time**: 2 seconds
- **Consensus**: Sequencer-based (permissioned for now)

## Fees (Most Important for DApp Economics)

### Two-Part Fee Model
1. **L2 Execution Fee** (what runs on Base)
   - EIP-1559 compliant
   - Elasticity multiplier: 6x
   - Base fee denominator: 125
   - Max fee change per block: 4%
   - **Minimum base fee: 0.002 gwei** (floor during low activity)

2. **L1 Security Fee** (cost to post to Ethereum)
   - Usually the majority of total cost
   - Varies with Ethereum gas prices
   - Often higher during Ethereum congestion
   - **Optimization**: Submit during low L1 gas (weekends)

### Cost Examples
- Simple transfer: <$0.01
- Oracle call: ~$0.001
- Market interaction: $0.01-0.05 depending on complexity
- Market creation: $0.10-0.50

## Key Contracts (For Reference)
- **WETH9**: `0x4200000000000000000000000000000000000006`
- **L2Bridge**: `0x4200000000000000000000000000000000000010`
- **GasPriceOracle**: `0x420000000000000000000000000000000000000F`
- **L1Block**: `0x4200000000000000000000000000000000000015`

## Development Stack

### Recommended Tools
- **Remix**: Web-based IDE (for simple contracts)
- **Foundry**: Full-featured framework (forge + cast)
- **Ethers.js**: JS library for interaction
- **Hardhat**: TypeScript framework

### Deployment Process
1. Write Solidity contract (EVM-compatible)
2. Compile (Solidity ^0.8.0)
3. Connect to Base RPC (`https://mainnet.base.org`)
4. Deploy with private key
5. Verify on BaseScan (`https://basescan.org`)

## Network Details

### Mainnet
- RPC: `https://mainnet.base.org`
- Chain ID: 8453
- Currency: ETH (no native token swap)
- Explorer: `https://basescan.org`

### Testnet (Sepolia)
- RPC: `https://sepolia.base.org`
- Chain ID: 84532
- Faucet: Free testnet ETH available
- Explorer: `https://sepolia.basescan.org`

## Why Base for RSC/USDC Market

### Advantages
1. **Cost-effective**: Oracle calls and market interactions under $0.01
2. **Fast settlement**: 2-second blocks mean quick price updates
3. **High throughput**: Can support many users/transactions
4. **EVM-native**: All existing Solidity tools work
5. **Liquidity**: Aerodrome already has RSC/USDC pool

### Use Case Fit
- **Lending markets** work great on OP Stack (multiple trades/blocks)
- **Oracles** are affordable to call frequently
- **Dashboard** can refresh in real-time without breaking UX
- **Users** get affordable liquidation protection

## Building Strategy for Our Market

### Oracle Design
- Reads from Aerodrome pool: `0x6cCa90E732942D73c276F73b805cA2948f6B3018`
- Returns price with 18 decimals (Morpho standard)
- Gas cost: ~30-40k per call (cheap on Base)
- Can be called every block if needed

### Dashboard Strategy
- Real-time price feeds (affordable to refresh every 2-5 seconds)
- Show gas costs transparently
- Display L2 vs L1 fee breakdown
- Alert users during high Ethereum gas periods

### Market Parameters
- **LLTV**: 86% (conservative, good for stability)
- **IRM**: Morpho's default (standard across protocols)
- **Collateral**: RSC (already has Base liquidity)
- **Loan**: USDC (stable, deep liquidity)

## Next Phase: Dashboard Integration

The dashboard needs to:
1. Query oracle price in real-time
2. Show current market state (supply, borrow, utilization)
3. Display estimated gas costs for operations
4. Provide deposit/borrow/withdraw interfaces
5. Show liquidation levels and health factors

All of this is highly affordable on Base due to low fees.

