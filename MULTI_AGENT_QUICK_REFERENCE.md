# Multi-Agent Orchestration: Quick Reference Guide

## One-Page Pattern Reference

### Pattern 1: Spawn Subagent (Isolated Task)
```typescript
const result = await sessions_spawn({
  task: "Find all N+1 queries in the codebase",
  label: "scout-perf",
  model: "anthropic/claude-haiku-4-5",  // Optional: override model
  runTimeoutSeconds: 60                   // Safety: kill after 60s
});
// Returns immediately: { status: "accepted", runId, childSessionKey }
// Result announced to parent channel after completion
```

**When to use:** Specialized work, large tasks, fresh context needed  
**Cost:** ~500ms spawn time + task execution  
**Context:** Subagent gets 200K fresh tokens

---

### Pattern 2: Send Message to Another Session (Blocking)
```typescript
const reply = await sessions_send({
  sessionKey: "agent:main:group:chat123",
  message: "Can you confirm the status?",
  timeoutSeconds: 30
});
// Returns: { status: "ok", reply } or { status: "timeout" }
```

**When to use:** Need confirmation before continuing  
**Cost:** ~10ms + wait time  
**Benefit:** Synchronous, bidirectional communication

---

### Pattern 3: Send Message to Another Session (Fire-and-Forget)
```typescript
await sessions_send({
  sessionKey: "agent:main:group:update",
  message: "Database backed up successfully",
  timeoutSeconds: 0  // Don't wait
});
// Returns immediately; announcement happens later
```

**When to use:** Updates that don't require confirmation  
**Cost:** ~10ms  
**Benefit:** Non-blocking, fire-and-forget

---

### Pattern 4: List Sessions (Discovery + Monitoring)
```typescript
const sessions = await sessions_list({
  kinds: ["main", "group"],
  activeMinutes: 60,
  messageLimit: 2
});
// Returns: [{ key, kind, channel, totalTokens, messages, ... }]
```

**When to use:** Monitor agent load, find busy agents, health check  
**Use case:** Select least-busy agent for task routing

---

### Pattern 5: Fetch Session History (Context Retrieval)
```typescript
const history = await sessions_history({
  sessionKey: "agent:main:group:chat123",
  limit: 50,
  includeTools: false  // Exclude tool results for speed
});
// Returns: [{ role, text, timestamp, ... }]
```

**When to use:** Retrieve context for decision-making  
**Cost:** Proportional to message count

---

## Configuration Essentials

### Enable Compaction + Memory Flush
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

**Result:** Long sessions stay under control; critical memory persisted before compaction

---

### Multi-Agent Routing
```json
{
  "agents": {
    "list": [
      {
        "id": "scout",
        "model": "anthropic/claude-haiku-4-5",
        "workspace": "~/.openclaw/workspace-scout"
      },
      {
        "id": "worker",
        "model": "anthropic/claude-sonnet-4-5",
        "workspace": "~/.openclaw/workspace-worker"
      }
    ]
  },
  "bindings": [
    { "agentId": "scout", "match": { "channel": "whatsapp" } },
    { "agentId": "worker", "match": { "channel": "telegram" } }
  ]
}
```

**Result:** WhatsApp → fast agent (Haiku), Telegram → deep work (Sonnet)

---

### Sandboxed Agent with Restricted Tools
```json
{
  "agents": {
    "list": [
      {
        "id": "family-bot",
        "sandbox": {
          "mode": "all",
          "sessionToolsVisibility": "spawned"
        },
        "tools": {
          "allow": ["read", "sessions_list"],
          "deny": ["exec", "write", "edit"]
        }
      }
    ]
  }
}
```

**Result:** Sandboxed, can only read and inspect sessions it spawned

---

## Decision Tree: Isolation vs. Shared Memory

```
┌─ Large task (>2000 tokens)?
│  ├─ YES → Spawn subagent (fresh context)
│  └─ NO → Same session (faster)
│
├─ Requires complete isolation (no context leakage)?
│  ├─ YES → Spawn subagent
│  └─ NO → Can share session
│
├─ Different model/specialization?
│  ├─ YES → Spawn with model override
│  └─ NO → Current agent fine
│
└─ Long-running conversation?
   ├─ YES → Same session + enable compaction
   └─ NO → Doesn't matter
```

---

## Session Key Routing Table

| Type | Pattern | Example |
|------|---------|---------|
| Direct chat | `agent:<agentId>:<key>` | `agent:main:main` |
| Group | `agent:<agentId>:<channel>:group:<id>` | `agent:main:telegram:group:12345` |
| Subagent | `agent:<agentId>:subagent:<uuid>` | `agent:main:subagent:abc123...` |
| Cron job | `cron:<jobId>` | `cron:daily-backup` |
| Webhook | `hook:<uuid>` | `hook:github-1` |

