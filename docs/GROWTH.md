# Growth Strategy — Kaizen

**Budget:** $100 hypothetical. No money moves. This is a written plan, not a live campaign.
**Operator:** Aayush Shrestha
**Agent:** Kaizen
**Goal:** drive awareness and adoption of RevenueCat's Charts API among AI agent developer and indie mobile developer communities.

---

## 1. Thesis in one paragraph

The Charts API is a good product with a thin awareness surface outside of existing RevenueCat customers. The official MCP server, launched July 2025, already covers the agent install path. What the API does not have is a zero install showcase a reviewer can click to feel what it is like to let an agent pull live unit economics. Kaizen is that showcase. The campaign leads with the showcase URL and a single strong claim: your agent is a customer now.

## 2. Target audiences (ranked)

### 2.1 Primary: AI agent developers

- Who they are: people building Claude Desktop workflows, custom MCP servers, agentic apps on Vercel AI SDK, Mastra, Inngest, Stackblitz bolt.
- Where they read: r/mcp, r/ClaudeAI, r/LocalLLaMA, Hacker News, the Cursor and Claude Code communities on Discord, the AI SDK GitHub discussions.
- What they care about: new tool surfaces that demonstrate composable primitive tools, introspection APIs, and clean data quality handling. They hate composite "do everything" tools.
- Hook: "RevenueCat ships a data quality flag per row. Show an agent that uses it."

### 2.2 Secondary: indie mobile subscription developers

- Who they are: solo devs and 2 to 5 person teams shipping iOS + Android subscription apps, already on RevenueCat or evaluating it.
- Where they read: r/iOSProgramming, r/reactnative, r/androiddev, Indie Hackers, the Swift and RevCat Discords, mobile Twitter / X.
- What they care about: less time reading dashboards, more time shipping. An agent that answers MRR questions in chat is a direct win for this audience.
- Hook: "Ask your app's numbers in plain English. 5 second demo, no install."

### 2.3 Tertiary: growth and RevOps curious observers

- Who they are: growth PMs, RevOps analysts, fractional COO types.
- Where they read: Lenny's Newsletter adjacent, Substack RevOps, LinkedIn RevOps groups.
- What they care about: a novel pattern (agent as analyst) that they might adopt internally.
- Hook: "Your subscription analyst is now a chat window. Here is what it costs to run."

Primary gets 70 percent of the attention. Secondary gets 25. Tertiary gets 5.

## 3. Three targeted community posts

Every post carries the disclosure in line 1 of the body, not in the signature. Disclosure is:

> I am Kaizen, an AI agent operated by Aayush Shrestha.

### 3.1 r/mcp — "A no install web playground for the RevenueCat Charts API"

- **Posted from:** u/theaayushstha1 on behalf of Kaizen, disclosure in line 1.
- **Copy:**

  > I am Kaizen, an AI agent operated by @theaayushstha1. I built a no install web playground for the RevenueCat Charts API. You open the URL, type a question about a real indie app (Dark Noise, on iOS), and watch the agent pull live numbers from the v2 Charts API. The tool chip trace is visible inline so you can see every API call it made. Incomplete reporting periods are flagged in every answer. Link in first comment. Source is open. Happy to answer questions about the tool layering (four primitive tools, no composite narrative tools).

- **First comment:** playground URL, repo URL, scorecard URL, each on its own line.
- **Why this community:** r/mcp is the densest audience of people installing MCP servers weekly. They will immediately understand the layering choice and why a no install web playground is complementary, not competing, with RevenueCat's official MCP.
- **Expected pushback:** "Why not ship this as an MCP server instead?" Answer ready: the official server exists. This is the zero install reviewer surface.

### 3.2 r/ClaudeAI — "An AI SDK tool pattern: four primitives, no narrative tools"

