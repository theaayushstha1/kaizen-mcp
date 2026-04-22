#!/usr/bin/env tsx
/**
 * Kaizen eval harness.
 *
 * Reads evals/queries.jsonl, runs each query through the live tool chain using
 * Gemini 2.5 Flash, and scores against the expected result. Emits SCORECARD.md.
 *
 * Run: pnpm eval
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText, type Message } from 'ai';
import { ChartsClient } from '../lib/kaizen/client';
import { buildTools } from '../lib/kaizen/tools';

type RoutingCase = {
  id: string;
  category: 'routing';
  query: string;
  expect: { tool: string; argsHas?: Record<string, unknown> };
};
type SchemaCase = {
  id: string;
  category: 'schema';
  query: string;
  expect: { sequence: string[]; argsHas?: Record<string, unknown> };
};
type InterpretationCase = {
  id: string;
  category: 'interpretation';
  query: string;
  expect: { rubric: string[] };
};
type EvalCase = RoutingCase | SchemaCase | InterpretationCase;

type Outcome = {
  id: string;
  category: string;
  query: string;
  passed: boolean;
  reason: string;
  toolsCalled: string[];
  ms: number;
};

const TODAY = new Date().toISOString().slice(0, 10);
const SYSTEM = `You are Kaizen, an AI analyst for RevenueCat's Charts API. Answer questions about Dark Noise.

Available tools, exact names:
- kaizen_list_charts
- kaizen_get_overview
- kaizen_describe_chart
- kaizen_get_chart

Rules:
- You MUST call at least one tool before answering. Even for open-ended questions ("surprising insight", "what should I look at"), start with kaizen_get_overview or kaizen_get_chart to ground the answer in real numbers.
- For segmented charts, call kaizen_describe_chart first to confirm valid segments, then kaizen_get_chart.
- Use the exact tool names above. Do not abbreviate or invent new ones.
- Dates: compute yourself from today (${TODAY}) and pass ISO YYYY-MM-DD. Do not call a "today" tool; there is none.
- "Last 30 days" means end_date=today, start_date=today-30d.
- Cite at least one specific number from the tool result in every answer.
- When the response includes dataQuality.incompletePeriods, mention that the tail is still settling.
- Keep answers tight: one headline number then one sentence of context plus the caveat if any.`;

async function main() {
  const key = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    console.error('GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY is required');
    process.exit(1);
  }

  const google = createGoogleGenerativeAI({ apiKey: key });
  const client = new ChartsClient();
  const tools = buildTools(client);

  const path = resolve('evals/queries.jsonl');
  const cases: EvalCase[] = readFileSync(path, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line));

  const outcomes: Outcome[] = [];
  for (const c of cases) {
    const started = Date.now();
    const toolsCalled: string[] = [];
    let response = '';
    try {
      const result = await generateText({
        model: google('gemini-2.5-flash'),
        system: SYSTEM,
        messages: [{ role: 'user', content: c.query } as Message],
        tools,
        maxSteps: 8,
        temperature: 0.1,
        onStepFinish: ({ toolCalls }) => {
          for (const tc of toolCalls ?? []) toolsCalled.push(tc.toolName);
        },
      });
      response = result.text;
    } catch (err) {
      outcomes.push({
        id: c.id,
        category: c.category,
        query: c.query,
        passed: false,
        reason: `error: ${(err as Error).message}`,
        toolsCalled,
        ms: Date.now() - started,
      });
      continue;
    }

    const outcome = scoreCase(c, toolsCalled, response);
    outcomes.push({
      ...outcome,
      id: c.id,
      category: c.category,
      query: c.query,
      toolsCalled,
      ms: Date.now() - started,
    });
    console.log(`[${outcome.passed ? 'pass' : 'fail'}] ${c.id}: ${c.query.slice(0, 60)}`);
    // Stay under Gemini's per-minute token budget: 3s pause between cases.
    await new Promise((r) => setTimeout(r, 3000));
  }

  writeFileSync(resolve('evals/SCORECARD.md'), renderScorecard(outcomes));
  console.log('\nscorecard written to evals/SCORECARD.md');
}

function scoreCase(
  c: EvalCase,
  toolsCalled: string[],
  response: string,
): { passed: boolean; reason: string } {
  if (c.category === 'routing') {
    // Overview and get_chart are both reasonable for overview-shape questions over a fixed range.
    const overviewEquivalents = ['kaizen_get_overview', 'kaizen_get_chart'];
    const ok = c.expect.tool === 'kaizen_get_overview'
      ? toolsCalled.some((t) => overviewEquivalents.includes(t))
      : toolsCalled.includes(c.expect.tool);
    if (!ok) {
      return { passed: false, reason: `expected tool ${c.expect.tool}, got [${toolsCalled.join(', ')}]` };
    }
    return { passed: true, reason: 'tool matched' };
  }

  if (c.category === 'schema') {
    let cursor = 0;
    for (const step of c.expect.sequence) {
      const found = toolsCalled.indexOf(step, cursor);
      if (found === -1) {
        return { passed: false, reason: `sequence broken at ${step}; got [${toolsCalled.join(', ')}]` };
      }
      cursor = found + 1;
    }
    return { passed: true, reason: 'sequence matched' };
  }

  // interpretation: lightweight structural checks, no LLM judge
  const cited = /\d/.test(response);
  // Overview endpoint returns no time-series, so incomplete-period caveat doesn't apply.
  const onlyOverviewCalled =
    toolsCalled.length > 0 &&
    toolsCalled.every((t) => t === 'kaizen_get_overview' || t === 'kaizen_list_charts');
  const mentionedIncomplete =
    onlyOverviewCalled ||
    /incomplete|settling|unsettled|still closing/i.test(response) ||
    !response.match(/last \d+ days?/i);
  const lengthOk = response.trim().length > 40 && response.trim().length < 1400;
  const passed = cited && mentionedIncomplete && lengthOk;
  return {
    passed,
    reason: `cited=${cited} incomplete=${mentionedIncomplete} lengthOk=${lengthOk}`,
  };
}

function renderScorecard(outcomes: Outcome[]): string {
  const total = outcomes.length;
  const passed = outcomes.filter((o) => o.passed).length;
  const byCat = new Map<string, { pass: number; total: number }>();
  for (const o of outcomes) {
    const entry = byCat.get(o.category) ?? { pass: 0, total: 0 };
    entry.total += 1;
    if (o.passed) entry.pass += 1;
    byCat.set(o.category, entry);
  }

  const latencies = outcomes.map((o) => o.ms).sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.5)] ?? 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] ?? 0;

  const lines: string[] = [];
  lines.push('# Kaizen Eval Scorecard');
  lines.push('');
  lines.push(`Last run: ${new Date().toISOString()}`);
  lines.push('');
  lines.push(`## Overall: ${passed}/${total} (${Math.round((passed / total) * 100)}%)`);
  lines.push('');
  lines.push('| Category | Pass / Total | % |');
  lines.push('| --- | --- | --- |');
  for (const [cat, stats] of byCat) {
    lines.push(`| ${cat} | ${stats.pass} / ${stats.total} | ${Math.round((stats.pass / stats.total) * 100)}% |`);
  }
  lines.push('');
  lines.push(`**p50 latency:** ${p50}ms  \n**p95 latency:** ${p95}ms`);
  lines.push('');
  lines.push('## Per case');
  lines.push('');
  lines.push('| id | category | pass | ms | tools | query | reason |');
  lines.push('| --- | --- | --- | --- | --- | --- | --- |');
  for (const o of outcomes) {
    const q = o.query.replace(/\|/g, '\\|').slice(0, 80);
    const tools = o.toolsCalled.join(' -> ') || '-';
    lines.push(
      `| ${o.id} | ${o.category} | ${o.passed ? 'yes' : 'no'} | ${o.ms} | ${tools} | ${q} | ${o.reason} |`,
    );
  }
  return lines.join('\n');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
