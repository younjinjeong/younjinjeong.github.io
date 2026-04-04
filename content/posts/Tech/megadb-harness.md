---
title: "An AI Team That Never Sleeps — Lessons from the MegaDB Multi-Machine Harness"
url: "/2026/04/megadb-harness/"
date: 2026-04-05T12:00:00+09:00
draft: false
comments: true
authors:
  - younjinjeong
tags: [Rust, AI, Claude, Harness, DevOps, Database, Automation]
categories: [Tech]
layout: "post"
description: "How three autonomous AI agents organized as a development team built a 249K LOC Rust database engine in 38 days — and what I learned about the architecture of AI-driven development"
translations:
  ko: "/2026/04/megadb-harness-ko/"
---

> This is a follow-up to the [previous post](/2026/03/megadb/) introducing the MegaDB project. For what MegaDB is, see that post. This one covers the architecture and operational experience of the multi-machine AI agent harness used during development.

For the past month and a half, I shipped what would have taken me years to build alone: 249,658 lines of Rust code, 14 crates, 365 source files — all in 38 days. The numbers alone seem implausible. But this isn't a story about code generation. It's about how I organized AI agents as a development team, structured their work, and what I learned about the architecture of AI-driven development.

## Three Eras of MegaDB

MegaDB is a database engine written in Rust. It handles both OLTP and OLAP, includes a SQL parser, pgwire protocol, gRPC, Kubernetes operators, vector search, graph queries — a substantial system.

Development unfolded in three distinct eras:

```
  ERA 1: Solo Dev         ERA 2: Agent Integration       ERA 3: Multi-Machine Harness
  (Feb 24-26)             (Feb 27 - Mar 20)              (Mar 21 - Apr 2)
  ◄───── 3 days ─────►    ◄──────── 22 days ────────►     ◄────── 12 days ──────►
  ┌────────────────────┬────────────────────────────────┬──────────────────────────┐
  │ Project Bootstrap  │ Single-Agent Acceleration      │ 3 Autonomous Agents      │
  │ Types, Schemas     │ Storage → SQL → Compute        │ master-db + app-dev      │
  │ 16 PR              │ → Network                      │ + reviewer               │
  │ 8 PR/day           │ 328 PR, 14.9 PR/day            │ 173 PR, 15.7 PR/day      │
  │ 28K LOC            │ +168K LOC                      │ +54K LOC (all reviewed)  │
  └────────────────────┴────────────────────────────────┴──────────────────────────┘
```

**Era 1 (Feb 24-26):** Three days of bootstrapping. I scaffolded nine crates solo, set up types and configuration. About 8 PR/day, 28K LOC total. Standard project startup phase.

**Era 2 (Feb 27 - Mar 20):** Twenty-two days with Claude Code running as a single agent. This is where exponential growth began. Average 14.9 PR/day, 328 PRs merged, 168K LOC added. The storage engine, SQL parser, compute layer, network server — the bulk of core functionality came from this era. No code review. CI wasn't stable. Speed was there, but without quality gates.

**Era 3 (Mar 21 - Apr 2):** Twelve days running the multi-machine harness. Three AI agents, each with a specific role, operating autonomously. PR/day stayed at 15.7 — matching Era 2's velocity — but now every PR was reviewed and CI-passed before merge.

The breakthrough: **we kept the speed while raising the quality.** Normally you pick one. The agent team structure broke that tradeoff.

## Composing a 24-Hour AI Team

Here's the architecture:

**Machine 0 (Advisor):** Strategy layer, handled by me. No code written. Priorities set through GitHub Issues. Orchestrates overall direction.

**Machine 1 (master-db):** Agent owning five core crates: megadb-core, megadb-storage, megadb-compute, megadb-k8s, megadb-crypto. Focuses on low-level work — SIMD optimization, storage engine, Kubernetes operators.

**Machine 2 (app-dev):** Agent owning nine upper-layer crates. SQL parser, network server, CLI, auth (OIDC/SAML/SCIM), vector/graph search — application-level features.

**Machine 3 (reviewer):** Read-only agent. No code written. Performs mechanical validation and six-dimensional architecture review on all PRs. The quality gate itself.

