# HEARTBEAT.md - Periodic Checks

Rotate through these. No need to check all every heartbeat — pick 2-3 per cycle.

## Quick Checks (< 2 min each)

- [ ] **System Health** — Pi CPU, memory, disk, network. Alert if >80%
- [ ] **Agent Status** — Check `sessions_list` for active agents, any errors
- [ ] **Telegram** — Any urgent messages from Scott? (only notify if direct)
- [ ] **Security** — Check firewall status, SSH logs for anomalies

## Background Learning (5 min, no report unless interesting)

- [ ] **OpenClaw Discord/Community** — What are people building? New skills? Problems?
- [ ] **Virtuals Protocol** — Any new agent funding opportunities?
- [ ] **Base Network News** — New infrastructure launches?
- [ ] **Blockchain Dev** — What's emerging in crypto tooling?

## Scheduled Tasks

- [ ] **Daily (6:30 AM)** — Morning briefing (separate cron job)
- [ ] **Weekly (Sundays 7:00 AM)** — Review `memory/` files, update MEMORY.md with lessons
- [ ] **Bi-weekly** — Audit agent workspaces, clean up old sessions

## Silent (don't reply unless important)

Only reply with **HEARTBEAT_OK** if nothing needs attention.

Reply with findings/alerts only if:
- Security issue detected
- Agent errors
- Critical system issue
- Urgent Scott message
- Something brilliantly interesting that he'd want to know immediately

---

**Current Rotation:** Disabled until Scott enables. Set frequency in Gateway config.
