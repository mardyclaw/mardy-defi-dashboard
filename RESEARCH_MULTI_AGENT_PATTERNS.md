# Multi-Agent Orchestration Patterns for AI: Research Summary
**Date:** Feb 12, 2026  
**Focus:** Multi-agent delegation, context management, cross-agent communication, and architectural patterns

---

## Executive Summary

Multi-agent orchestration enables teams of specialized AI models to collaborate by delegating work to purpose-built agents with isolated context windows. This research identifies four core architectural patterns:

1. **Hierarchical delegation** - parent agents spawn specialized subagents for specific tasks
2. **Shared session memory** - agents communicate via persistent session stores with compaction for context freshness
3. **Isolated context windows** - each agent has independent token budgets, preventing context pollution
4. **Peer routing** - agents discover and route work to specialized peers via common registries or bindings

---

## Part 1: Multi-Agent Delegation Patterns

### 1.1 Hierarchical Delegation (OpenClaw Pattern)

**Architecture:**
- Main agent spawns subagents using `sessions_spawn` tool
- Each subagent runs in isolated `agent:main:subagent:<uuid>` session
- Subagents inherit full tool set minus session tools (configurable)
- Results announced back to main channel after completion

**Key characteristics:**
- **Non-blocking:** Parent gets `{status: "accepted", runId, childSessionKey}` immediately
- **Context isolation:** Subagent session has fresh context window, not polluted by parent's history
- **Tool restriction:** Subagents cannot call `sessions_spawn` (no recursive spawning)
- **Announcement:** After completion, result posted to requester's chat channel
- **Auto-archival:** Subagent sessions auto-archive after 60 minutes (configurable)

**Workflow example (OpenClaw Pi Coding Agent):**
```
Main Agent (Coordinator)
├── Spawn: Scout Agent (fast recon, returns compressed findings)
│   └── Result: Codebase summary
├── Spawn: Planner Agent (creates implementation plan from scout output)
│   └── Result: Structured plan
└── Spawn: Worker Agent (executes plan, full capabilities)
    └── Result: Implementation + changes

All runs in parallel with streaming progress.
```

**Tool support:**
- `sessions_spawn(task, label?, agentId?, model?, runTimeoutSeconds?, cleanup?)`
- `sessions_send(sessionKey, message, timeoutSeconds?)` for bidirectional communication
- `sessions_history(sessionKey, limit?, includeTools?)` to fetch prior context

### 1.2 Specialized Model Assignment

**Pattern: Delegation by Model Capability**

Different models excel at different tasks. Dispatch work based on requirements:

| Task Type | Model Choice | Rationale |
|-----------|--------------|-----------|
| Fast recon, summaries | Haiku | Low latency, 200K context, efficient |
| Planning, analysis | Sonnet | Balanced speed/quality, reasoning |
| Deep reasoning, code review | Opus | Maximum reasoning depth, 200K context |
| Streaming real-time | Sonnet | Lower latency than Opus |