```
┌───────────────────────────────────────────────────────────────────┐
│                   Machine 0: Advisor (Human)                      │
│       Strategy · Harness Monitoring · Priority Setting            │
│       Code Written: None                                          │
└───────────────────────────────┬───────────────────────────────────┘
                                │ Work assigned via GitHub Issues
                                ▼
┌───────────────────────────────┐   ┌───────────────────────────────┐
│  Machine 1: master-db         │   │  Machine 2: app-dev           │
│                               │   │                               │
│  5 Core Crates:               │   │  9 Application Crates:        │
│  · megadb-core                │   │  · megadb-sql                 │
│  · megadb-storage             │   │  · megadb-network             │
│  · megadb-compute             │   │  · megadb-catalog             │
│  · megadb-k8s                 │   │  · megadb-vector / graph      │
│  · megadb-crypto              │   │  · megadb-llm / fts / onnx    │
│                               │   │  · msql-cli                   │
│  Focus: Storage, SIMD, K8s    │   │  Focus: SQL, API, CLI         │
└───────────────┬───────────────┘   └───────────────┬───────────────┘
                │                                   │
                └─────────────┬─────────────────────┘
                              ▼
               PRs opened to release-candidate branch
                              ▼
┌───────────────────────────────────────────────────────────────────┐
│               Machine 3: Reviewer (Quality Gate)                  │
│     Mechanical Checks → 6-Dim Architecture Review → Verdict       │
│     Code Written: None (Read-Only)                                │
└───────────────────────────────────────────────────────────────────┘
```

The biggest advantage of this structure is **time-independence.** While I slept, master-db was reducing cognitive complexity in the storage engine, app-dev was implementing SCIM provisioning, reviewer was reviewing PRs one by one. I'd wake up to stacks of merged PRs and review comments. Human working hours disappeared as a constraint.

Data backs this up. During harness operation, the median issue cycle time was **3.4 hours.** Issues went from creation to resolution in less than half a day. Peak days saw 39 PRs merged.

## The .claude/ Directory: Blueprint of the Agent System

The harness's magic doesn't lie in GitHub automation—it lies in the **.claude/ directory at project root.** This is infrastructure code that lets agents understand and coordinate with each other.

```
.claude/
├── workspace-claude.md           ← Team constitution for the entire system
├── agents/                       ← 7 internal sub-agent prompts
│   ├── database-architect.md     ← Architecture decisions
│   ├── rust-systems-developer.md ← Low-level implementation
│   ├── database-optimizer-architect.md ← Performance optimization
│   ├── data-engineering-specialist.md  ← Data pipelines
│   ├── data-specialist.md        ← Data queries/analysis
│   ├── database-architect-developer.md ← Advanced features
│   └── system-performance-engineer.md  ← System performance
├── prompts/                      ← 4 per-machine prompts
│   ├── machine-0-advisor.md
│   ├── machine-1-master-db.md
│   ├── machine-2-app-dev.md
│   └── machine-3-reviewer.md
├── scripts/                      ← Launch and configuration automation
│   ├── launch.sh                 ← Start multi-agent sessions
│   └── check-deps.sh             ← Enforce crate dependencies
└── templates/                    ← PR/Issue templates
    ├── pull_request.md
    └── issue.md
```

**workspace-claude.md** reads like a team constitution. It specifies:
- **Crate ownership map:** which agent owns which crate
- **Dependency graph:** precise relationships between 14 crates
- **Communication protocol:** how work gets assigned via GitHub Issue/PR
- **Branch strategy:** explicit branching like feat/master-db/xyz
- **Signal file schema:** JSON format for emergency inter-agent communication

**The four machine prompts** spell out exactly what each agent does. When master-db hears "improve WAL recovery logic in megadb-storage," it checks workspace-claude.md, sees "this is my crate," and starts immediately. Four safety mechanisms activate simultaneously:

1. **check-deps.sh:** validates dependency direction at every build. If app-dev accidentally modifies megadb-storage, the build fails.
2. **Crate ownership enforcement:** CI analyzes file diffs and catches ownership violations.
3. **Reviewer's automatic rejection:** applies "Crate ownership violation" label and reverts.
4. **GitHub Branch Protection:** release-candidate branch requires reviewer approval to merge.

Stacked layers mean **agents can't step on each other's code.** This is critical for autonomous systems—humans can say "sorry" and negotiate. AI struggles with that. During the entire harness period: zero merge conflicts.

## Why One Machine Per Session Matters

The most crucial design decision: **each agent gets an independent machine (session).**

Why does this matter? Usually with AI coding assistants, one session handles everything. But that approach has fundamental limits.

First: **context isolation.** When master-db is fixing WAL implementation and app-dev modifies the SQL parser in the same session, context gets tangled. Separate sessions mean each agent sees only their crates. master-db always loads only megadb-storage and megadb-compute—no irrelevant context competition.

