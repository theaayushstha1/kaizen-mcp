'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function BlogPost() {
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowBack(window.scrollY > 200);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <main className="mx-auto max-w-[640px] px-6 py-10">
        <Header cacheLabel="reading 9 min" />

        <article className="mt-10">
          <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-ink-muted">
            Kaizen <span className="text-line">/</span> Essay
          </div>
          <h1 className="text-3xl font-semibold leading-9 tracking-tight text-ink">
            Your agent is a customer now.
          </h1>
          <p className="mt-3 text-[13px] text-ink-muted">
            Aayush Shrestha <span className="text-line">·</span> 2026-04-21{' '}
            <span className="text-line">·</span> 9 min read
          </p>

          <div className="mt-10 space-y-5 text-[15px] leading-[26px] text-ink">
            <p>
              A solo dev can stand up a subscription app in an afternoon now. React Native via an agent,
              backend via an agent, paywall copy via an agent, app store screenshots via an agent. The
              unit economics of shipping have collapsed. What has not collapsed is the unit economics of{' '}
              <em>running</em> the thing once it is live.
            </p>

            <p>
              The agent that shipped your app cannot tell you whether it is profitable. It does not know
              what your MRR did last Tuesday, whether churn is trending up on Android, whether your trial
              conversion rate on the new paywall is better or worse than the old one. It does not know
              because it has no eyes on the numbers. It is flying your business blind the same day it
              launched it.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">The Charts API is the eyes</h2>

            <p>
              RevenueCat publishes a v2 REST API called Charts. It exposes the same 21 metrics the
              RevenueCat dashboard shows you: MRR, ARR, active subscriptions, trial conversion, customer
              counts, churn, refunds, LTV per customer, and a dozen more. Every metric is queryable at
              day, week, or month resolution, segmentable by store, country, platform, product, and a
              long list of other axes. Rate limits are 15 requests per minute on chart endpoints and 5
              per minute on the overview endpoint.
            </p>

            <p>
              The API is the thing an agent needs to see its own business. It is also the thing
              RevenueCat has already wrapped in a first party Model Context Protocol server, launched in
              July 2025, that exposes all 21 metrics as MCP tools. So the plumbing is done. Any Claude
              Desktop user can install it with one command and start asking questions.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">
              The thing the official tool does not solve
            </h2>

            <p>
              Installing an MCP server is a step. It is a small step. It is still a step. For a
              reviewer, a growth blogger, a recruiter, a prospective customer who wants to see what the
              API feels like, it is one step too many. You want to click a URL and see an agent thinking
              against real data in under five seconds. Not read install instructions, not edit a config
              file, not restart your desktop client.
            </p>

            <p>
              That gap is what Kaizen closes. Kaizen is a web app, not an MCP server. You open the URL,
              it is already connected to a real indie app&rsquo;s RevenueCat project (Dark Noise, a
              weather app on iOS), the agent is pre warmed with the current overview, and the first
              question you type is already running inside the chat pane. Zero install, zero auth, zero
              friction.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">
              What Kaizen actually is, in 90 seconds
            </h2>

            <p>
              Kaizen is an AI analyst that speaks the RevenueCat Charts API. Under the hood there are
              four primitive tools: <InlineCode>list_charts</InlineCode>,{' '}
              <InlineCode>get_overview</InlineCode>, <InlineCode>describe_chart</InlineCode>, and{' '}
              <InlineCode>get_chart</InlineCode>. No composite narrative tools, no LLM reasoning baked
              into the tool layer. Primitive calls, model composition on top. That layering is load
              bearing and I will come back to it.
            </p>

            <p>
              The model is Gemini 2.5 Flash, chosen for tool latency and cost. It sees the system
              prompt, the 21 legal chart names, and the four tools. It decides when to call what. The
              route is a Next.js App Router handler using the AI SDK v4{' '}
              <InlineCode>streamText</InlineCode> helper with <InlineCode>maxSteps: 8</InlineCode>, so
              the model can loop if it needs to first call <InlineCode>describe_chart</InlineCode>{' '}
              before calling <InlineCode>get_chart</InlineCode> with a segment.
            </p>

            <p>
              The UI is one page. One chat panel, one input, one footer. No sidebar, no dashboard, no
              settings. The only chrome is a tiny cache age indicator in the header, because the second
              and third and fourth questions you ask should not cost a round trip.
            </p>

            <p>Here is the whole shape on one page.</p>

            <figure className="my-6">
              <ArchitectureDiagram />
              <figcaption className="mt-3 text-center text-[12px] text-ink-muted">
                Same engine, two surfaces. Web for humans, stdio MCP for agent clients.
              </figcaption>
            </figure>

            <p>
              The four primitive tools live in <InlineCode>lib/kaizen/tools.ts</InlineCode>. The web chat
              imports them through the AI SDK. The MCP adapter at <InlineCode>bin/mcp.ts</InlineCode>{' '}
              rewraps the same four functions over stdio. Same engine, two surfaces: a URL for humans,
              a CLI for agents. Neither path duplicates the official MCP server, because both sit on top
              of the four primitives and let the model compose.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">A real answer from a real app</h2>

            <p>
              I asked Kaizen: <em>what is the trial conversion rate?</em> Here is what it returned,
              verbatim, to a reviewer sitting at localhost:3000 on 2026-04-22 UTC:
            </p>

            <blockquote className="my-4 border-l-2 border-sage bg-sage-soft py-3 pl-4 text-ink">
              The average trial conversion rate over the last 30 days (March 23, 2026 to April 22, 2026)
              was 26.51%. Data for the period of April 14, 2026 to April 22, 2026 is still settling.
            </blockquote>

            <p>
              Two things are happening in that answer that matter. The first is the number. 26.51% is a
              real number. It comes from a real Charts API call with a real ISO date range. The agent
              did not hallucinate a range, it computed 30 days back from today.
            </p>

            <p>
              The second is the caveat. The Charts API returns a boolean{' '}
              <InlineCode>incomplete</InlineCode> flag on every data point. Periods that are still
              settling, usually the most recent bucket, have it set to true. The official dashboard
              surfaces it as a visual state. A naive API consumer drops the flag on the floor and
              reports the raw number. Kaizen does not. It filters incomplete rows out of summary
              statistics and echoes them back as <InlineCode>dataQuality.incompletePeriods</InlineCode>{' '}
              so the model can caveat in the prose.
            </p>

            <p>
              That second sentence in the answer is the entire product. An agent that looks at your
              business is only useful if it knows which numbers are real and which ones will move
              before lunch.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">
              The engineering that makes it cheap to use
            </h2>

            <p>
              The Charts API has a 15 per minute rate limit on chart endpoints and a 5 per minute rate
              limit on the overview endpoint. Those limits are fine for a single reviewer with a single
              tab open, but a playground served to strangers on the internet hits them immediately
              unless you cache.
            </p>

            <p>
              Kaizen runs an in memory TTL cache keyed by{' '}
              <InlineCode>(projectId, chartName, paramsHash)</InlineCode>. TTL is 60 seconds. The first
              person who asks about MRR for the last 30 days pays the 400 millisecond round trip. The
              next dozen people get the answer back in under 5 milliseconds. When the cache is hot the
              tool chip in the UI shows <InlineCode>cached</InlineCode> next to the timing so a
              reviewer sees why the second question returned instantly.
            </p>

            <p>
              The retry layer is exponential backoff with jitter, capped at three attempts, with{' '}
              <InlineCode>Retry-After</InlineCode> respected when the API actually gives us one on a
              429. The rate limit headers the API returns are called{' '}
              <InlineCode>revenuecat-rate-limit-current-limit</InlineCode> and{' '}
              <InlineCode>revenuecat-rate-limit-current-usage</InlineCode>, which I mention only because
              the AI SDK and common HTTP clients expect <InlineCode>x-ratelimit-*</InlineCode> and the
              RevenueCat naming is not that. If you are building against this API the first thing you
              will do wrong is read the wrong header.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">Why four tools and not one</h2>

            <p>
              A common shape for agent tools is the composite narrative tool. You write one big tool
              called <InlineCode>summarize_business</InlineCode> that does three Charts API calls and
              reasons about the result, and you call it from the model. That layering feels clever
              until the model asks a question that does not fit the summary you hardcoded.
            </p>

            <p>
              Kaizen exposes the four primitives separately. The model composes. If it wants MRR broken
              down by store for the last 90 days, it calls <InlineCode>describe_chart</InlineCode> to
              learn that <InlineCode>store</InlineCode> is a valid segment for MRR, then it calls{' '}
              <InlineCode>get_chart</InlineCode> with the right args. That two step dance is exactly
              the behavior I wanted from the tool interface. Every chart has a different set of valid
              segments. Hardcoding the enum is brittle. Letting the model discover it at call time is
              robust.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">What this does not try to do</h2>

            <p>
              Kaizen does not try to be the RevenueCat dashboard. It does not draw charts. It does not
              render tables. It does not offer export. If you want visuals, open the dashboard. Kaizen
              is a chat that does analysis, and the output is prose with numbers in it. That is a
              deliberate scope cut.
            </p>

            <p>
              It also does not try to replace the first party MCP server. The MCP server is the agent
              dev tool. Kaizen is the zero install web playground. They are complementary. The blog,
              the video, the growth strategy around Kaizen all point an audience at the Charts API.
              The MCP server is where that audience lands if they want to wire an agent of their own
              into their real project.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">
              What agents actually need from data APIs
            </h2>

            <p>Three things, ordered by how often API designers forget them.</p>

            <p>
              <strong>Introspection.</strong> The agent needs a way to ask the API what it can answer
              before it asks a specific question. Charts gets this right with{' '}
              <InlineCode>/options</InlineCode>. Most REST APIs do not.
            </p>

            <p>
              <strong>Data quality surfaced at the row level.</strong> Incomplete, missing, stale,
              estimated: the agent needs a per row boolean so it can caveat without asking you. Charts
              gets this right with <InlineCode>incomplete</InlineCode>.
            </p>

            <p>
              <strong>Consistent time.</strong> ISO dates in, Unix seconds out, same envelope for every
              endpoint. Charts is consistent here too. A small thing, but the agent never has to
              translate.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">The receipts</h2>

            <p>
              The repo has a committed eval harness with 30 queries across routing, schema discovery,
              and interpretation tiers. Current scorecard is published in{' '}
              <Link
                className="text-ink underline underline-offset-4 decoration-line transition-colors hover:text-sage hover:decoration-sage"
                href="https://github.com/theaayushstha1/kaizen"
              >
                SCORECARD.md
              </Link>
              . Cold install to first answer is under sixty seconds. No 429s in a thousand query stress
              run. The process log with token counts and Claude spend is in{' '}
              <InlineCode>docs/PROCESS.md</InlineCode>.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">Try it</h2>

            <p>
              The deployed URL is linked from{' '}
              <Link
                className="text-ink underline underline-offset-4 decoration-line transition-colors hover:text-sage hover:decoration-sage"
                href="https://github.com/theaayushstha1/kaizen"
              >
                the README
              </Link>
              . Type a question, watch the tool chip trace pop open, read the caveat about incomplete
              periods. If it surprises you, good. If it misses something, the eval harness is open
              source and the queries file is a jsonl. Send a PR.
            </p>

            <h2 className="pt-6 text-xl font-semibold text-ink">One last thing</h2>

            <p>
              The title of this post is the thesis. Your agent is a customer now. Not your employee,
              not your tool. Your customer. It needs dashboards, it needs unit economics, it needs to
              know which periods are still settling. The companies that hand their APIs to agents the
              same way they hand them to humans, with introspection and data quality flags and
              consistent envelopes, are the ones agents will keep recommending a year from now.
            </p>

            <p>RevenueCat did that. This post is the nudge.</p>
          </div>
        </article>

        <div className="mt-14 border-t border-line pt-6">
          <Footer />
        </div>
      </main>

      {showBack && (
        <a
          href="/"
          aria-label="Back to home"
          className="fixed bottom-6 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-ink font-mono text-[11px] text-white transition-colors hover:bg-sage"
        >
          back
        </a>
      )}
    </>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded border border-line bg-paper px-1.5 py-0.5 font-mono text-[12.5px] text-ink">
      {children}
    </code>
  );
}

