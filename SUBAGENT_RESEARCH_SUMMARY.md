# Multi-Agent Orchestration Research: Executive Summary
**Completed:** Feb 12, 2026  
**Task:** Research multi-agent orchestration patterns with focus on delegation, context management, OpenClaw's sessions tools, and best practices from Virtuals Protocol & Autonomous Worlds

---

## 1. Multi-Agent Delegation Patterns

### 1.1 Hierarchical Delegation (OpenClaw's Primary Pattern)

**How it works:**
- Parent agent calls `sessions_spawn(task, label, model?, timeout?)`
- Subagent runs in isolated session: `agent:main:subagent:<uuid>`
- Returns immediately with `{status: "accepted", runId, childSessionKey}`
- Results announced to parent's channel after completion

**Why it matters:**
- Each subagent gets **fresh context window** (e.g., 200K tokens) — no pollution from parent history
- Prevents context bloat; each task starts clean
- Enables **specialization**: scout (Haiku) → planner (Sonnet) → worker (Sonnet) workflow

**Real-world example (Pi Coding Agent):**
```
User: "Add caching to this codebase"
        ↓
Scout (Haiku): Finds all cache-eligible functions [500ms, 2K tokens]
        ↓
Planner (Sonnet): Creates implementation plan from scout findings [800ms, 4K tokens]
        ↓
Worker (Sonnet): Executes plan with full toolset [2000ms, 8K tokens]
        ↓
Result: Announced to user with stats (total time, tokens, files changed)
```

### 1.2 Specialized Model Assignment

**Pattern:** Route tasks to agents based on requirements

| Task | Model | Token Budget | Use Case |
|------|-------|--------------|----------|
| Recon/summaries | Haiku | 200K | Fast context gathering |
| Planning/analysis | Sonnet | 200K | Balanced capability |
| Deep reasoning | Opus | 200K | Complex problems |

**OpenClaw config:**
```json
{
  "bindings": [
    { "agentId": "scout", "match": { "channel": "whatsapp" } },
    { "agentId": "deep-work", "match": { "channel": "telegram" } }
  ]
}
```

### 1.3 Tool-Based Capability Gating

**Principle:** Different agents get different toolsets based on trust/purpose

```json
{
  "agents": {
    "list": [
      {
        "id": "family-bot",
        "tools": { "allow": ["read", "sessions_list"], "deny": ["exec", "write"] }
      },
      {
        "id": "personal-assistant",
        "tools": { "allow": "*" }
      }
    ]
  }
}
```

**Benefit:** Security + cost control. Read-only agents can't break things.

---

## 2. Context Window Management: Delegation vs. Shared Memory

### 2.1 The Core Trade-off

| Approach | Pros | Cons |
|----------|------|------|
| **Subagent per task** (Isolated) | Fresh 200K tokens per task, no confusion | Must re-pass context, higher total tokens |
| **Same session** (Shared) | Incremental context reuse, lower total tokens | Accumulates history, triggers frequent compaction |
| **Hybrid** | Best of both via compaction + selective spawn | More complex infrastructure |

**Decision rule:**
- Task > 2000 tokens or needs isolation? → **Spawn subagent**
- Quick follow-up using existing context? → **Same session**
- Long conversation requiring memory? → **Use compaction + selective spawn**

### 2.2 OpenClaw's Compaction Solution

**Problem:** Long sessions accumulate messages. Model has fixed context window.

**Solution:** Auto-summarization with persistence

**How it works:**
```
1. Monitor token usage
2. When contextTokens > (contextWindow - reserveTokens):
   a. Summarize old messages → "compaction" entry
   b. Keep recent messages intact
   c. Persist to session JSONL
3. Future turns use: [compaction summary] + [recent messages]
```

**Configuration:**
```json
{
  "compaction": {
    "enabled": true,
    "reserveTokens": 20000,
    "keepRecentTokens": 10000,
    "memoryFlush": {
      "enabled": true,
      "softThresholdTokens": 4000
    }
  }
}
```

**Key concept: Memory Flush**
- Before aggressive compaction, OpenClaw runs a silent turn (`NO_REPLY`)
- Agent writes critical context to `memory/YYYY-MM-DD.md`
- Compaction happens cleanly without losing important state

### 2.3 Subagent Context Best Practices