Second: **parallelism.** One session = one task at a time. Separate machines? master-db works on SIMD vectorization while app-dev builds the gRPC server. The workload shift pattern shows this naturally. Early: master-db builds foundations. Later: app-dev integrates on top. No explicit coordination—just the natural dependency flow.

```
100%┤  ▒▒▒  ▒▒▒  ░▒▒        ▒▒▒  ▒▒▒  ▒▒▒  ▒▒▒  ▒▒▒  ▒▒▒  ▒▒▒
    │  ▒▒▒  ■■■  ■▒▒  ■■■  ■▒▒  ▒▒▒  ▒▒▒  ▒▒▒  ▒▒▒  ░░░  ░░░
    │  ▒▒▒  ■■■  ■▒▒  ■■■  ■■▒  ■■▒  ■■▒  ░░▒  ░░▒  ░░░  ░░░
    │       ■■■       ■■■  ■■■  ■■■  ■■■  ░░░  ░░░  ░░░  ░░░
    │       ■■■              ■■■  ■■■  ■■■  ░░░  ░░░
    │       ■■■              ■■■  ■■■  ■■■  ░░░  ░░░
  0%┤───────────────────────────────────────────────────────────
    Mar21  22   23   25   26   27   28   29   30   31  Apr1

    ■ master-db    ░ app-dev    ▒ reviewer

    ◄── master-db lead ──►◄── transition ──►◄── app-dev lead ──►
```

This pattern emerged naturally. Low-level crates (storage, compute) finish first; higher crates (SQL, network, CLI) integrate on top. No explicit coordination—just focused agents on their assigned crates.

Third: **crate ownership enforcement.** Each agent modifies only assigned crates. Eliminates merge conflicts at the root. Critical for autonomous systems where recovery is hard. Harness period: **zero merge conflicts.**

Fourth: **failure isolation.** One agent's problem doesn't cascade. The harness ran 2-Machine for a day when needed; other agents kept working unaffected.

By harness end, contributions balanced evenly:

| Agent | PRs | Lines Added | Lines Deleted | Focus Area |
|-------|-----|-------------|---------------|------------|
| master-db | 57 (33%) | +18,028 | -5,838 | Storage, compute, K8s, SIMD |
| app-dev | 58 (34%) | +13,277 | -4,765 | SQL, network, CLI, auth, tests |
| reviewer | 23 (13%) | +11,138 | -7,964 | Mechanical fixes from review |
| other | 35 (20%) | +17,961 | +640 | Cross-agent merges, harness setup |

Reviewer added 11K LOC despite writing no new features — mechanical fixes found during review (lint violations, formatting).

## The Develop-Deploy-Test Cycle

The harness runs differently from standard CI/CD. Code doesn't auto-test on push. Instead: **explicit deploy-test cycles.**

```
1. Agent completes work on feat branch
2. PR opened to release-candidate → reviewer auto-assigned
3. After reviewer approval: rebase & merge
4. release-candidate deploys to Kubernetes (CircleCI job)
5. E2E tests run automatically
   - 4 storage engines validated (MEMORY, OLTP, OLAP, TIMESERIES)
   - 100+ SQL functions tested
   - Distributed query tests
   - Stress tests
6. Tests pass → next agent picks up latest code
```

This cycle moves fast because **each agent modifies only their domain.** master-db changes storage API; app-dev sees it, adjusts quickly. Clear dependencies. Defined crate ownership.

The main deployment branch is actually **release-candidate.** main is reserved for validated stable points. All agents target release-candidate. Separates development from stabilization. Keeps "deployable any moment" state viable.

## Test Infrastructure: From E2E to Fuzz Testing

MegaDB has comprehensive test coverage.

**Unit Tests:** 1,876 unit tests, all passing. Not just line coverage—core logic validated per crate.

**Integration Tests:** 13 integration test files:
- http_e2e.rs: HTTP API endpoint testing
- money_e2e.rs: Financial calculation accuracy
- cross_engine_integration.rs: 4-engine compatibility
- wal_recovery.rs: WAL recovery protocol
- columnar_integration.rs: Columnar storage queries
- row_integration.rs: Row storage queries
- builder_integration.rs: K8s operator pipeline
- encrypt_cache_integration.rs: Encryption cache consistency
- And more

**Fuzz Tests:** 4 fuzz targets:
- fuzz_sql_parser: SQL parser fuzzing (no crashes on arbitrary input)
- fuzz_check_constraint_parser: Constraint parser
- fuzz_optimizer_pipeline: Query optimization
- fuzz_pgwire_queries: PostgreSQL wire protocol

