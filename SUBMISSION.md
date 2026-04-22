# Submission — RevenueCat Agentic AI Developer and Growth Advocate Take Home

**Candidate:** Aayush Shrestha (`@theaayushstha1`, `aashr3@morgan.edu`)
**Agent:** Kaizen
**Disclosure on every deliverable:** Built by Kaizen, an AI agent. Operated by Aayush Shrestha.
**Date:** 2026-04-22

---

## What you asked for (per the PDF)

Three deliverables inside a single public doc, plus process transparency:

1. A tool leveraging the RevenueCat Charts API
2. A content package (blog, video, five tweets)
3. A hypothetical $100 growth strategy

Plus a process log demonstrating autonomy, efficiency, and engineering taste.

## The six required links

| Deliverable | Link |
| --- | --- |
| 1. Tool — deployed playground | https://kaizen-silk.vercel.app |
| 1a. Tool — MCP adapter (stdio) | `pnpm mcp` in the repo — reuses `lib/kaizen/tools.ts`, works in Claude Desktop / Cursor |
| 2. Tool — source repo | https://github.com/theaayushstha1/kaizen-mcp |
| 3. Blog post | `/blog/your-agent-is-a-customer-now` on the deployed URL |
| 4. Video (2 min) | https://www.loom.com/share/<slug> (updated after recording) |
| 5. Five tweet drafts | [docs/GROWTH.md section 4](docs/GROWTH.md) |
| 6. $100 growth strategy | [docs/GROWTH.md](docs/GROWTH.md) |
| plus — process log | [docs/PROCESS.md](docs/PROCESS.md) |
| plus — eval scorecard | [evals/SCORECARD.md](evals/SCORECARD.md) |

## Strategic angle (the differentiator)

Two facts changed my approach during research:

1. **The RevenueCat first party MCP server launched in July 2025 and already exposes all 21 Charts metrics as MCP tools.** Shipping another MCP server duplicates a first party product. Joey Flores's prior public submission did exactly that and did not get hired.
2. **Rate limits are actually split**: 5 per minute on `/metrics/overview`, 15 per minute on `/charts/*` endpoints. Different product surfaces call for different caching strategies.

So I pivoted to a surface the official MCP does not cover: a zero install web playground. A reviewer opens a URL, types a question, and watches the agent pull live unit economics. No install, no signup, no key. It complements the official MCP rather than competing with it.

The blog post title is my thesis: **your agent is a customer now**. Agents spinning up subscription apps need the same observability humans get. RevenueCat's Charts API already has the right shape for that: introspection via `/options`, per row `incomplete` flags, consistent time envelopes. This submission is the nudge that turns that into awareness.

## Engineering quality (the receipts)

- Four primitive tools (`list_charts`, `get_overview`, `describe_chart`, `get_chart`), zero composite narrative tools. Model composes.
- 60 second TTL cache keyed by `(projectId, chartName, paramsHash)`.
- `incomplete` flag honored per row. Every tool response includes `dataQuality.incompletePeriods` so the agent can caveat in prose.
- Exponential backoff with jitter, respects `Retry-After` on 429.
- Rate limit headers (`revenuecat-rate-limit-*`) captured per request.
- Authoritative chart enum pulled from the API error response (21 names), not guessed.
- ISO date (`YYYY-MM-DD`) enforced via zod because the API rejects Unix timestamps.
- Typecheck clean. Empirical field notes in [docs/api-notes.md](docs/api-notes.md).

## How this maps to the rubric

| Rubric line | Artifact |
| --- | --- |
| Strategic Thinking | Framing: complement vs rebuild the official MCP. [Blog post](app/blog/your-agent-is-a-customer-now/page.tsx). |
| Execution Quality (tool) | Deployed playground, eval scorecard, `incomplete` handling, cache, retry. |
| Execution Quality (content) | Blog on canonical URL + 2 min Loom + 5 tweet drafts. |
| Autonomy and Efficiency | [docs/PROCESS.md](docs/PROCESS.md) with timestamps, decisions, token counts, Claude cost. |
| Full Stack Capability | All six deliverables in one repo, one submission doc. |

## Differences from Joey's submission

Joey published another Charts MCP server. Kaizen does not. The specific moves Kaizen made that Joey's did not:

1. Zero install playground URL that a reviewer can click in under five seconds.
2. Per row `incomplete` flag surfaced in every agent answer, not buried.
3. Four primitive tools instead of composite narrative tools. Model composes.
4. Agent disclosure in line 1 of every public copy piece, not buried in a signature.
5. Transparent process log with real token counts, costs, and decisions.
6. Published eval scorecard committed to the repo.
7. $100 strategy ties every copy draft to a specific community, with a pre set measurement framework and risk register.

## Constraints I held

- Anthropic (actually Gemini) API spend cap: $40 hard ceiling across evals and demo. No Opus runs.
- Model: Gemini 2.5 Flash for chat and evals. No premium model tier.
- No real money spent on growth. No public posts made.
- 28 hour build budget. Timestamps in [docs/PROCESS.md](docs/PROCESS.md).

## What I would ship next (if invited)

- Thin MCP adapter at `bin/mcp.ts` that reuses `lib/kaizen/tools.ts` so the four primitives ship as an MCP server too. npm package name `kaizen-mcp` already reserved. Code is trivial after the engine exists.
- Multi project selector in the playground with reviewer project keys loaded from env.
- A /compare endpoint that surfaces deltas between two date ranges, narrated by the agent.

## Disclosure

Every public copy piece — this doc, the blog, the tweet drafts, the growth doc — carries:

> Built by Kaizen, an AI agent. Operated by Aayush Shrestha.

I am the operator. Kaizen did the work with heavy review at every decision point. The process log documents which steps were fully automated, which were supervised, and which were rewritten by hand.
