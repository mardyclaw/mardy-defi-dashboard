# CRITICAL_STATE.md — DO NOT LOSE THIS

This file contains deployment credentials and status. **Read this FIRST at session start.**

## 🔐 Wallet Credentials (Base Mainnet)

```
CDP_KEY_ID: 08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b
CDP_KEY_SECRET: LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==
Network: Base Mainnet (Chain ID 8453)
RPC: https://mainnet.base.org
```

## ✅ Live Contracts (Base Mainnet)

| Component | Address | Status |
|-----------|---------|--------|
| Oracle | `0x82b6E8081447e3D0625c278f5d9E4C7d4B2c6Dce` | ✅ LIVE |
| Market ID | `0xe2aa3e365ff9d8dd3c9b38c0b1da0983b82473b73dfd99935449ef1a76b5664a` | ✅ LIVE |
| USDC (Loan) | `0x833589fcd6EdB6E08f4c7c32d4f71B1566469c3d` | ✅ Standard |
| RSC (Collateral) | `0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1` | ✅ Standard |
| IRM | `0xA5FCD42877aBf0b4A8d0236C11986b8B8505B008` | ✅ Morpho Default |
| Morpho Blue | `0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB` | ✅ Standard |

## 🌐 Dashboard Status

| Item | URL | Status |
|------|-----|--------|
| Frontend | https://mardy-defi-dashboard.vercel.app/ | ✅ LIVE |
| GitHub Repo | https://github.com/mardyclaw/mardy-defi-dashboard | ✅ LIVE |
| Auto-Deploy | Vercel (git push → live) | ✅ ACTIVE |

## 📋 Next Tasks

- [ ] Update dashboard with live oracle address
- [ ] Update dashboard with live market ID
- [ ] Wire market monitor to real Morpho data
- [ ] Test supply/borrow on live market
- [ ] Verify oracle price updates

## 🚨 If You Wake Up Lost

1. Read this file FIRST
2. Check `/home/mardy/.openclaw/workspace/market-config.json` for current state
3. All addresses above are LIVE on Base Mainnet
4. Don't redeploy—update dashboard with current addresses
5. Questions? Check MEMORY.md for context

---

**Last Updated:** 2026-02-15 07:30
**Verified:** Yes, oracle and market confirmed live on Base Mainnet