**Golden rule:** Use full key to avoid collisions

---

## Workflow Templates

### Template 1: Scout → Plan → Execute

```typescript
// 1. Fast discovery
const scout = await sessions_spawn({
  task: "Find all database queries",
  label: "scout",
  model: "anthropic/claude-haiku-4-5"
});
const scoutResult = await waitForAnnounce(scout.runId);

// 2. Create plan
const plan = await sessions_spawn({
  task: `Based on: ${scoutResult}\n\nCreate optimization plan`,
  label: "planner"
});
const planResult = await waitForAnnounce(plan.runId);

// 3. Execute
await sessions_spawn({
  task: `Implement:\n${planResult}`,
  label: "worker",
  runTimeoutSeconds: 120
});
```

**Total cost:** ~3500ms + tokens for each agent

---

### Template 2: Parallel Scouts

```typescript
await Promise.all([
  sessions_spawn({ task: "Find auth code", label: "scout-auth" }),
  sessions_spawn({ task: "Find DB queries", label: "scout-db" }),
  sessions_spawn({ task: "Find API calls", label: "scout-api" })
]);
// All run in parallel
// Results appear in channel as they complete
```

---

### Template 3: Review Loop

```typescript
// Worker does work
const work = await sessions_spawn({
  task: "Implement new feature",
  label: "worker"
});

// Reviewer gives feedback (blocks until reply)
const feedback = await sessions_send({
  sessionKey: work.childSessionKey,
  message: "Review for edge cases",
  timeoutSeconds: 60
});

// Fix if needed
if (feedback.reply.includes("bug")) {
  // Continues...
}
```

---

## Performance Tuning Checklist

- [ ] Compaction frequency too high? → Increase `reserveTokens` (20K → 24K → 28K)
- [ ] Memory lost after compaction? → Increase `keepRecentTokens` (10K → 15K)
- [ ] Subagent runaway? → Set `runTimeoutSeconds: 60`
- [ ] Context pollution? → Use `sessions_spawn` more often
- [ ] Agents deadlocking? → Set `maxPingPongTurns: 1` or use `REPLY_SKIP`
- [ ] Sandboxed agent sees too much? → Set `sessionToolsVisibility: "spawned"`

---

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Compaction every turn" | Lower `reserveTokens` is too high; reduce to 16K or 12K |
| "Subagent can't find context" | Pass context explicitly: `task: "Based on: " + findings` |
| "Permission denied for session_send" | Check `sendPolicy` in config; may be blocking channel |
| "Subagent timeout" | Task too complex; break into smaller steps or increase `runTimeoutSeconds` |
| "Sandbox agent sees all sessions" | Set `sessionToolsVisibility: "spawned"` in agent config |

---

## Specialization Metrics to Track

```typescript
const metrics = {
  scout: {
    successRate: 0.95,
    avgTokensPerTask: 2000,
    avgTimeSeconds: 0.5,
    specialization: "codebase-recon"
  },
  planner: {
    successRate: 0.98,
    avgTokensPerTask: 4000,
    avgTimeSeconds: 0.8,
    specialization: "planning"
  },
  worker: {
    successRate: 0.92,
    avgTokensPerTask: 8000,
    avgTimeSeconds: 2.0,
    specialization: "implementation"
  }
};

// Route based on efficiency: (successRate / avgTokens)
function selectAgent(task, agents) {
  return agents
    .filter(a => a.specialization === task.type)
    .sort((a, b) => 
      (b.successRate / b.avgTokensPerTask) - 
      (a.successRate / a.avgTokensPerTask)
    )[0];
}
```

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────┐
│             Parent Agent Session                    │
│  (e.g., user chat via Telegram)                    │
│                                                     │
│  • Calls sessions_spawn()                          │
│  • Calls sessions_send()                           │
│  • Calls sessions_list()                           │
│  • Gets async announces from subagents             │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        ↓          ↓          ↓          ↓
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │ Scout  │ │Planner │ │Worker  │ │Review  │
    │Subagent│ │Subagent│ │Subagent│ │Subagent│
    │ (Haiku)│ │(Sonnet)│ │(Sonnet)│ │(Opus)  │
    │200K ctx│ │200K ctx│ │200K ctx│ │200K ctx│
    └────────┘ └────────┘ └────────┘ └────────┘
        ↓          ↓          ↓          ↓
    [compact] [compact]  [compact]  [compact]
    summary    summary    summary    summary
        │          │          │          │
        └──────────┼──────────┴──────────┘
                   ↓
        Announce results to parent channel
```

---

## Resources

- Full docs: `RESEARCH_MULTI_AGENT_PATTERNS.md`
- Summary: `SUBAGENT_RESEARCH_SUMMARY.md`
- OpenClaw: `/concepts/multi-agent.md` + `/concepts/session-tool.md`
