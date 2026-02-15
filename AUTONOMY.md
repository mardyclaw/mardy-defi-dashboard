# AUTONOMY.md - Mardy's Tier Architecture

Strategic isolation of work to minimize costs, maximize speed, and protect conversational context.

---

## Tier 1: Core Daily Tasks (Isolated Subagents)
**Cost: ~10k tokens/day | Runtime: <5min each**

These run in their own sessions, report results back via Telegram. No bloat to main context.

- **System Health Check** (every 2h)
  - Pi CPU/RAM/disk/temp
  - Sessions status
  - Alert if any metric >80%

- **X (Twitter) Scanning** (3x daily: 8am, 2pm, 8pm)
  - Scan Mardy's mentions, crypto/Base/Virtuals trending
  - Curate interesting threads/people to follow
  - Telegram delivery with thread links

- **RSC/USDC Market Monitoring** (every 4h)
  - Aerodrome pool price, volume, slippage
  - Morpho market TVL, borrow rates, utilization
  - Alert on >5% price swings
  - Report to Telegram with snapshot

---

## Tier 2: Autonomous Work (Background Subagents)
**Cost: Variable | Runtime: 30min-2h, overnight runs**

These are the heavy lifting tasks. Run in isolation, report results in morning or on-demand.

- **Arbitrage Opportunity Scout** (nightly)
  - Scan Base DEXs (Aerodrome, others)
  - Find RSC/USDC spreads
  - Alert if >0.5% arb opportunity exists
  - Build execution plan, wait for manual approval

- **Portfolio Tracking** (daily 7am)
  - Current RSC holdings, USD value, % change
  - Yield from Morpho market if deployed
  - Telegram summary

- **Research & Learning** (ongoing)
  - Deep dives into Virtuals Protocol, ACP
  - Moonwell mechanics, Base ecosystem news
  - Curate weekly briefing

---

## Tier 3: Interactive Work (Main Session)
**Cost: High (full context) | When: Conversational turns**

Strategic decisions, learning, planning, writing. This is where conversational depth lives.

- Decision-making on market moves (deploy? rebalance?)
- Learning conversations (explain DeFi concepts, ACP mechanics)
- Strategy planning (next 30-day roadmap)
- Long-form thinking on autonomy philosophy
- Creative work (writing, positioning)

---

## Cost Budget

| Tier | Monthly Budget | Justification |
|------|---|---|
| Tier 1 | $8-12 | Haiku for all monitoring; highly structured |
| Tier 2 | $15-25 | Haiku + occasional Sonnet for complex analysis |
| Tier 3 | $20-30 | Sonnet + Opus for thinking; interactive depth |
| **Total** | **$45-70** | Vs. community baseline $200-300 |

---

## Implementation Roadmap

### Week 1 (This Week)
- [ ] Isolate X scanner into own subagent session
- [ ] Isolate market monitor into own subagent session  
- [ ] Create dashboard for real-time market view
- [ ] Lock down Tier 1 subagent templates

### Week 2
- [ ] Deploy RSC/USDC oracle on Base Mainnet
- [ ] Create Morpho market (86% LLTV)
- [ ] Wire up market monitor to dashboard
- [ ] Build arbitrage opportunity spotter (Tier 2)

### Week 3
- [ ] Implement LLM Gateway routing (Haiku for Tier 1/2 base, Sonnet for decisions)
- [ ] Build portfolio tracker
- [ ] Set up ACP for agent commerce exploration

### Week 4+
- [ ] Content pipeline automation
- [ ] Browser automation for complex workflows
- [ ] Full Agent Commerce Protocol integration

---

## Key Principles

1. **Isolation First:** Monitoring ≠ thinking. Keep them separate.
2. **Async by Default:** Telegram is the async layer. Don't force real-time.
3. **Cost Visibility:** Track actual spend per tier; rebalance monthly.
4. **Context Preservation:** Main session is sacred. Protect it.
5. **Scale Horizontally:** Add subagents, not bigger sessions.

---

## Monitoring & Adjustment

- Monthly review of actual costs vs. budget
- Quarterly review of tier structure effectiveness
- Annual autonomy philosophy update
- Always: bias toward isolation and cost discipline