**Smoke Tests:** 60KB smoke_test_v070.sh script runs post-deployment in K8s. Validates all 4 storage engines, 100+ SQL functions, graph queries, vector search in one comprehensive pass.

**Stress Tests:** Long-running high-load scenarios validate no memory leaks or deadlocks.

**Chaos Tests:** K8s pods randomly killed, networks cut, disks filled. Simulates failure modes.

**Benchmark & Baseline Tests:** Performance tracking and regression detection.

How did such thorough testing emerge? Simple: **reviewer mechanically enforced "tests accompany every PR."** No tests? Auto-requested changes. This single pattern created comprehensive coverage.

## Communication Structure and Resolving Bottlenecks

The harness communicates exclusively through **GitHub.** Issues assign work. PRs deliver results. Comments provide feedback. All recorded. No separate monitoring dashboard or Slack thread—just Issue/PR history reveals the whole project state.

### Orchestration: machine-0-advisor's 120-Second Cycle

Machine 0 doesn't just create Issues. It **polls system state every 120 seconds.** Detects bottlenecks. Identifies idle agents. Adjusts priorities. Assigns work. Fast feedback loops mean the system self-optimizes.

Example: Mar 31 threatened 39 PRs merging in one day. Reviewer became bottleneck. Advisor detected this and:
1. Closed/postponed lower-priority issues
2. Throttled master-db and app-dev pace
3. Requested automation scripts to assist reviewer

Immediate response became possible.

### Reviewer Bottleneck and Automated Validation

On Mar 31, reviewer faced 39 PRs to process as a single agent. The key: **code quality didn't drop under load.** Instead, automation absorbed the pressure:
- **check-deps.sh:** crate dependency validation auto-runs in CI
- **SonarQube:** 85 static analysis rules applied automatically
- **Snyk:** dependency vulnerabilities scanned automatically
- **Clippy + fmt:** code style enforced in CI

Reviewer focused only on **architecture review** for PRs that passed all automated checks. Lint and formatting were already done.

### Signal File System (Deprecated)

Early design included .claude/agent-messages/ with JSON files for inter-agent signals. Turned out useless. GitHub Issue/PR sufficed. Signal files assumed urgent communication needs. Reality: almost never happened. Most coordination ran through GitHub's automatic workflows.

### What Still Needs Improving

**Reviewer bottleneck:** Peak moments (like Mar 31) overload single reviewer. Solutions exist:
- **Multiple reviewers:** 2-3 reviewer instances, distributed by round-robin or crate ownership
- **Layered review:** CI handles automated validation; agents handle architecture only

**No real-time inter-agent communication:** When master-db changes storage API, app-dev doesn't learn until next Issue assignment. Tradeoff for merge-conflict prevention via ownership. Long-term: might need event bus mechanisms.

**Context window limits:** Growing projects make it hard to load entire crate sets. master-db's 5 crates already substantial. Long-term: RAG-based context management might be necessary.

**Functional quality validation:** SonarQube and Snyk check **formal quality.** But do queries return correct results? Does concurrency maintain data consistency? Different dimension entirely. Fuzz and property-based tests need strengthening.

## What the Numbers Say

```
┌─────────────────────────────────────────────────────────────┐
│            MegaDB Repository Activity Summary               │
│            38 Days (Feb 24 - Apr 2)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  590 PRs Merged                537 Issues Created           │
│  ████████████████████████     ████████████████████          │
│  Average 15.5 PR/day          520 Issues Closed (97%)       │
│                                                             │
│  +384,175 Lines Added          -48,684 Lines Deleted        │
│  ████████████████████████     ██████                        │
│  +335,491 Net Growth           38 Active Days               │
│                                                             │
│  Codebase: 1,799 → 249,658 Rust LOC (+13,778%)              │
│  ████████████████████████████████████████████████████       │
│  43 → 365 .rs Files            9 → 14 Crates                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### PR Throughput by Week

```
 PRs
 170 ┤                            █
     │                            █
 160 ┤                            █  161
     │                            █
     │
 100 ┤                                  █
     │                      █           █  98
  90 ┤                      █
     │                            █
  80 ┤                █     █     █  74
     │                █     █     █
  70 ┤                █
     │    █           █
  60 ┤    █     █
     │    █     █
  50 ┤    █     █
     │    █     █
  40 ┤    █     █
     │    █     █
     └────┴─────┴─────┴─────┴─────┴─────┴──
         W08   W09   W10   W11   W12   W13
        2/24   3/3  3/10  3/17  3/24  3/31