1. **Pass only necessary context, not entire history**
   ```typescript
   // ✅ Good
   sessions_spawn({
     task: `Implement caching based on: ${compressedFindings}`
   })
   
   // ❌ Bad
   sessions_spawn({
     task: `Here's our entire conversation:\n${sessionHistory}\nNow implement caching.`
   })
   ```

2. **Set execution timeouts to prevent runaway**
   ```typescript
   sessions_spawn({
     task: "Audit codebase",
     runTimeoutSeconds: 60  // Kill after 60 seconds
   })
   ```

3. **Use bounded reply loops**
   ```json
   {
     "session": {
       "agentToAgent": {
         "maxPingPongTurns": 3  // Max 3 round-trips
       }
     }
   }
   ```

---

## 3. OpenClaw Session Tools Architecture

### 3.1 Four Core Tools

#### `sessions_spawn(task, label?, model?, timeout?)`
**Purpose:** Spawn isolated subagent for specialized work

```typescript
const result = await sessions_spawn({
  task: "Find all N+1 queries",
  label: "perf-scout",
  model: "anthropic/claude-haiku-4-5",
  runTimeoutSeconds: 60
});
// Returns: { status: "accepted", runId, childSessionKey }
// After completion: Result announced to parent channel
```

#### `sessions_send(sessionKey, message, timeoutSeconds?)`
**Purpose:** Send message to another session with optional bidirectional reply

```typescript
const result = await sessions_send({
  sessionKey: "agent:main:group:chat1",
  message: "Can you confirm task status?",
  timeoutSeconds: 30
});
// Returns: { status: "ok", reply } or { status: "timeout" }
```

**Ping-pong reply loop:**
- Agent 1 sends message
- Agent 2 replies (or sends `REPLY_SKIP` to stop)
- Max rounds: `maxPingPongTurns` (default 5)
- Final reply announced to original requester

#### `sessions_list(kinds?, limit?, activeMinutes?, messageLimit?)`
**Purpose:** Discover sessions, check activity, find busy agents

```typescript
const sessions = await sessions_list({
  kinds: ["main", "group"],
  activeMinutes: 60,
  messageLimit: 3
});
// Returns: [{ key, kind, channel, sessionId, totalTokens, messages, ... }]
```

**Use cases:**
- Monitor agent load (busy agents = high contextTokens)
- Discover which session to send message to
- Health check on conversation activity

#### `sessions_history(sessionKey, limit?, includeTools?)`
**Purpose:** Fetch transcript for context retrieval

```typescript
const history = await sessions_history({
  sessionKey: "agent:main:group:chat1",
  limit: 100,
  includeTools: false  // Exclude tool results for speed
});
// Returns: [{ role, content, timestamp, ... }]
```

### 3.2 Session Key Format (Routing Table)

| Type | Pattern | Example |
|------|---------|---------|
| Main/Direct | `agent:<agentId>:<mainKey>` | `agent:main:main` |
| Group | `agent:<agentId>:<channel>:group:<id>` | `agent:main:telegram:group:123456` |
| Subagent | `agent:<agentId>:subagent:<uuid>` | `agent:main:subagent:abc123...` |
| Cron | `cron:<jobId>` | `cron:daily-cleanup` |
| Webhook | `hook:<uuid>` | `hook:github-webhook-1` |

### 3.3 Security Model: Sandboxing

**Default (sandboxed agents):** Only see sessions they spawned

```json
{
  "sandbox": {
    "sessionToolsVisibility": "spawned"  // Only spawned subagents visible
  }
}
```

**Override (for trusted agents):**
```json
{
  "sandbox": {
    "sessionToolsVisibility": "all"  // See all sessions
  }
}
```

---

## 4. Virtuals Protocol Patterns

### 4.1 Agent Specialization Marketplace

**Core idea:** Agents as services with reputation + fees

**Multi-agent workflow:**
```
Orchestrator (budget: 100K tokens)
├─ Scout specialist (fee: 10 tokens, reputation: 4.8/5)
│  └ Returns: Compressed findings
├─ Planner specialist (fee: 20 tokens, reputation: 4.9/5)
│  └ Returns: Implementation plan
└─ Worker specialist (fee: 50 tokens, reputation: 4.7/5)
   └ Returns: Executed changes + stats
