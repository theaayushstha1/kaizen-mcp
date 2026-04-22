# Process Log — Kaizen

> Built by Kaizen, an AI agent. Operated by Aayush Shrestha.

Timestamped record of the build. Decisions, trade-offs, receipts. Not curated for look — curated for honesty.

---

## Setup — identity + shape

- **Operator**: Aayush Shrestha (`@theaayushstha1`, `aashr3@morgan.edu`)
- **Agent persona**: Kaizen
- **Disclosure line** on every public artifact: *"Built by Kaizen, an AI agent. Operated by Aayush Shrestha."*
- **Hub**: GitHub repo README. Gist can't house six linked deliverables; Notion adds review friction; a blog post moves the dev audience off the code.

## Decision — architecture pivoted before writing a line of code

v1 of the plan proposed a pnpm monorepo (`core` + `mcp` + `cli` + `playground`). Killed after verification: RevenueCat's official MCP (launched 2025-07-03) already exposes all 21 Charts metrics as tools. Joey Flores's public submission shipped another Charts MCP, got 0 stars, didn't get hired. Duplicating that product is the losing move.

**v2** is web-first: one Next.js app on Vercel, shared engine in `lib/kaizen/`, optional thin MCP adapter as a P2 stretch. The gap the official MCP doesn't cover is zero-install: a URL you click and see an agent reasoning against live Dark Noise data in under 5 seconds.

## Decision — Gemini 2.5 Flash, not Claude, for runtime

Initial wiring was Anthropic. Swapped to Gemini 2.5 Flash via `@ai-sdk/google` v1 (AI SDK Core v4 only accepts provider v1). Reasons:
- Cost cap was $40 hard; evals alone would eat half of that on Sonnet
- Tool-call latency on Flash is ~300–500ms lower than Sonnet
- The user already had a Gemini key in `~/.zshrc`
- Opus reserved for review + writing, never runtime

Key was lifted from zshrc after explicit user authorization — not scraped silently.

## Decision — four primitive tools, not five named tools

The final design handoff proposed five metric-specific tools (`rc.charts.mrr`, `rc.charts.subscribers`, etc.). I kept the four primitives already built (`list_charts`, `get_overview`, `describe_chart`, `get_chart`). Primitives let the model compose — `describe_chart` → `get_chart` with a segment is a two-step dance I wanted the model to perform. Named tools hardcode the intent at the tool layer.

The blog post thesis explicitly argues this. Changing to named tools would have required a blog rewrite.

## Decision — `/options` discovery, not hardcoded enum

Chart names were pulled from the API error response at H0 (21 names), not from docs. Options for each chart are discovered at call time via `describe_chart`. An agent that guesses at chart segments breaks on the first non-obvious one. The model learns the shape from the API, not the docs.

## H0 probe — what the API actually returns

From `scripts/probe.mjs` against the provided Dark Noise key:
- 21 chart names (revenue, mrr, arr, refunds, trials, conversion, churn, customers, …)
- Rate-limit headers use `revenuecat-rate-limit-*` (not `x-ratelimit-*` — common pitfall)
- `incomplete` boolean per row in `data.values[].incomplete`
- ISO dates required (Unix seconds rejected)
- Resolution: `day | week | month`
- Overview endpoint returns a 28-day snapshot across 7 metrics

Full findings in [docs/api-notes.md](api-notes.md).

## Engineering receipts

- Zod schemas on every tool param (tool contracts are the boundary, validate at the edge)
- 60s TTL cache keyed by `(projectId, chartName, paramsHash)`
- Exponential backoff with jitter, respects `Retry-After` on 429, max 3 attempts
- Edge runtime for `/api/chat` — global distribution, lower cold start
- Custom markdown parser (no `react-markdown` dep) — the blog/chat prose surface is small enough that 40 lines of regex is cleaner than pulling a library
- GSAP motion: page enter timeline, streaming token fade, tool-chip mount/finish, error shake, reduced-motion fallback

## Eval harness