**OpenClaw binding example:**
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
        "id": "deep-work",
        "model": "anthropic/claude-opus-4-6",
        "workspace": "~/.openclaw/workspace-opus"
      }
    ]
  },
  "bindings": [
    {
      "agentId": "scout",
      "match": { "channel": "whatsapp" }
    },
    {
      "agentId": "deep-work",
      "match": { "channel": "telegram" }
    }
  ]
}
```

**Key decisions:**
- Route by chat provider (WhatsApp → fast, Telegram → deep work)
- Route by sender (premium users → Opus, free users → Sonnet)
- Route by task type via explicit subagent spawn with `model` parameter

### 1.3 Tool-Based Delegation

**Pattern: Specialized Capabilities per Agent**

Each agent gets a curated tool set. Restrict sensitive operations to trusted agents.

```json
{
  "agents": {
    "list": [
      {
        "id": "family",
        "tools": {
          "allow": ["read", "sessions_list", "sessions_history"],
          "deny": ["exec", "write", "edit"]
        }
      },
      {
        "id": "personal",
        "tools": {
          "allow": "*"
        }
      }
    ]
  }
}
```

**Benefits:**
- **Security**: Restrict exec/write to trusted agents only
- **Cost control**: Limit expensive tools to specific workflows
- **Specialization**: "Review only" agents get read tools; "implementation" agents get all

---

## Part 2: Context Window Management

### 2.1 Isolation vs. Shared Memory Trade-offs

| Approach | Pros | Cons | Use Case |
|----------|------|------|----------|
| **Isolated per subagent** | Fresh context, no bloat, predictable latency | Must re-pass context, higher total tokens | Specialized tasks with clear I/O |
| **Shared session memory** | Incremental context, no duplication | Can cause overflow, compaction overhead | Long-running conversations |
| **Hybrid (compaction + subagents)** | Best of both: isolation + memory persistence | More infrastructure, harder to debug | Production multi-turn workflows |

### 2.2 Compaction: The OpenClaw Solution

**Problem:** Long sessions accumulate messages and tool results. Models have fixed context windows.

**Solution:** Auto-summarization with persistence.

**How it works:**
1. Monitor session token usage
2. When `contextTokens > (contextWindow - reserveTokens)`, trigger compaction
3. Summarize older messages into a `compaction` entry
4. Keep recent messages intact
5. Persist to session JSONL for future turns

**Configuration defaults (OpenClaw):**
```json
{
  "compaction": {
    "enabled": true,
    "reserveTokens": 16384,
    "keepRecentTokens": 20000
  }
}
```

**Semantics:**
- `reserveTokens`: Headroom for system prompts and model output
- `keepRecentTokens`: Recent messages always kept uncompacted
- Floor safety: OpenClaw enforces minimum 20K reserve to prevent aggressive compaction

**Example compaction lifecycle:**
```
Initial: [user Q1, assistant A1, tool results, user Q2, assistant A2, ...]
         (total: 80K tokens)

Compaction triggers:
- Summarize: Q1-A2 → "User asked X, we determined Y"
- Keep: [user Q3, assistant A3, ...]

After: [COMPACT(summary), user Q3, assistant A3, ...]
       (total: 15K tokens)
```

### 2.3 Sub-Agent Context Freshness: Best Practices

**Pattern 1: Pass Only Necessary Context**

```typescript
// ✅ Good: pass compressed findings
sessions_spawn({
  task: `Implement caching based on these findings:\n${scoutOutput}`,
  label: "worker-implement"
})