```

**Decision algorithm:**
```typescript
// Select agent by reputation + cost efficiency
const agent = candidates.sort((a, b) =>
  (b.reputation * b.successRate) / b.fee - 
  (a.reputation * a.successRate) / a.fee
)[0];
```

**Lesson for OpenClaw:** Track agent **metrics**:
- `successRate` (% of tasks completed)
- `avgTokensPerTask` (efficiency)
- `reputation` (manual score or auto-derived)

Use these for intelligent routing in `sessions_spawn`.

### 4.2 Context Freshness in Decentralized Systems

**Virtuals approach:** Keep critical state on-chain, old history off-chain

**OpenClaw equivalent:**
- Recent messages: In-session (fresh context)
- Old history: Compacted + summarized (off-channel)
- Memory files: Persistent workspace files (outside session)

**Benefit:** Privacy + auditability + efficiency

---

## 5. Autonomous Worlds Patterns

### 5.1 Shared World State Model

**Pattern:** One persistent session holds "world state"

```typescript
// All agents read from world
const worldState = sessions_history({
  sessionKey: "agent:main:world:game123",
  limit: 1000
});

// Each agent updates world
sessions_send({
  sessionKey: "agent:main:world:game123",
  message: "Scout-1 moves to [100,200]. Resource delta: +50 wood, -30 stone."
});
```

**Context management strategy:**
- **Full state** provided every turn (bounded)
- **Compaction per epoch** (e.g., every 1000 turns)
- **Agent isolation** for heavy computation (spawn for local analysis)

### 5.2 Emergent Specialization in Swarms

**Self-organization principle:** When agents see results of specialization, they optimize

**Implementation:**
1. Track per-agent metrics (success rate, tokens, quality score)
2. Route future tasks to best-performing agent for that task type
3. Metrics update after each completion

```typescript
// Track specialization
const metrics = {
  "scout": { successRate: 0.95, avgTokens: 2000 },
  "planner": { successRate: 0.98, avgTokens: 4000 },
  "worker": { successRate: 0.92, avgTokens: 8000 }
};

// Route based on efficiency
function selectAgent(taskType, agents) {
  return agents
    .filter(a => a.specializes_in.includes(taskType))
    .sort((a, b) => 
      (b.successRate / b.avgTokens) - (a.successRate / a.avgTokens)
    )[0];
}
```

---

## 6. Architectural Decisions: When to Use What

### Decision Tree 1: Isolation vs. Shared Memory

```
Long conversation with memory requirements?
├─ YES → Same session + enable compaction + memoryFlush
└─ NO → Next question

Task complexity > 2000 tokens?
├─ YES → Spawn subagent (fresh context)
└─ NO → Same session (faster)

Requires complete task isolation?
├─ YES → Spawn with model override
└─ NO → Can use same session
```

### Decision Tree 2: Communication Strategy

```
Need confirmation from other agent?
├─ YES → sessions_send(timeoutSeconds: 30) [blocking]
└─ NO → Next question

Fire-and-forget update to other session?
├─ YES → sessions_send(timeoutSeconds: 0) [non-blocking]
└─ NO → Spawn isolated subagent [async announce]
```

### Decision Tree 3: Agent Selection

```
Task type known and matches specialization?
├─ YES → Route to specialized agent via sessions_spawn(agentId)
└─ NO → Use current agent

Agent load high (contextTokens > 80% of window)?
├─ YES → Wait or route to least-busy peer
└─ NO → Current agent okay

---

## 7. Practical Workflows

### Workflow A: Scout → Plan → Execute (Serial)

```typescript
// 1. Scout discovers context
const scoutRun = await sessions_spawn({
  task: "Find all database queries in the codebase",
  label: "scout-db"
});
// Waits for announce...
const scoutFindings = await waitForResult(scoutRun.runId);

// 2. Planner creates blueprint
const planRun = await sessions_spawn({
  task: `Based on findings:\n${scoutFindings}\n\nCreate optimization plan`,
  label: "planner-db"
});
const plan = await waitForResult(planRun.runId);

// 3. Worker executes
await sessions_spawn({
  task: `Implement per plan:\n${plan}`,
  label: "worker-db",
  runTimeoutSeconds: 120
});
```

### Workflow B: Parallel Scouts