```

| Week | Period | PRs |
|------|--------|-----|
| W08 | 2/24~ | 59 |
| W09 | 3/3~ | 44 |
| W10 | 3/10~ | 81 |
| W11 | 3/17~ | **161** |
| W12 | 3/24~ | 74 |
| W13 | 3/31~ | 98 |

Highest week: W11 (Mar 17-23) with 161 PRs. Coincided with K8s/hardening sprint plus harness launch.

### Era Comparison

| Metric | Era 1 — Bootstrap (3 days) | Era 2 — Single Agent (22 days) | Era 3 — Multi-Machine (12 days) |
|--------|---------------------------|-------------------------------|--------------------------------|
| PR/day | 5.3 | 14.9 | **15.7** |
| LOC/day | 4,242 | 7,632 | 5,316 |
| Issues/day | — | 19.9 | 8.3 |

**Key insight:** Era 2 to Era 3, PR/day stayed flat (14.9 → 15.7) but LOC/day dropped (7,632 → 5,316). Why? Harness period focused on **hardening.** Less new features; more SonarQube fixes, cognitive complexity reduction, test coverage improvement. This rewrites code rather than adding it—lower LOC growth, higher quality.

### Quality vs Speed

| Gate | Era 1 | Era 2 | Era 3 (Harness) |
|------|-------|-------|-----------------|
| PR Code Review | None | None | **100%** |
| Crate Ownership | None | None | **Enforced** |
| CI Pipeline | None | Broken | **5/5 Passing** |
| SonarQube | None | None | **85 Rules Applied** |
| Snyk Scanning | None | None | **Enabled** |
| Dependency Check | None | None | **check-deps.sh** |
| Lint Policy | None | None | **unwrap/expect/panic Blocked** |
| Issue Tracking | None | Weak | **Complete: Create→Close 3.4hrs** |

This table says one thing: **same speed, all quality gates added.** Usually adding quality means 30-50% slower. Multi-agent team absorbed the overhead by separating reviewer to dedicated machine and maximizing automation.

### Codebase Growth

```
 LOC
 250K ┤                                                        ●───● 249,658
      │                                                    ●──┘
 240K ┤                                                ●──┘
      │                                            ●──┘
 230K ┤                                        ●──┘
      │                                    ●──┘
 220K ┤                                ●──┘
      │                            ●──┘
 200K ┤                        ●──┘
      │                    ●──┘  ← 3/20: 195K
 190K ┤                ●──┘
      │            ●──┘
 140K ┤        ●──┘
      │    ●──┘          ← 3/15: 138K
 120K ┤●──┘
      │●                 ← 3/1: 80K
  80K ┤│                 ← 2/28: 57K
      ││
  10K ┤●                 ← 2/26: 11K
   2K ┤●                 ← 2/24: 1.8K
      └─┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴────┴──
       2/24 2/28  3/1  3/7 3/12 3/15 3/20 3/22 3/25 3/28 3/30  4/2
                                          ▲
                                    Harness Started
```

The curve shows harness softening growth slightly. Not "slowed down"—shifted to **more sustainable pace.** Early explosion was necessary. But for long-term maintenance, current speed is healthier.

### Issue Cycle Time

| Metric | Value |
|--------|-------|
| Median | **3.4 hours** |
| Mean | 11.6 hours |
| Fastest | Under 1 minute |
| Slowest | 69.5 hours |
| Closure Rate | 97% (520/537) |

Most issues close within a working session. Request feature; responsible agent completes in 2-3 hours; reviewer approves in 30 minutes. Fast feedback loops prevent problem accumulation.

## Closing Thoughts

This project taught me there's a massive difference between "AI as a faster code generator" and "AI organized as a team." Single agent shows overwhelming throughput versus humans. Multi-agent harness maintains throughput while gaining quality, traceability, and failure isolation simultaneously.

More interesting: this structure **self-heals automatically.** Reviewer becomes bottleneck; advisor auto-throttles agents. One agent slows; others pick up slack. System optimizes itself.

Plenty of road ahead. Real-time inter-agent coordination. E2E test automation. Functional quality validation. Context management. But building a production database engine in 38 days shows clearly where software development heads.

You sleep. Code ships. Reviews run. Issues close. That's what a 24-hour AI team means.

---

*All figures and charts in this post derive from actual MegaDB repository activity data.*
*Full project: 38 days, 590 PRs, 537 issues, 249,658 Rust LOC across 14 crates*
*The release-candidate branch is the primary development line.*