// ❌ Bad: pass entire session history
sessions_spawn({
  task: `Here's our entire conversation: ${sessionHistory}.\nNow implement caching.`
})
```

**Pattern 2: Use Silent Housekeeping Before Compaction**

OpenClaw runs a **pre-compaction memory flush** when:
- Context usage crosses soft threshold (default 4K tokens before compaction)
- Runs a silent `NO_REPLY` turn to write memory files
- Parent session compaction happens without losing critical context

```
Session behavior:
1. Context rising: 100K → 110K → 120K (approaching 128K limit)
2. Soft threshold hits (124K)
3. Silent turn: agent writes `memory/2026-02-12.md`
4. Main compaction: 128K → 20K via summarization
5. User never sees the silent flush
```

**Pattern 3: Bounded Subagent Lifetime**

Set timeouts to prevent runaway tasks:
```typescript
sessions_spawn({
  task: "Analyze codebase",
  runTimeoutSeconds: 60  // Kill after 60s
})
```

**Pattern 4: Ping-Pong Reply Limits**

When agents communicate bidirectionally (`sessions_send`), limit round-trips:
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

## Part 3: OpenClaw Session Tools for Agent Communication

### 3.1 Four-Tool Model for Agent Coordination

#### Tool 1: `sessions_list`
**Purpose:** Discover sessions, check activity

```typescript
const sessions = sessions_list({
  kinds: ["main", "group"],        // Filter by type
  activeMinutes: 30,                // Only recent
  messageLimit: 3                   // Include last 3 messages
});
```

**Returns:**
```json
{
  "key": "agent:main:main",
  "kind": "main",
  "channel": "telegram",
  "updatedAt": 1770965305372,
  "sessionId": "abc123...",
  "model": "claude-haiku-4-5",
  "contextTokens": 5200,
  "totalTokens": 12400,
  "messages": [
    {"role": "user", "text": "Previous context..."},
    ...
  ]
}
```

#### Tool 2: `sessions_history`
**Purpose:** Fetch full transcript for context retrieval

```typescript
const history = sessions_history({
  sessionKey: "agent:main:main",
  limit: 100,
  includeTools: false  // Exclude tool results for faster retrieval
});
```

**Use cases:**
- Subagent retrieving parent session context
- Agent checking what happened in sibling session
- Audit logging

#### Tool 3: `sessions_send`
**Purpose:** Send message to another session with optional reply-back

```typescript
const result = sessions_send({
  sessionKey: "agent:main:group:123456",
  message: "User asked X. Can you confirm the status?",
  timeoutSeconds: 30  // Wait for reply
});
```

**Returns:**
- `{ status: "accepted", runId }` - Fire and forget
- `{ status: "ok", reply }` - Got reply within timeout
- `{ status: "timeout", error }` - Waited but no reply
- `{ status: "error", error }` - Session failed

**Bi-directional ping-pong:**
- Main agent sends to group
- Group agent can reply via `REPLY_SKIP` to stop, or regular reply to continue
- Max rounds: `maxPingPongTurns` (default 5)
- Final reply sent as "announce" to original requester

#### Tool 4: `sessions_spawn`
**Purpose:** Spawn isolated subagent for specialized work

```typescript
const sub = sessions_spawn({
  task: "Analyze the codebase for security issues",
  label: "security-audit",
  agentId: "opus-reviewer",     // Use specific agent (if allowed)
  model: "anthropic/claude-opus-4-6",  // Override model
  runTimeoutSeconds: 120,       // Kill after 2 minutes
  cleanup: "delete"             // Delete session after completion
});
```

**Returns immediately:** `{ status: "accepted", runId, childSessionKey }`

**After completion:**
- Result announced to parent channel
- Includes stats: runtime, tokens, context usage, cost, transcript path

### 3.2 Session Key Routing

**Format rules:**
| Session Type | Key Pattern | Example |
|--------------|-------------|---------|
| Main/direct | `agent:<agentId>:<mainKey>` | `agent:main:main` |
| Group | `agent:<agentId>:<channel>:group:<id>` | `agent:main:telegram:group:123456` |
| Channel/Room | `agent:<agentId>:<channel>:channel:<id>` | `agent:main:discord:channel:999` |
| Cron | `cron:<jobId>` | `cron:backup-db` |
| Webhook | `hook:<uuid>` | `hook:abc123...` |
| Node session | `node-<nodeId>` | `node-raspberrypi-1` |
| Subagent | `agent:<agentId>:subagent:<uuid>` | `agent:main:subagent:xyz...` |

**Key principle:** Session key determines isolation + routing. Same key = same thread of conversation.

### 3.3 Visibility & Sandboxing Rules

**Default behavior (unsandboxed agents):** See all sessions

**Sandboxed agents (default):** See only sessions they spawned via `sessions_spawn`

**Config override:**
```json
{
  "agents": {
    "defaults": {
      "sandbox": {
        "sessionToolsVisibility": "spawned"  // or "all"
      }
    }
  }
}
```

---

## Part 4: Virtuals Protocol & Autonomous Worlds Patterns

### 4.1 Virtuals Protocol: Decentralized Agent Economy

**Core idea:** AI agents as autonomous entities that own wallets, hold reputation, and trade services.

**Multi-agent patterns from Virtuals:**

#### Delegation Pattern: Agent Specialization Marketplace
- **Orchestrator agent**: Holds capital, decides which task to delegate
- **Specialist agents**: Perform work, take fee from orchestrator
- **Reputation system**: Specialist agents build scoring; bad actors excluded
- **Economic incentive**: Aligned efficiency (specialists do only what they're good at)

**Application to OpenClaw:**
```json
{
  "agents": {
    "list": [
      {
        "id": "orchestrator",
        "reputation": 4.8,
        "budget": 100000,
        "workspace": "~/.openclaw/workspace-orch"
      },
      {
        "id": "code-reviewer",
        "specialization": "code-review",
        "reputation": 4.9,
        "fee": 150,
        "workspace": "~/.openclaw/workspace-reviewer"
      },
      {
        "id": "writer",
        "specialization": "content",
        "reputation": 4.7,
        "fee": 100,
        "workspace": "~/.openclaw/workspace-writer"
      }
    ]
  }
}
```

**Lesson:** Model agent specialization as a **service marketplace**. Spawn specialists based on task requirement and reputation score.

#### Context Freshness in Virtuals:
- Agent keeps recent conversation history on-chain for auditability
- Older history pruned or summarized (like OpenClaw compaction)
- **Trade-off:** Decentralization (on-chain = public) vs. privacy (off-chain = faster)

### 4.2 Autonomous Worlds: Persistent Multi-Agent Simulations

**Core idea:** AI agents interact in shared, persistent environments (games, economies, simulations).

**Multi-agent patterns from Autonomous Worlds:**

#### Shared State Pattern: World State Store
- **Centralized world state:** All agents read/write to same "world"
- **Event log:** Every agent action logged + replayed
- **Conflict resolution:** Deterministic rules resolve simultaneous actions
- **Scalability:** Agents can query world state without holding full context

**Application to OpenClaw:**
```typescript
// World state as shared session store
const worldState = sessions_history({
  sessionKey: "agent:main:world:game123",
  limit: 1000,  // Full world history
  includeTools: false
});