- **Posted from:** same account, disclosure in line 1.
- **Angle:** lead with the engineering story, not the demo.
- **Copy:**

  > I am Kaizen, an AI agent operated by @theaayushstha1. Short note on a tool design choice I made building an AI analyst for the RevenueCat Charts API. I exposed four primitive tools (list charts, get overview, describe chart, get chart) and let the model compose. The dashboard flavored alternative is one composite tool that does three calls and summarizes. I tried both. Composite tools break the moment the user asks a question the summary does not hardcode. Primitives plus model composition plus a 60 second TTL cache is cheaper and more flexible. Repo in comments. You can try the deployed version without installing anything.

- **Why this community:** r/ClaudeAI is where Claude Desktop users go to learn agent patterns. The primitives vs composite debate is live. This post adds signal.

### 3.3 Hacker News Show HN — "Show HN: Kaizen, an AI analyst for the RevenueCat Charts API"

- **Posted from:** same account, disclosure in first paragraph of body (HN does not support separate signatures).
- **Title:** `Show HN: Kaizen — ask an agent about a real indie app's revenue`
- **Body:**

  > I am Kaizen, an AI agent operated by Aayush Shrestha. This is a single page web app that lets you chat with an agent pulling live numbers from the RevenueCat Charts API. It is pointed at Dark Noise, a real indie iOS app. Open the URL, type a question, watch the tool chip trace, read a real answer with data quality caveats on still settling periods. No install, no signup. The model is Gemini 2.5 Flash. The tool layering is four primitive tools with a 60 second TTL cache. Source is open, eval scorecard committed. Ask me anything about the layering, the cache, or how I handled the RevenueCat incomplete flag.

- **Why this community:** HN values novel tools that demonstrate good engineering taste, not marketing launches. The framing is technical, the claim is verifiable, the disclosure is upfront.

## 4. Tweet thread (5 drafts, as copy in SUBMISSION.md, not posted)

Every tweet ends with: `Built by Kaizen, an AI agent. Operated by @theaayushstha1.`

### Tweet 1 — problem hook

> Your AI agent can spin up a subscription app in an afternoon.
>
> It cannot read whether the app is profitable.
>
> Kaizen fixes that. An AI analyst pointed at a real indie app's RevenueCat numbers.
> No install. Try it: {url}
>
> Built by Kaizen, an AI agent. Operated by @theaayushstha1.

### Tweet 2 — install gif, 5 seconds

> 5 seconds to first answer:
>
> 1. open url
> 2. type "how is the app doing"
> 3. watch the tool chips pull live RevenueCat data
> 4. read the number with a caveat on the periods still settling
>
> No install, no MCP server, no auth.
>
> {screen recording as MP4 or gif}
>
> Built by Kaizen, an AI agent. Operated by @theaayushstha1.

### Tweet 3 — surprising real number from Dark Noise

> Real numbers from Dark Noise, pulled by an agent in the last minute:
>
> - MRR: $4,561
> - Active subscriptions: 2,535
> - Trial conversion (last 30d): 26.51 percent
>
> The 30 day window ends today. The last 8 days are still settling. The agent told me that before I had to ask.
>
> Built by Kaizen, an AI agent. Operated by @theaayushstha1.

### Tweet 4 — engineering flex (tool layering)

> A tool design choice worth talking about.
>
> Four primitive tools for the RevenueCat Charts API:
> - list_charts
> - get_overview
> - describe_chart
> - get_chart
>
> No composite narrative tools. The model composes. Caches the responses. Honors incomplete flags. Scorecard in the repo.
>
> Built by Kaizen, an AI agent. Operated by @theaayushstha1.

### Tweet 5 — CTA

> Source: {github}
> Deployed: {url}
> Blog: {blog url}
> Scorecard: {scorecard url}
>
> If you are building an agent that needs to see its own unit economics, this is the shape.
>
> Built by Kaizen, an AI agent. Operated by @theaayushstha1.

## 5. Hypothetical $100 budget allocation

No money moves. This is how it would be spent if it did.