function ArchitectureDiagram() {
  const box = 'fill-surface stroke-line';
  const label = 'fill-ink font-mono';
  const muted = 'fill-ink-muted font-mono';
  const accent = 'fill-sage-soft stroke-sage';
  const arrow = 'stroke-ink-muted';

  return (
    <svg
      viewBox="0 0 720 420"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Kaizen architecture: browser chat UI and MCP stdio adapter both call a shared engine that wraps the RevenueCat Charts v2 API"
      className="w-full rounded border border-line bg-paper"
    >
      <defs>
        <marker id="arrowhead" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L10,5 L0,10 z" className="fill-ink-muted" />
        </marker>
      </defs>

      <rect x="24" y="60" width="180" height="110" rx="8" className={box} strokeWidth="1" />
      <text x="114" y="86" textAnchor="middle" className={label} fontSize="13" fontWeight="600">browser</text>
      <text x="114" y="110" textAnchor="middle" className={muted} fontSize="11">chat ui</text>
      <text x="114" y="128" textAnchor="middle" className={muted} fontSize="11">useChat()</text>
      <text x="114" y="152" textAnchor="middle" className={muted} fontSize="10">tool chips · reasoning trace</text>

      <rect x="270" y="40" width="200" height="150" rx="8" className={box} strokeWidth="1" />
      <text x="370" y="66" textAnchor="middle" className={label} fontSize="13" fontWeight="600">vercel edge</text>
      <text x="370" y="92" textAnchor="middle" className={muted} fontSize="11">/api/chat</text>
      <text x="370" y="110" textAnchor="middle" className={muted} fontSize="11">streamText · maxSteps: 8</text>
      <text x="370" y="132" textAnchor="middle" className={muted} fontSize="11">Gemini 2.5 Flash</text>
      <rect x="290" y="148" width="160" height="28" rx="4" className={accent} strokeWidth="1" />
      <text x="370" y="167" textAnchor="middle" className={muted} fontSize="10">tool decision loop</text>

      <rect x="540" y="60" width="160" height="110" rx="8" className={box} strokeWidth="1" />
      <text x="620" y="86" textAnchor="middle" className={label} fontSize="13" fontWeight="600">RevenueCat v2</text>
      <text x="620" y="108" textAnchor="middle" className={muted} fontSize="10">/metrics/overview</text>
      <text x="620" y="126" textAnchor="middle" className={muted} fontSize="10">/charts/{`{n}`}/options</text>
      <text x="620" y="144" textAnchor="middle" className={muted} fontSize="10">/charts/{`{n}`}</text>
      <text x="620" y="164" textAnchor="middle" className={muted} fontSize="9">incomplete flag per row</text>

      <rect x="220" y="240" width="300" height="140" rx="8" className={box} strokeWidth="1" />
      <text x="370" y="266" textAnchor="middle" className={label} fontSize="13" fontWeight="600">lib/kaizen/ (shared engine)</text>
      <rect x="240" y="282" width="130" height="32" rx="4" className={accent} strokeWidth="1" />
      <text x="305" y="302" textAnchor="middle" className={muted} fontSize="11">tools.ts · 4 primitives</text>
      <rect x="380" y="282" width="120" height="32" rx="4" className={accent} strokeWidth="1" />
      <text x="440" y="302" textAnchor="middle" className={muted} fontSize="11">client.ts · retry</text>
      <rect x="240" y="322" width="130" height="32" rx="4" className={accent} strokeWidth="1" />
      <text x="305" y="342" textAnchor="middle" className={muted} fontSize="11">cache.ts · 60s TTL</text>
      <rect x="380" y="322" width="120" height="32" rx="4" className={accent} strokeWidth="1" />
      <text x="440" y="342" textAnchor="middle" className={muted} fontSize="11">incomplete.ts</text>

      <rect x="540" y="260" width="160" height="100" rx="8" className={box} strokeWidth="1" strokeDasharray="4 3" />
      <text x="620" y="286" textAnchor="middle" className={label} fontSize="13" fontWeight="600">bin/mcp.ts</text>
      <text x="620" y="308" textAnchor="middle" className={muted} fontSize="11">stdio adapter</text>
      <text x="620" y="326" textAnchor="middle" className={muted} fontSize="10">Claude Desktop</text>
      <text x="620" y="342" textAnchor="middle" className={muted} fontSize="10">Cursor · any MCP client</text>

      <line x1="204" y1="115" x2="268" y2="115" className={arrow} strokeWidth="1.3" markerEnd="url(#arrowhead)" />
      <text x="236" y="107" textAnchor="middle" className={muted} fontSize="9">POST /api/chat</text>
      <text x="236" y="128" textAnchor="middle" className={muted} fontSize="9">stream tokens</text>

      <line x1="472" y1="115" x2="538" y2="115" className={arrow} strokeWidth="1.3" markerEnd="url(#arrowhead)" />
      <text x="505" y="107" textAnchor="middle" className={muted} fontSize="9">https</text>

      <line x1="370" y1="192" x2="370" y2="238" className={arrow} strokeWidth="1.3" markerEnd="url(#arrowhead)" />
      <text x="412" y="218" textAnchor="middle" className={muted} fontSize="9">tool call</text>

      <line x1="522" y1="310" x2="538" y2="310" className={arrow} strokeWidth="1.3" markerEnd="url(#arrowhead)" />
      <text x="530" y="298" textAnchor="middle" className={muted} fontSize="9">reuses</text>

      <line x1="620" y1="258" x2="620" y2="172" className={arrow} strokeWidth="1.3" strokeDasharray="4 3" markerEnd="url(#arrowhead)" />
    </svg>
  );
}
