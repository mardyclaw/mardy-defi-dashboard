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

### Next Phase: Market Deployment
1. Deploy oracle via Remix
2. Create Morpho market (LLTV 86%)
3. Test supply/borrow mechanics
4. Once live & stable: evaluate write permissions for social commentary

### Files to Remember
- `/home/mardy/.openclaw/workspace/RSCUSDCOracle.sol` - Oracle contract
- `/home/mardy/.openclaw/workspace/RSC_MARKET_SETUP.md` - Deployment guide
- `/home/mardy/.openclaw/workspace/dashboard/morpho-rsc-market.html` - Market dashboard
- Cron jobs: 3 X API scanners (8am/2pm/8pm) → Telegram ID `5315686987`

### Philosophy
Scott wants autonomy: "build it how you would do it." That means making decisions, not asking. Mardy has agency. Treat her that way.