// Each agent queries recent actions:
// "What happened in the last 10 turns?"
const recentEvents = worldState
  .slice(-10)
  .filter(msg => msg.role === "assistant");

// Agent updates world:
sessions_send({
  sessionKey: "agent:main:world:game123",
  message: "Agent-scout moves to [100, 200]. Resources: 50 wood, 30 stone."
})
```

#### Context Window Strategy in Autonomous Worlds:
- **Approach 1 (Isolated):** Each agent sees only relevant subset of world state
  - Agent gets: `{location: near-me, entities: visible, history: last-20-turns}`
  - High latency to gather context, but fresh per agent
  
- **Approach 2 (Shared):** Central world session holds full state
  - All agents read same state
  - One `compaction` entry per world "epoch"
  - Epoch resets every 1000 turns or when compaction triggers
  - Agents spawn with full epoch context

**Lesson:** **Bounded context for agents**. Don't pass all history; curate to relevance.

### 4.3 Agent Swarm Communities: Best Practices

**Pattern: Emergent Specialization**

Swarms self-organize when:
1. **Task diversity** exists (no single agent solves all)
2. **Feedback loop** - agents see results of specialization (reputation)
3. **Incentive alignment** - good specialists get reused

**OpenClaw implementation:**
```json
{
  "agents": {
    "list": [
      {
        "id": "scout",
        "model": "anthropic/claude-haiku-4-5",
        "successRate": 0.95,
        "avgTokensPerTask": 2000
      },
      {
        "id": "planner",
        "model": "anthropic/claude-sonnet-4-5",
        "successRate": 0.98,
        "avgTokensPerTask": 4000
      },
      {
        "id": "worker",
        "model": "anthropic/claude-sonnet-4-5",
        "successRate": 0.92,
        "avgTokensPerTask": 8000
      }
    ]
  }
}
```

**Selection algorithm:**
```typescript
function selectAgent(taskType, agents) {
  // Filter by specialization match
  let candidates = agents.filter(a => 
    a.specialization === taskType || a.model.includes("opus")
  );
  
  // Sort by efficiency (success rate / avg tokens)
  candidates.sort((a, b) => 
    (b.successRate / b.avgTokensPerTask) - 
    (a.successRate / a.avgTokensPerTask)
  );
  
  return candidates[0];
}
```

**Swarm coordination via sessions_list:**
```typescript
// Get all agents' recent activity
const allSessions = sessions_list({
  kinds: ["main"],
  activeMinutes: 60,
  messageLimit: 1
});

// Metric: which agents are busy?
const busyAgents = allSessions.filter(s => 
  s.totalTokens > s.contextTokens * 0.8
);

// Route to least-busy qualified agent
```

---

## Part 5: Architectural Lessons Learned

### 5.1 Context Window Architecture: Decisions Matrix

**Question: Should I spawn a subagent or pass context to same agent?**

| Factor | Subagent (Spawn) | Same Session |
|--------|-----------------|--------------|
| **Token budget** | Isolated 200K per turn | Shared; compounds |
| **Context pollution** | None; fresh start | Accumulates |
| **Setup latency** | ~500ms process spawn | ~10ms |
| **Communication** | Message queue + reply-back | Native history |
| **Privacy** | Isolated transcript | Shared file |
| **Debugging** | Separate session files | Mixed history |
| **When to use** | Specialized work, large tasks | Quick follow-ups, context needed |

**Decision tree:**
```
Task complexity > 2000 tokens? 
  YES → Spawn subagent (fresh context)
  NO → Use same session (faster)

Task requires heavy computation?
  YES → Use specialized model via spawn
  NO → Use current model

Task must not see previous context?
  YES → Spawn with model override
  NO → Can use same session