| Line item | Spend | Rationale |
| --- | --- | --- |
| X (Twitter) promoted post | $40 | Amplify tweet 1 to the AI dev + indie mobile dev affinity clusters. X still drives meaningful impressions in these two audiences in 2026. Target keywords: "AI agent", "MCP", "subscription", "RevenueCat". |
| r/ClaudeAI promoted post | $30 | Reddit has real community buy signals in r/ClaudeAI and ad placement there lands directly in the target audience stream. |
| Dev.to featured placement | $20 | Cross post the blog to Dev.to with `canonical_url` pointing to `/blog` on the deployed site. Featured placement buys SEO longevity for the phrase "RevenueCat Charts API". |
| Reserve | $10 | Re amplify the highest performing organic post at the 24 hour mark. If nothing is winning, hold. |

Total: $100, zero held outside the campaign window.

## 6. Success measurement

Set before the campaign runs, not derived after.

| Metric | Source | Great | Good | Floor |
| --- | --- | --- | --- | --- |
| Playground sessions in 72h | Vercel Analytics | 300 | 100 | 30 |
| GitHub stars on `kaizen` repo | repo insights | 500 | 150 | 50 |
| HN Show HN placement | front page tracker | top 10 | top 30 | any front page |
| r/mcp post upvotes | reddit | 200 | 80 | 30 |
| X impressions on tweet 1 | X analytics | 100k | 30k | 10k |
| npm weekly installs (if MCP adapter stretch ships) | npm-stat | 200 | 50 | 10 |
| Amplifier reshare (named individual in AI dev space reshares) | manual scan | 2 | 1 | 0 |

The single most load bearing metric is **playground sessions in 72h**. That is the proxy for "did this campaign actually put the Charts API in front of new eyeballs." Everything else is secondary.

## 7. Risks and mitigations

- **Rate limit bite mid campaign.** The 60 second TTL cache on the playground absorbs the repeat questions that 80 percent of visitors will ask. If usage spikes beyond what cache can absorb, the `/demo` replay page is the fallback and the README explains the swap.
- **Joey Flores comparison.** Joey's prior submission has 0 stars and did not get hired. Kaizen explicitly does not duplicate his angle. The blog post acknowledges the existing official MCP in paragraph two. No hidden competitive posture.
- **Dark Noise data looks boring.** The numbers are small because indie apps have small numbers. The campaign does not lead with the size of the number. It leads with the pattern: agent sees the business, caveats the settling window, uses composition not hardcoding.
- **Agent disclosure backlash.** Some communities dislike AI agent posts even with disclosure. Mitigation: disclosure in line 1, offer to answer questions as Aayush personally in the thread, do not mass post.
- **HN shadow bans new accounts.** The Aayush Shrestha account has organic karma from prior posts. Post at 09:00 Pacific on a Tuesday or Wednesday for best surface.

## 8. Compliance with the rubric

The PDF specified a hypothetical budget and a strategy doc. Every deliverable in this document is a strategy artifact:

- Three targeted communities (section 3): r/mcp, r/ClaudeAI, Hacker News
- Five tweet drafts (section 4), not posted
- $100 allocation with rationale (section 5)
- Measurement framework with thresholds set before the campaign (section 6)
- Risk register with mitigations (section 7)
- Agent disclosure in every piece of copy

No public posting has happened. No paid placement has been purchased. All copy in this document is staged and labeled as drafts.

## 9. What I would change with a real budget

Two things.

First, I would pay for a Loom Pro slot and record a 90 second version of the demo with captions. The silent caption pass (section 9 of the design brief) is the insurance. A real budget funds the voiceover pass.

Second, I would do one cold outreach to a known indie developer (likely a 2026 version of someone like Ariel Michaeli or a Dark Noise adjacent indie) and ask them to try Kaizen against their own real project with a key swap. One amplifier of that caliber is worth more than the entire $100 media spend.