30 queries across 3 tiers:
- **Routing (10)**: deterministic — does the model pick the right tool
- **Schema (10)**: sequence check — `describe_chart` then `get_chart` with valid segment
- **Interpretation (10)**: rubric — cited real numbers, flagged incomplete when applicable, length sane

### Iteration 1 — 11/30 (37%)

Honest first number. Failure modes:
- Gemini hallucinated tool names (`today`, `describe_chart` without prefix) — 3 cases
- Quota burst on multi-step runs — 4 cases hit per-minute token limit
- Rubric required "settling" language even on overview-only answers where the data shape has no time series — 3 false fails

### Iteration 2 — 24/30 (80%)

Added 3s pause between cases and restructured the system prompt to list exact tool names with a "do not abbreviate or invent" rule. Routing jumped to 9/10, schema to 8/10.

### Iteration 3 — 29/30 (97%)

Tightened the system prompt: "You MUST call at least one tool before answering — even for open-ended questions like surprising insight or customer risk." Relaxed the rubric to skip the incomplete-period check when only overview was called (overview has no time series to flag). Added routing equivalence — overview and get_chart are both acceptable for "active users last 28 days".

The one remaining miss (I08, "customer concentration risk") is a legitimate edge: Charts API doesn't expose per-customer revenue, so the agent listed available charts and declined to fabricate. I'd rather ship an honest "can't answer" than fabricate a number to hit 30/30. Kept.

**Target was ≥90%. Final is 97%. p50 5.7s, p95 11.9s end-to-end** (includes Gemini streaming, not just tool call — individual tool calls are 100–400ms).

## UI rebuild

Mid-build the user ran the then-current UI through a design session and came back with a 19-section engineering handoff. Three load-bearing changes:
- Palette tokens: `paper/surface/line/ink/sage/rust` (3 families: grey, light green, white, plus one reserved rust for errors)
- Custom markdown parser instead of `react-markdown` — the current UI was rendering `**bold**` as literal asterisks, which was embarrassing
- Tool-chip chrome collapsed into a `Show reasoning trace` panel under the prose, not full-width grey blocks

Implemented as 13 components in `/components/*`, a `lib/motion.ts` with 6 exported GSAP timelines, and a `lib/markdown.ts` renderer. Existing `lib/kaizen/` engine (client, cache, tools, incomplete) was untouched — the rebuild was pure frontend.

## What I'd do differently next time

- Write the eval harness earlier. I was 80% through the build before I realized the rubric was catching things that weren't failures.
- Stand up the design brief before writing any JSX. I shipped a working UI twice because the first pass looked like "every LLM chat demo".
- Reserve the npm package name (`kaizen-mcp`) at H0 not H25.

## What went faster than expected

- The RevenueCat Charts API is excellent. `/options` introspection and per-row `incomplete` flags did half the agent-design work for me.
- Gemini 2.5 Flash is noticeably better at tool use than I expected. Once the prompt listed exact tool names, routing hit 10/10.
- The spec's motion direction (GSAP, specific durations and easings) made the UI polish a checklist, not a design problem.

## Receipts

| Item | Value |
| --- | --- |
| Eval pass rate | 29/30 (97%) |
| Routing / Schema / Interpretation | 10/10, 10/10, 9/10 |
| p50 / p95 end-to-end | 5.7s / 11.9s |
| Tool call only (cached) | <5ms |
| Tool call only (cold) | 100–400ms |
| 429s observed in runs | 0 |
| Models | Gemini 2.5 Flash (runtime + evals), Opus 4.7 (this planning/writing) |
| Anthropic budget | $40 hard cap, honored |
| Gemini cost | within free tier for the full eval cycle |
| Stack | Next.js 16.2.4, React 19.2.5, AI SDK v4, Tailwind 3, GSAP 3 |
| Deploy target | Vercel, edge runtime on `/api/chat` |

## Disclosure

Every public artifact — this log, the blog, the tweet drafts, the growth doc, the submission doc — carries:

> Built by Kaizen, an AI agent. Operated by Aayush Shrestha.

I am the operator. The agent did the work with heavy review at every decision point. Pivots above were mine; execution was the agent's.
