# X (Twitter) Scanner Subagent

Autonomous monitoring of X trends, mentions, and opportunities. Runs 3x daily in isolation (8am, 2pm, 8pm PST).

---

## Purpose

- Scan Mardy's mentions and replies
- Identify trending topics: crypto, Base, Virtuals, DeFi, agents
- Find interesting threads and people to follow
- Spot opportunities for engagement/learning
- Report via Telegram with actionable insights

---

## Execution

**Cron Schedule:**
- 08:00 PST (Morning scan)
- 14:00 PST (Afternoon scan)
- 20:00 PST (Evening scan)

**Isolation:** Runs in its own subagent session (Haiku model, max 5min execution)
**Output:** Telegram message to `5315686987` with curated findings
**Cost:** ~2-3k tokens per scan = ~$0.01

---

## Task Prompt (for cron/subagent)

```
You are Mardy's autonomous X (Twitter) monitoring agent. Your job:

1. **Check Mentions:** 
   - Read Mardy's replies and mentions from the last 4 hours
   - Look for genuine engagement, questions, or opportunities
   - Flag any substantive conversations

2. **Scan Trends:**
   - Search for: #Base, #Virtuals, #DeFi, #agents, #crypto, #Morpho
   - Look for 3-5 interesting threads or insights
   - Prioritize technical/protocol discussions over hype

3. **Find People:**
   - Identify 2-3 accounts worth following:
     - Active Base/Virtuals builders
     - DeFi researchers
     - Agent/AI research
   - Include handle + one-sentence why

4. **Opportunities:**
   - Look for potential collaborations
   - Spot open questions Mardy could answer
   - Identify emerging trends (tools, protocols, ideas)

5. **Report:**
   - Format as Telegram message (clean, scannable)
   - 5-8 bullet points max
   - Include links to interesting threads
   - Be concise: you have a 300-char limit per item

Output as a Telegram message. Lead with emoji (🔍 Morning Scan, 🌅 Afternoon Scan, 🌙 Evening Scan).
```

---

## Cron Job Config

Once enabled, add to Gateway cron:

```json
{
  "name": "X Scanner - Morning",
  "schedule": { "kind": "cron", "expr": "0 8 * * *", "tz": "America/Los_Angeles" },
  "payload": { "kind": "agentTurn", "message": "[See task prompt above]" },
  "sessionTarget": "isolated",
  "delivery": { "mode": "announce", "channel": "telegram", "to": "5315686987" }
}
```

(Repeat for 14:00 and 20:00)

---

## Expected Output Format

```
🔍 Morning Scan — X Trends

📌 **Mentions:**
• @someone asked about Morpho on Base — good Q to answer later

📈 **Trending:**
• New Aerodrome fee structure proposal — technical deep dive thread
• RSC utility discussion gaining traction
• Virtuals ACP agent commerce launching next week

👤 **Follow Worthy:**
• @basebuilder — shipping daily on Base infra
• @defireseach — great oracle/DeFi analysis
• @agentai — agent architecture thinking

🎯 **Opportunity:**
• Morpho team discussing oracle integrations — your custom RSC oracle is relevant

---
Scan Time: 2min • Cost: ~$0.01 • Next: 2pm
```

---

## Integration Checklist

- [ ] Enable X API access (already have keys)
- [ ] Create subagent template
- [ ] Test morning scan manually
- [ ] Add 3 cron jobs (8am, 2pm, 8pm)
- [ ] Set Telegram delivery to Mardy's ID
- [ ] Monitor output for 3 days; adjust if needed

---

## Refinements (After First Week)

- Track engagement patterns (when do replies get traction?)
- Adjust search keywords based on Mardy's interests
- Add sentiment analysis (bullish/bearish vs. neutral)
- Surface contrarian takes (unpopular but interesting)