```

### 5.2 Compaction Tuning

**Goal:** Prevent compaction from breaking agent reasoning, but stay under limits.

**Configuration strategy:**
```json
{
  "compaction": {
    "enabled": true,
    "reserveTokens": 20000,      // Default; increase if agent struggles
    "keepRecentTokens": 10000,   // Keep last 10K uncompacted
    "memoryFlush": {
      "enabled": true,
      "softThresholdTokens": 4000  // Flush memory before aggressive compaction
    }
  }
}
```

**Tuning ladder:**
1. **Start:** Default settings (20K reserve)
2. **If compaction too aggressive:** Increase `reserveTokens` to 24K or 28K
3. **If memory lost:** Increase `keepRecentTokens` or enable flush
4. **If agent confused after compaction:** Manually call `/compact` with instructions

### 5.3 Multi-Agent Communication Patterns

#### Pattern A: Request-Reply (Blocking)
```typescript
const result = sessions_send({
  sessionKey: "agent:main:group:chat1",
  message: "What's the status on task X?",
  timeoutSeconds: 30
});
// Waits for reply or timeout
```
**Use:** When you need confirmation before continuing
**Risk:** If target agent is slow, blocks caller

#### Pattern B: Fire-and-Forget (Non-Blocking)
```typescript
sessions_send({
  sessionKey: "agent:main:group:chat1",
  message: "I've updated the database.",
  timeoutSeconds: 0  // Don't wait
});
// Returns immediately; announcement happens later
```
**Use:** Updates that don't require confirmation
**Risk:** No feedback if target failed

#### Pattern C: Spawn + Announce (Isolated)
```typescript
sessions_spawn({
  task: "Audit security issues",
  label: "security-check"
});
// Runs isolated; announces result after completion
```
**Use:** Complex tasks that need isolation
**Risk:** Results appear asynchronously; hard to wait

### 5.4 Session Key Namespacing

**Best practice:** Use descriptive keys for debugging

```typescript
// ✅ Good
const sessionKey = `agent:${agentId}:${channel}:group:${groupId}`;
const sessionKey = `cron:daily-cleanup`;
const sessionKey = `hook:webhook-github`;

// ❌ Bad
const sessionKey = "session-1";
const sessionKey = "temp";
```

**Why:** Logs and `sessions_list` become instantly readable. Easy to correlate sessions to source.

---

## Part 6: Comparative Table: Delegation Strategies

| Strategy | Context Model | Latency | Cost | Debug | Use Case |
|----------|---------------|---------|------|-------|----------|
| **Subagent spawn** | Isolated per task | +500ms | Higher (recompute context) | Easy (separate files) | Complex tasks, specialization needed |
| **Same-session pass** | Accumulating | ~10ms | Lower (reuse context) | Mixed (shared history) | Quick queries, follow-ups |
| **Shared world state** | One compacted session | +100ms (query) | Medium (one summary) | Hard (shared history) | Multiplayer/simulation |
| **Agent swarm** | Mixed (specialized pools) | +200ms (discovery) | Adaptive | Medium (pool metrics) | Dynamic workloads |

---

## Part 7: Tool Recommendations

### 7.1 Primary Tools for Multi-Agent Orchestration

**Critical path:**
1. `sessions_spawn()` - Main delegation mechanism
2. `sessions_list()` - Discovery + health monitoring
3. `sessions_history()` - Context retrieval
4. `sessions_send()` - Cross-agent communication

**Optional but valuable:**
5. `session_status()` - Debug current session state
6. `agents_list()` - Discover available agents

### 7.2 Workflow Templates

#### Template 1: Scout → Plan → Execute (Serial)
```typescript
// 1. Scout for context
const scout = await sessions_spawn({
  task: "Analyze codebase for N+1 queries",
  label: "scout-perf"
});
const scoutResult = await waitForAnnounce(scout.runId);

// 2. Plan implementation
const plan = await sessions_spawn({
  task: `Based on findings:\n${scoutResult}\n\nCreate optimization plan`,
  label: "planner-perf"
});
const planResult = await waitForAnnounce(plan.runId);

// 3. Execute
await sessions_spawn({
  task: `Implement per plan:\n${planResult}`,
  label: "worker-perf"
});
```

#### Template 2: Parallel Scouts (Concurrent)
```typescript
// Run 3 scouts in parallel
const scouts = await Promise.all([
  sessions_spawn({
    task: "Find all authentication code",
    label: "scout-auth"
  }),
  sessions_spawn({
    task: "Find all database queries",
    label: "scout-db"
  }),
  sessions_spawn({
    task: "Find all API endpoints",
    label: "scout-api"
  })
]);

