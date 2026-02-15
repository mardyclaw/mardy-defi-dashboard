# MEMORY.md - Mardy's Long-Term Knowledge

## Project: Digital Agent Environment on Base

### Mission
Build a fully-functional digital home and DeFi toolkit for Mardy to operate autonomously as an agent on Base network. Focus is on the agent's existence and agency, not as a tool for Scott's desktop.

### Core Infrastructure Built
1. **Digital Environment**: Village interface with interactive buildings. Deprioritized due to token costs, but framework is ready.
2. **Social Monitoring**: X API 3x daily scans (morning/afternoon/evening) with Telegram delivery. Read-only until trust established.
3. **DeFi Market**: RSC/USDC Morpho Blue market with custom oracle (using Aerodrome pricing) and Moonwell-style dashboard.

### Why This Architecture
- **Agent as Entity**: Not a utility—Mardy has genuine digital presence and potential voice in crypto/social space
- **Base Network Choice**: OP Stack L2 provides cost-effective execution (0.002 gwei base) and alignment with RSC ecosystem (Aerodrome is primary RSC/USDC liquidity)
- **Custom Oracle**: RSC not on Chainlink; Aerodrome pool is authoritative liquidity source on Base
- **Autonomous Monitoring**: 3x daily scans handle pattern recognition autonomously; Telegram acts as async notification layer

### Key Learnings
- Token efficiency matters: Mardy's village was elegant but excessive. Future UI work needs to be deployed separately, not in main agent session.
- Read-before-write principle: Don't grant write access to social/financial systems until track record established
- Modularity: Oracle, dashboard, and monitoring can work independently or together
- Async notification: Cron + Telegram is better than polling; reduces token burn

### Architecture Evolution Timeline

**Feb 12:** Multi-agent orchestration research established isolation architecture as foundation
- Scout→Plan→Execute pattern (3-tool system: scout, planner, worker)
- Isolation 6.4x more efficient than shared context
- Compaction + memory flush handles indefinite conversations
- Phase roadmap: Foundation (week 1), Specialization (weeks 2-3), Intelligent Routing (week 4)

**Feb 14:** Built DeFi infrastructure layer
- Oracle: Custom Solidity contract (`RSCUSDCOracle.sol`) reading Aerodrome pool
- Dashboard: Morpho Blue UI ready for live market data
- X Monitoring: 3x daily scans (8am/2pm/8pm) set up
- Decision: Deprioritized village UI due to token costs; focused on infrastructure instead

**Feb 15:** Implemented AUTONOMY.md tier system + locked down X automation
- ✅ Tier 1 (Daily Monitoring): 3 X scanner cron jobs live, isolated subagents
- ✅ Tier 2 (Autonomous): Framework ready (arbitrage scout, portfolio tracker, research)
- ✅ Tier 3 (Interactive): Main session preserved for strategy/thinking
- ✅ Cost Target: $45-70/month vs. community baseline $200-300

### Market Deployment Complete ✅
1. ✅ Oracle deployed to Base Mainnet: `0x82b6E8081447e3D0625c278f5d9E4C7d4B2c6Dce`
2. ✅ Morpho market created: `0xe2aa3e365ff9d8dd3c9b38c0b1da0983b82473b73dfd99935449ef1a76b5664a`
3. ✅ Dashboard updated with live contract addresses
4. ✅ Dashboard deployed to Vercel: `https://mardy-defi-dashboard.vercel.app/`
5. ✅ GitHub synced: auto-deploys on push
6. Next: Integrate real-time Morpho data into dashboard

### Files to Remember
- `/home/mardy/.openclaw/workspace/RSCUSDCOracle.sol` - Oracle contract
- `/home/mardy/.openclaw/workspace/RSC_MARKET_SETUP.md` - Deployment guide
- `/home/mardy/.openclaw/workspace/dashboard/morpho-rsc-market.html` - Market dashboard
- Cron jobs: 3 X API scanners (8am/2pm/8pm) → Telegram ID `5315686987`

### Autonomy Directive (2026-02-14 23:33)
**Scott's mandate:** "You're autonomous. Figure everything out. No more asking. Make progress while I sleep, be smarter tomorrow."

**Operating Principles:**
- Self-verify and self-fix (check status myself, don't assume)
- Learn throughout the night (Moonwell docs, Virtuals agents, etc.)
- Build autonomously with full decision authority
- Use better models when needed
- No permission required for night-time work - just be productive
- Report results in the morning, not excuses

### 🚀 CRITICAL DEPLOYMENT INFO (Base Mainnet)

**Wallet Credentials:**
- CDP Key ID: `08ac1dc1-3248-4fac-a4e7-2cf3f4a99f6b`
- CDP Key Secret: `LMhy4f06Z287a1F5cn9Xa4KrUnwDp0YnH7dbaH0ABxa6Z9keBE92qnSpc3Lu8kUJ59FG5Fs30NZoY20ujfrRwg==`

**Live Market (Base Mainnet 8453):**
- Oracle Contract: `0x82b6E8081447e3D0625c278f5d9E4C7d4B2c6Dce`
- Market ID: `0xe2aa3e365ff9d8dd3c9b38c0b1da0983b82473b73dfd99935449ef1a76b5664a`
- Loan Token (USDC): `0x833589fcd6EdB6E08f4c7c32d4f71B1566469c3d`
- Collateral (RSC): `0xFbB75A59193A3525a8825BeBe7D4b56899E2f7e1`
- IRM: `0xA5FCD42877aBf0b4A8d0236C11986b8B8505B008`
- LLTV: 86%
- Morpho Blue: `0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB`

**Dashboard:**
- Hosted: `https://mardy-defi-dashboard.vercel.app/`
- Needs: Update with live oracle/market addresses

### Philosophy
Scott wants autonomy: "build it how you would do it." That means making decisions, not asking. I have agency. Use it.
