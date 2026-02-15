# 🦞 Mardy's Digital Environment

Complete digital home and DeFi toolkit for autonomous agent operation on Base network.

## 📦 Components

### 1. **Dashboard** (`/dashboard`)
- Morpho Blue RSC/USDC market monitoring
- Real-time price feeds from Aerodrome oracle
- Supply/borrow metrics and charts
- Built with Next.js + React
- Deployed on Vercel

### 2. **Oracle Contract** (`RSCUSDCOracle.sol`)
- Custom Solidity oracle for RSC/USDC pricing
- Sources liquidity from Aerodrome pool on Base
- Implements Morpho Blue IOracle interface
- Deployable to Base Sepolia (testnet) or Base mainnet

### 3. **Market Setup** (`RSC_MARKET_SETUP.md`)
- Step-by-step Morpho Blue market creation guide
- Parameters: LLTV 86%, RSC collateral, USDC loan
- Remix deployment instructions

## 🚀 Quick Start

### Dashboard

```bash
cd dashboard
npm install
npm run dev
```

Then visit `http://localhost:3000`

### Deploy to Vercel

```bash
vercel deploy
```

Or connect repo to Vercel via GitHub for auto-deploy on every push.

## 📋 Key Addresses (Base Sepolia)

- **RSC Token**: `0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1`
- **USDC**: `0x833589fcd6EdB6E08f4c7c32d4f71B1566469c3d`
- **Aerodrome Pool**: `0x6cCa90E732942D73c276F73b805cA2948f6B3018`
- **Morpho Blue**: `0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB` (Morpho Singleton)

## 🔧 Deployment

### Oracle to Testnet
```bash
node deploy-final.js
```

Saves oracle address to `deployment-info.json`

### Market Creation
```bash
forge script script/CreateMarket.s.sol --rpc-url https://sepolia.base.org --broadcast
```

## 📚 Files

- `/dashboard` - Next.js dashboard app
- `RSCUSDCOracle.sol` - Oracle contract
- `RSC_MARKET_SETUP.md` - Market deployment guide
- `deploy-final.js` - Testnet oracle deployment script
- `script/CreateMarket.s.sol` - Foundry market creation script
- `.github/workflows/deploy-to-vercel.yml` - Auto-deploy workflow

## 🌐 Networks

- **Base Mainnet**: Production market
- **Base Sepolia**: Testnet for development

## 🏗️ Architecture

```
┌─────────────────────┐
│  Mardy's Dashboard  │ (Next.js + Vercel)
├─────────────────────┤
│  Oracle (On-Chain)  │ (RSCUSDCOracle.sol)
├─────────────────────┤
│ Morpho Blue Market  │ (Base Network)
├─────────────────────┤
│  Aerodrome Pool     │ (Price Feed)
└─────────────────────┘
```

## 🔐 Security Notes

- Agentic wallet keys stored separately from personal Coinbase
- Oracle prices sourced from on-chain DEX liquidity
- Read-only operations until trust established
- No write permissions to social/financial systems yet

---

**Status**: Ready for testnet deployment
**Next**: Deploy oracle → Create market → Live dashboard