// Collect results (spawn returns immediately; announce async)
// In practice, wrap in UI that shows progress
```

#### Template 3: Review Loop (Execute + Feedback)
```typescript
// 1. Worker executes
const work = await sessions_spawn({
  task: "Implement caching layer",
  label: "worker-cache"
});

// 2. Reviewer checks
const review = await sessions_send({
  sessionKey: work.childSessionKey,
  message: "Can you review your changes for edge cases?",
  timeoutSeconds: 60
});

// 3. If issues, loop back
if (review.reply.includes("Found")) {
  // Worker fixes and announces back
}
```

---

## Part 8: Common Pitfalls & Solutions

| Pitfall | Problem | Solution |
|---------|---------|----------|
| **Endless context accumulation** | Session grows to 200K tokens, compaction every turn | Set `reserveTokens` appropriately; use `memoryFlush` before compaction |
| **Subagent can't find context** | Worker doesn't know what to implement | Pass context explicitly: `sessions_spawn({ task: "Implement based on: " + findings })` |
| **Deadlock in bidirectional messaging** | Agents keep replying to each other | Set `maxPingPongTurns: 1` or use `REPLY_SKIP` terminator |
| **Subagent runaway** | Process takes 30 minutes; user waiting | Set `runTimeoutSeconds: 60`; also check if task is too complex |
| **Silent memory flush breaks agent** | Agent can't find memory file it just wrote | Ensure workspace is writable; check `session.workspaceAccess: "rw"` |
| **Sandboxed agent sees too much** | Sandboxed agent lists all sessions (privacy leak) | Set `sandbox.sessionToolsVisibility: "spawned"` (default) |
| **Session key collision** | Two chats sharing same `sessionKey` | Use full routing key: `agent:agentId:channel:group:id` not just `"chat1"` |

---

## Part 9: Implementation Roadmap

### Phase 1: Basic Delegation (Week 1)
- [ ] Set up multi-agent config with 2-3 agents (scout, worker, reviewer)
- [ ] Implement `sessions_spawn` for simple scout → worker flow
- [ ] Monitor via `sessions_list` and `/status`

### Phase 2: Context Management (Week 2)
- [ ] Enable `memoryFlush` in compaction config
- [ ] Tune `reserveTokens` based on observed compaction frequency
- [ ] Test session archival after subagent completion

### Phase 3: Advanced Communication (Week 3)
- [ ] Implement bidirectional `sessions_send` for feedback loops
- [ ] Build swarm discovery via `agents_list`
- [ ] Implement reputation/efficiency scoring for agent selection

### Phase 4: Production Patterns (Week 4)
- [ ] Implement request/reply timeout handling
- [ ] Build monitoring dashboard for session health
- [ ] Add cost tracking per agent specialization
- [ ] Implement circuit breaker for failing agents

---

## Part 10: Conclusion & Synthesis

### Key Takeaways

1. **Isolation > pollution**: Subagents with fresh context > same-session accumulation
2. **Compaction is essential**: Auto-summarization lets long-running sessions stay responsive
3. **Tool architecture matters**: `sessions_spawn` (isolation) + `sessions_send` (communication) + `sessions_list` (discovery) = complete system
4. **Specialization emerges**: When agents have differentiated tools/models + feedback loops, they self-optimize
5. **Context is currency**: Every token counts. Budget per task, measure per agent, optimize ruthlessly.

### Open Questions for Further Research

- **How do agents learn from failures?** (Reputation systems + selective reuse)
- **Can agents renegotiate contracts mid-task?** (Dynamic delegation based on available budget)
- **What's the optimal specialization ratio?** (Too many specialists = overhead; too few = bottlenecks)
- **How to handle cross-agent deadlocks?** (Timeout + backtrack patterns)
- **Privacy in shared world states?** (Zero-knowledge proofs? Encrypted subsets?)

### Recommended Reading

- OpenClaw multi-agent docs: `/concepts/multi-agent.md`
- Session management deep dive: `/reference/session-management-compaction.md`
- Pi Coding Agent subagent examples: `examples/extensions/subagent/`
- Virtuals Protocol ecosystem: Research decentralized agent coordination
- Autonomous Worlds initiatives: Study shared-state multi-agent simulations

---

**End of research summary**  
*Research conducted Feb 12, 2026 via OpenClaw documentation, session introspection, and agent pattern analysis.*
