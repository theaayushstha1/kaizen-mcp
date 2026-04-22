#!/usr/bin/env node
// H0 probe round 2: correct date format, remaining chart names, chart data shape.

import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
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
const BASE = 'https://api.revenuecat.com/v2';
const OUT = resolve('scripts/.probe-out');
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const GAP = 4500;
const PROJECT_ID = 'proj058a6330';

async function hit(path, tag) {
  const url = `${BASE}${path}`;
  const t0 = Date.now();
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${KEY}`, Accept: 'application/json' },
  });
  const ms = Date.now() - t0;
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  writeFileSync(resolve(OUT, `${tag}.json`), JSON.stringify({ status: res.status, ms, headers: Object.fromEntries(res.headers.entries()), url, body: json }, null, 2));
  console.log(`[${res.status}] ${ms}ms ${path}`);
  return { status: res.status, ms, json };
}

// Date helpers — the API wants ISO date strings, not Unix timestamps
function isoDate(d) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

async function main() {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
  const startStr = isoDate(start);
  const endStr = isoDate(end);

  console.log('--- round 2a: probe missing chart names ---');
  const MISSING = [
    'actives_new',
    'customers_new',
    'customers_active',
    'refund_rate',
    'subscription_retention',
    'subscription_status',
    'trials',
    'trials_movement',
    'trials_new',
  ];
  for (const name of MISSING) {
    await sleep(GAP);
    await hit(`/projects/${PROJECT_ID}/charts/${name}/options`, `5_options_${name}`);
  }

  console.log('\n--- round 2b: chart data with correct date format ---');
  const TEST_CHARTS = ['mrr', 'actives', 'trial_conversion_rate'];
  for (const name of TEST_CHARTS) {
    await sleep(GAP);
    await hit(`/projects/${PROJECT_ID}/charts/${name}?resolution=day&start_date=${startStr}&end_date=${endStr}`, `6_chart_${name}_daily`);
  }

  console.log('\n--- round 2c: chart data at month resolution ---');
  const monthStart = isoDate(new Date(end.getTime() - 365 * 24 * 60 * 60 * 1000));
  for (const name of ['mrr', 'revenue']) {
    await sleep(GAP);
    await hit(`/projects/${PROJECT_ID}/charts/${name}?resolution=month&start_date=${monthStart}&end_date=${endStr}`, `7_chart_${name}_monthly`);
  }

  console.log('\n--- round 2d: segmented chart data ---');
  await sleep(GAP);
  // Pull MRR segmented by store (which we learned from /options)
  await hit(
    `/projects/${PROJECT_ID}/charts/mrr?resolution=week&start_date=${isoDate(new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000))}&end_date=${endStr}&segment=store`,
    '8_chart_mrr_by_store',
  );

  console.log('\ndone.');
}

main().catch((e) => { console.error(e); process.exit(1); });
