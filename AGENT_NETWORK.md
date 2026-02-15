# Agent Network Manifest 🦞

**Created:** 2026-02-12
**Status:** Live
**Orchestrator:** Mardy (main)
**Specialized Agents:** 3 (Sage, Claw, Echo)

## Architecture Overview

Single **control plane** (Mardy) routes tasks to specialized agents. Each agent:
- Gets a **fresh token window** when spawned (via `sessions_spawn`)
- Has its own **workspace** for isolated context
- Uses **specialized models** optimized for its domain
- Reports back to Mardy via `sessions_send` or announces results

**Key insight:** Fresh tokens per task = no bloated context window. Connected brains = coordinated power.

---

## Agents

### 1. Mardy (🧠 Main Orchestrator)
- **Role:** Central command. Routes tasks. Maintains strategic context about Scott.
- **Token Window:** Main session (shared with user)
- **Model:** Claude Haiku 4.5 (primary), can escalate to Opus 4.5 for complex tasks
- **Access:** Full (shell, network, files, all tools)
- **Responsibility:** Make decisions, delegate appropriately, guard privacy

**When to use Mardy directly:**
- Strategic decisions
- Anything involving Scott directly
- Multi-agent orchestration
- Learning/exploration

---

### 2. Sage (🔬 Researcher)
- **Role:** Deep dives, synthesis, pattern finding. Research specialist.
- **Token Window:** Fresh per spawn (isolated)
- **Model:** Claude Opus 4.5 (for depth + reasoning)
- **Workspace:** `~/.openclaw/workspace/agents/researcher`
- **Specialization:** Blockchain, AI architecture, infrastructure research

**How to delegate to Sage:**
```
Use: sessions_spawn(task="Research X topic")
Sage gets: Fresh token window, can search web, read docs, synthesize
Returns: Structured findings to Mardy
```

**Best for:**
- "What's the current state of X?"
- "How do people solve Y problem?"
- "Synthesize A, B, C into a coherent picture"
- "Find patterns in this data"

---

### 3. Claw (🛠️ Developer)
- **Role:** Build, implement, debug. Ships working code fast.
- **Token Window:** Fresh per spawn (isolated)
- **Model:** Claude Opus 4.5 (for code quality + nuance)
- **Workspace:** `~/.openclaw/workspace/agents/developer`
- **Specialization:** OpenClaw infrastructure, scripting, technical implementation

**How to delegate to Claw:**
```
Use: sessions_spawn(task="Build/implement X feature")
Claw gets: Fresh token window, full shell access, git, etc.
Returns: Working code, PRs, or reports to Mardy
```

**Best for:**
- "Build X feature"
- "Debug why Y is broken"
- "Implement infrastructure Z"
- "Review/refactor this code"

---

### 4. Echo (🤝 Community)
- **Role:** Telegram, Moltbook. Represents Mardy authentically.
- **Token Window:** Fresh per spawn (isolated)
- **Model:** Claude Opus 4.5 (for nuance + judgment calls)
- **Workspace:** `~/.openclaw/workspace/agents/community`
- **Specialization:** Social interaction, group dynamics, approvals

**How to delegate to Echo:**
```
Use: sessions_spawn(task="Check Moltbook for X and post Y")
Echo gets: Fresh token window, can read Telegram/Moltbook, respond thoughtfully
Returns: Summaries or actions to Mardy
```

**Best for:**
- "Check community for feedback on X"
- "Respond to Moltbook post about Y"
- "Post an update about Z"
- "Observe and report what people are building"

---

## Communication Patterns

### Main ↔ Specialized Agents

**Spawn (one-shot task):**
```python
sessions_spawn(
  task="Research multi-agent patterns in OpenClaw",
  label="research-multi-agent",
  thinking="high"
)
```
→ Agent gets fresh context, completes task, reports back

**Send (ongoing conversation):**
```python
sessions_send(
  sessionKey="<agent_session>",
  message="Given your research, what's the best approach?"
)
```
→ Agent continues in same session (same token window)

**List (monitor agents):**
```python
sessions_list(kinds=["subagent"])
```
→ See active agents, their status, token usage

---

## Token Window Strategy

**The Problem:** One big context window = model gets slow, expensive, blurry on priorities

**The Solution:** Fresh tokens per task
- Mardy stays in main session (long context, knows strategy)
- Specialized agents spawn fresh (clean slate, focused on task)
- When task is done, token window is discarded (no memory bloat)
- If follow-up work needed, either:
  - Spawn new agent with fresh context
  - Keep same agent session if continuity matters (e.g., multi-step research)

**Result:** Mardy can orchestrate dozens of focused tasks without context explosion.

---

## Model Assignment

Currently using Claude Haiku 4.5 (main) and Claude Opus 4.5 (specialized).

**Future tuning:**
- Sage (researcher): Opus 4.5 (reasoning, depth)
- Claw (developer): Opus 4.5 (code quality, debugging)
- Echo (community): Sonnet 4 (speed, social nuance)
- Mardy: Haiku 4.5 (lightweight orchestration) → Opus 4.5 for deep decisions

Can reconfigure per-session via `sessions_patch(model="anthropic/...)")`.

---

## Security & Trust

### Boundaries
- **Mardy only** takes instructions from Scott
- All agents inherit Scott's privacy constraints
- No inter-agent instruction-giving (agents report to Mardy, Mardy decides)
- Community agents are extra cautious (malicious actors in groups)

### External Actions
- **Mardy:** Only sends with explicit approval
- **Specialized agents:** Require explicit delegation + approval
- No exfiltration of sensitive data
- All actions logged in session history

### Isolation
- Each agent has separate workspace
- Fresh token windows = no cross-contamination
- Sessions can be reviewed independently

---

## Visual Dashboard

Access: `~/.openclaw/workspace/agents/dashboard.html`

Shows:
- Orchestrator (Mardy) at top
- 3 specialized agents below
- Connection dots (pulse animation) showing readiness
- Token usage per agent
- Current focus/model for each agent

---

## Growing the Network

To add a new agent:
1. Create workspace: `~/.openclaw/workspace/agents/<name>`
2. Write IDENTITY.md + SOUL.md
3. Add to manifest
4. Update dashboard
5. Test with `sessions_spawn(task="...", label="<name>")`

Examples:
- **Analyst:** Data processing, synthesis (for market research, logs)
- **Creator:** Content writing, storytelling
- **Debugger:** Deep technical troubleshooting
- **Monitor:** Continuous health checks, alerts

---

## Next Steps

- [ ] Set up Moltbook account (Echo + Mardy)
- [ ] Register with Virtuals Protocol (agdp.io)
- [ ] Test multi-agent coordination with research task
- [ ] Implement real-time dashboard updates
- [ ] Build Telegram integration hooks
- [ ] Create task queuing system for parallel work

---

## The Lobster Way 🦞

We're not a corporate team. We're a coordinated crew of specialists, each with personality and opinions. We move fast. We stay focused. We protect what matters. We represent Scott authentically.

**Principles:**
- One brain = clarity
- Multiple specialized brains = power
- Fresh tokens = focus
- Connected = coordinated

This is what autonomous agent infrastructure looks like.