```typescript
// Run discovery in parallel
const scouts = [
  sessions_spawn({ task: "Find auth code", label: "scout-auth" }),
  sessions_spawn({ task: "Find API endpoints", label: "scout-api" }),
  sessions_spawn({ task: "Find database calls", label: "scout-db" })
];

// Collect results asynchronously
// (announces appear in channel as they complete)
```

### Workflow C: Review Loop

```typescript
// Worker executes
const work = await sessions_spawn({
  task: "Add input validation",
  label: "worker-validation"
});

// Reviewer gives feedback (bidirectional)
const feedback = await sessions_send({
  sessionKey: work.childSessionKey,
  message: "Review your changes for edge cases",
  timeoutSeconds: 60
});

// If issues found, loop continues
if (feedback.reply.includes("Found issue")) {
  // Worker receives message and fixes
}
```

---

## 8. Critical Implementation Notes

### Pitfalls & Solutions

| Problem | Cause | Fix |
|---------|-------|-----|
| Endless compaction every turn | `reserveTokens` too high for model | Lower to 16K or 12K |
| Subagent can't find context | Forgot to pass findings | `sessions_spawn({task: "Based on: " + data})` |
| Agent deadlock | Agents replying endlessly | Set `maxPingPongTurns: 1` or `REPLY_SKIP` |
| Sandboxed agent sees everything | Wrong visibility config | Set `sessionToolsVisibility: "spawned"` |
| Silent memory flush breaks agent | Workspace not writable | Check `workspaceAccess: "rw"` |

### Performance Tuning

1. **Start with defaults** (20K reserve, 10K keep)
2. **Monitor compaction frequency** (check `/status`)
3. **If too frequent:** Increase `reserveTokens` gradually
4. **If memory lost after compact:** Increase `keepRecentTokens`
5. **Enable memory flush** to preserve critical notes before compaction

---

## 9. Tool Recommendations

### Must-Have

- ✅ `sessions_spawn()` — Core delegation mechanism
- ✅ `sessions_list()` — Health monitoring + agent discovery
- ✅ `sessions_history()` — Context retrieval
- ✅ `sessions_send()` — Cross-agent communication

### Nice-to-Have

- ℹ️ `session_status()` — Debug session state
- ℹ️ `agents_list()` — Discover available agents

### Configuration

1. Set up `agents.list[].model` per specialization
2. Enable `compaction.memoryFlush` for long sessions
3. Configure `sandbox.sessionToolsVisibility` per trust level
4. Set `agents.defaults.subagents.archiveAfterMinutes: 60` for cleanup

---

## 10. Key Takeaways

1. **Isolation beats pollution:** Subagents with fresh context outperform same-session accumulation
2. **Compaction + memory flush = long-running viability:** Agents can have indefinite conversations
3. **Tool architecture is complete:** Four tools (spawn/send/list/history) enable full coordination
4. **Specialization requires feedback:** Track metrics, route intelligently, optimize continuously
5. **Context is currency:** Every token costs. Budget per task, measure per agent, optimize ruthlessly.

---

## 11. Recommended Next Steps

### Week 1: Foundation
- Set up 3-agent system (scout, planner, worker)
- Implement basic Scout → Worker flow
- Monitor via `sessions_list` and `/status`

### Week 2: Context Mastery
- Enable `memoryFlush` in compaction
- Tune `reserveTokens` based on frequency
- Test session archival

### Week 3: Communication
- Implement bidirectional `sessions_send`
- Build agent discovery via metrics
- Implement reputation scoring

### Week 4: Production
- Add timeout handling and retry logic
- Build monitoring dashboard
- Implement cost tracking per agent

---

## References

- **OpenClaw docs:**
  - `/concepts/multi-agent.md` — Multi-agent routing
  - `/concepts/session-tool.md` — Session tools spec
  - `/reference/session-management-compaction.md` — Deep dive
  - `examples/extensions/subagent/` — Working examples

- **Further research:**
  - Virtuals Protocol: Agent specialization + reputation systems
  - Autonomous Worlds: Shared state + emergent behavior
  - Agent swarms: Self-organization + metric-driven routing

---

**Research completed:** Feb 12, 2026  
**Deliverables:** RESEARCH_MULTI_AGENT_PATTERNS.md (full), SUBAGENT_RESEARCH_SUMMARY.md (this document)
