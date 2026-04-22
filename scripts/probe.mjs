#!/usr/bin/env node
// H0 probe: discover project_id, enumerate valid chart names, document shapes.
// Respects rate limits (5/min overview, 15/min chart endpoints).
// Saves raw responses to scripts/.probe-out/ for reference.

import { mkdirSync, writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
);

const KEY = env.RC_CHARTS_API_KEY;
if (!KEY) {
  console.error('RC_CHARTS_API_KEY missing from .env');
  process.exit(1);
}

const BASE = 'https://api.revenuecat.com/v2';
const OUT = resolve('scripts/.probe-out');
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CHART_GAP_MS = 4500; // 15/min = one every 4s, 4.5s for safety
const OVERVIEW_GAP_MS = 13000; // 5/min = one every 12s, 13s safety

async function hit(path, { tag } = {}) {
  const url = `${BASE}${path}`;
  const t0 = Date.now();
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${KEY}`,
      Accept: 'application/json',
    },
  });
  const ms = Date.now() - t0;
  const retryAfter = res.headers.get('retry-after');
  const rateHdrs = {
    'retry-after': retryAfter,
    'x-ratelimit-limit': res.headers.get('x-ratelimit-limit'),
    'x-ratelimit-remaining': res.headers.get('x-ratelimit-remaining'),
    'x-ratelimit-reset': res.headers.get('x-ratelimit-reset'),
  };
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  const label = tag || path.replace(/[^a-z0-9]/gi, '_');
  writeFileSync(resolve(OUT, `${label}.json`), JSON.stringify({ status: res.status, ms, rateHdrs, url, body: json }, null, 2));
  console.log(`[${res.status}] ${ms}ms ${path}${retryAfter ? ` (retry-after=${retryAfter})` : ''}`);
  return { status: res.status, ms, rateHdrs, json };
}

const CANDIDATES = [
  'actives',
  'active_subscriptions',
  'mrr',
  'arr',
  'revenue',
  'churn',
  'subscribers',
  'new_customers',
  'trial_conversion_rate',
  'conversion_to_paying',
  'cohort_explorer',
  'ltv_per_customer',
  'ltv_per_paying_customer',
  'subscriber_lifetime_value',
  'refunds',
  'transactions',
  'initial_conversion',
  'actives_movement',
  'mrr_movement',
  'revenue_churn',
];

async function main() {
  console.log('--- step 1: list projects ---');
  const projects = await hit('/projects', { tag: '1_projects' });
  if (projects.status !== 200) {
    console.error('Projects endpoint failed. Likely scope issue. Trying /projects?limit=20');
    await sleep(2000);
    await hit('/projects?limit=20', { tag: '1b_projects_limit' });
  }

  // Try to find a project id from the response
  const items = projects.json?.items || projects.json?.data || [];
  const projectId = items[0]?.id || items[0]?.project_id;
  if (!projectId) {
    console.warn('\nCould not auto-detect project_id from /projects response. Inspect scripts/.probe-out/1_projects.json manually.');
    return;
  }
  console.log(`\n[project_id] ${projectId} (${items[0]?.display_name || items[0]?.name || 'unnamed'})`);
  writeFileSync(resolve(OUT, '_project_id.txt'), projectId);

  await sleep(CHART_GAP_MS);
  console.log('\n--- step 2: overview ---');
  await hit(`/projects/${projectId}/metrics/overview`, { tag: '2_overview' });

  console.log('\n--- step 3: probe each chart name via /options ---');
  const valid = [];
  const invalid = [];
  for (const name of CANDIDATES) {
    await sleep(CHART_GAP_MS);
    const r = await hit(`/projects/${projectId}/charts/${name}/options`, { tag: `3_options_${name}` });
    if (r.status >= 200 && r.status < 300) valid.push(name);
    else invalid.push({ name, status: r.status });
  }

  console.log('\n--- step 4: sample a few valid charts (daily, short range) ---');
  const SAMPLE = valid.slice(0, 3);
  for (const name of SAMPLE) {
    await sleep(CHART_GAP_MS);
    // End now, start 30 days ago, resolution day
    const now = Math.floor(Date.now() / 1000);
    const start = now - 30 * 24 * 60 * 60;
    await hit(`/projects/${projectId}/charts/${name}?resolution=day&start_date=${start}&end_date=${now}`, { tag: `4_chart_${name}` });
  }

  writeFileSync(
    resolve(OUT, '_summary.json'),
    JSON.stringify({ projectId, valid, invalid, sampled: SAMPLE }, null, 2),
  );

  console.log('\n=== summary ===');
  console.log('project_id:', projectId);
  console.log('valid chart names:', valid);
  console.log('invalid:', invalid);
  console.log('see scripts/.probe-out/ for raw responses');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
