#!/usr/bin/env node
/**
 * Playwright demo for Kaizen @ 1920x1080, synced to the Kokoro voiceover.
 *
 * Beats are wall-clocked to the measured narration timeline (see
 * /tmp/voice-timeline.json from scripts/gen-segments.py). Each `waitUntil`
 * sleeps until that absolute second of the recording — keeps the visuals
 * locked to the voiceover regardless of how long a tool call takes.
 *
 *   name       narration    action
 *   hero       0.0  → 20.8   playground loads, dwell
 *   darknoise  21.1 → 31.1   hover input, pre-click
 *   q1         31.5 → 46.4   type "How is Dark Noise doing right now", overview
 *   q2         46.7 → 64.8   type "Break down MRR by store this quarter"
 *   trace      65.2 → 79.3   open reasoning trace panel
 *   blog       79.6 → 93.9   navigate to blog post, read intro
 *   diagram    94.2 → 107.7  scroll to SVG architecture diagram
 *   repo       108.0 → 118.9 GitHub repo homepage + README
 *   mcp        119.2 → 131.1 terminal: npx -y kaizen-mcp
 *   scorecard  131.5 → 140.5 SCORECARD.md scroll
 *   process    140.8 → 149.5 PROCESS.md scroll
 *   signoff    149.8 → 154.3 final dwell
 *
 * Run: KAIZEN_VIDEO=1 node scripts/demo-recorder.mjs
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const URL = process.env.KAIZEN_URL ?? 'https://kaizen-silk.vercel.app';
const BLOG_URL = `${URL}/blog/your-agent-is-a-customer-now`;
const REPO_URL = 'https://github.com/theaayushstha1/kaizen-mcp';
const SCORECARD_URL = `${REPO_URL}/blob/main/evals/SCORECARD.md`;
const PROCESS_URL = `${REPO_URL}/blob/main/docs/PROCESS.md`;
const RECORD_VIDEO = process.env.KAIZEN_VIDEO === '1';
const VIDEO_DIR = resolve('docs/assets/demo-video');
if (RECORD_VIDEO) mkdirSync(VIDEO_DIR, { recursive: true });

const W = 1920;
const H = 1080;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Beats from /tmp/voice-timeline.json, in seconds.
const T = {
  hero:      { start: 0.0,   end: 20.8 },
  darknoise: { start: 21.1,  end: 31.1 },
  q1:        { start: 31.5,  end: 46.4 },
  q2:        { start: 46.7,  end: 64.8 },
  trace:     { start: 65.2,  end: 79.3 },
  blog:      { start: 79.6,  end: 93.9 },
  diagram:   { start: 94.2,  end: 107.7 },
  repo:      { start: 108.0, end: 118.9 },
  mcp:       { start: 119.2, end: 131.1 },
  scorecard: { start: 131.5, end: 140.5 },
  process:   { start: 140.8, end: 149.5 },
  signoff:   { start: 149.8, end: 154.6 },
};

let t0 = 0;
const elapsed = () => (Date.now() - t0) / 1000;
const waitUntil = async (targetSec, label = '') => {
  const now = elapsed();
  const delta = targetSec - now;
  if (delta > 0) {
    if (label) console.log(`  [${now.toFixed(1)}s] waiting ${delta.toFixed(1)}s → ${label} @ ${targetSec}s`);
    await sleep(delta * 1000);
  } else if (label) {
    console.log(`  [${now.toFixed(1)}s] BEHIND by ${(-delta).toFixed(1)}s at ${label} — skipping catch-up`);
  }
};

async function main() {
  const browser = await chromium.launch({
    headless: false,
    args: [`--window-position=0,0`, `--window-size=${W},${H}`],
  });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 2,
    recordVideo: RECORD_VIDEO ? { dir: VIDEO_DIR, size: { width: W, height: H } } : undefined,
  });
  const page = await context.newPage();

  console.log('\n════════════════════════════════════════');
  console.log(`  Kaizen walkthrough @ ${W}x${H}`);
  console.log(`  Recording: ${RECORD_VIDEO ? 'on' : 'off'}`);
  console.log(`  Target: 154.6s, synced to voiceover`);
  console.log('════════════════════════════════════════\n');

  // Preload the hero so recording starts on the app, not blank.
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder*="Dark Noise"]', { timeout: 20000 });

  // t=0 begins here, aligned with voiceover start.
  t0 = Date.now();

  // hero (0 → 20.8): playground loads, dwell on hero copy.
  await waitUntil(T.darknoise.start, 'darknoise');

  // darknoise (21.1 → 31.1): move cursor over input, pre-focus.
  const input = page.locator('input[placeholder*="Dark Noise"]');
  await smoothMoveTo(page, input);
  await sleep(500);
  await input.click();
  await waitUntil(T.q1.start, 'q1');

  // q1 (31.5 → 46.4): type first question, click Ask.
  await typeHuman(page, input, 'How is Dark Noise doing right now', 45);
  await sleep(250);
  await page.locator('button:has-text("Ask")').click();
  await page.waitForSelector('text=/MRR|subscriptions|trial|overview/i', { timeout: 45000 });
  await waitUntil(T.q2.start, 'q2');

  // q2 (46.7 → 64.8): type second question, watch composition.
  await input.click();
  await input.fill('');
  await typeHuman(page, input, 'Break down MRR by store this quarter', 42);
  await sleep(250);
  await page.locator('button:has-text("Ask")').click();
  await page.waitForSelector('text=/store|app_store|play_store/i', { timeout: 60000 });
  await waitUntil(T.trace.start, 'trace');

  // trace (65.2 → 79.3): open reasoning trace panel.
  const traceButton = page.locator('button:has-text("reasoning trace")').first();
  if (await traceButton.isVisible().catch(() => false)) {
    await traceButton.scrollIntoViewIfNeeded();
    await sleep(200);
    await traceButton.click();
  }
  await waitUntil(T.blog.start, 'blog');

  // blog (79.6 → 93.9): navigate + read intro.
  await page.goto(BLOG_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(1400);
  await smoothScrollUntil(page, T.diagram.start, 0.7);
  await waitUntil(T.diagram.start, 'diagram');

  // diagram (94.2 → 107.7): scroll to SVG diagram, dwell.
  await scrollToDiagram(page, 4000);
  await waitUntil(T.repo.start, 'repo');

  // repo (108.0 → 118.9): GitHub repo homepage + README.
  await page.goto(REPO_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(1000);
  await smoothScrollUntil(page, T.mcp.start, 0.7);
  await waitUntil(T.mcp.start, 'mcp');

  // mcp (119.2 → 131.1): terminal with npx -y kaizen-mcp (~11.9s).
  await page.goto('data:text/html;charset=utf-8,' + encodeURIComponent(terminalPage()));
  await sleep(700);
  await animateTerminal(page);
  await waitUntil(T.scorecard.start, 'scorecard');

  // scorecard (131.5 → 140.5): scroll through the SCORECARD.
  await page.goto(SCORECARD_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(900);
  await smoothScrollUntil(page, T.process.start, 1.0);
  await waitUntil(T.process.start, 'process');

  // process (140.8 → 149.5): scroll through the PROCESS log.
  await page.goto(PROCESS_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(900);
  await smoothScrollUntil(page, T.signoff.start, 1.0);
  await waitUntil(T.signoff.start, 'signoff');

  // signoff (149.8 → 154.6): final dwell on PROCESS.
  await waitUntil(T.signoff.end, 'end');

  console.log(`\n  Demo complete at ${elapsed().toFixed(1)}s.\n`);
  await context.close();
  await browser.close();
}

async function typeHuman(page, locator, text, baseDelay = 35) {
  for (const char of text) {
    await locator.type(char, { delay: baseDelay + Math.random() * 30 });
  }
}

async function smoothMoveTo(page, locator) {
  const box = await locator.boundingBox();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 });
}

/**
 * Scroll to bottom, bounded by wall-clock — stops if we've hit `deadlineSec`
 * on the master timeline. Prevents slow pages from stealing time from the
 * next beat.
 */
async function smoothScrollUntil(page, deadlineSec, scrollFraction = 0.8) {
  const remainingMs = Math.max(0, (deadlineSec - elapsed()) * 1000);
  if (remainingMs <= 0) return;
  const scrollMs = remainingMs * scrollFraction;
  const totalScrollable = await page.evaluate(() => Math.max(0, document.body.scrollHeight - window.innerHeight));
  if (totalScrollable <= 0) return;
  const steps = Math.max(30, Math.floor(scrollMs / 80));
  const stepPx = totalScrollable / steps;
  const interval = scrollMs / steps;
  for (let i = 0; i < steps; i++) {
    if (elapsed() * 1000 >= (deadlineSec * 1000 - 200)) break;
    await page.mouse.wheel(0, stepPx);
    await sleep(interval);
  }
}

async function scrollToDiagram(page, dwellMs) {
  const targetY = await page.evaluate(() => {
    const svg = document.querySelector('svg[aria-label*="architecture"], svg[role="img"], article svg');
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return rect.top + window.scrollY - 120;
  });
  if (targetY == null) {
    await sleep(dwellMs);
    return;
  }
  const scrollMs = 6000;
  const steps = 80;
  const currentY = await page.evaluate(() => window.scrollY);
  const deltaY = targetY - currentY;
  const stepPx = deltaY / steps;
  const interval = scrollMs / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepPx);
    await sleep(interval);
  }
  await sleep(dwellMs);
}

function terminalPage() {
  return `<!doctype html><html><head><meta charset="utf-8"><title>kaizen-mcp</title>
<style>
  :root { color-scheme: dark; }
  html, body { margin:0; height:100%; background: #0b0d0e; font-family: 'SF Mono', Menlo, Consolas, monospace; color: #e6e6e1; }
  .wrap { display:flex; align-items:center; justify-content:center; height:100%; padding: 48px; box-sizing: border-box; }
  .term { width: 1400px; max-width: 92vw; background: #101214; border: 1px solid #22262a; border-radius: 14px; box-shadow: 0 40px 80px rgba(0,0,0,.5); overflow: hidden; }
  .bar { display:flex; align-items:center; gap:6px; padding: 12px 16px; background: #14181a; border-bottom: 1px solid #22262a; }
  .dot { width:13px; height:13px; border-radius:50%; }
  .r { background:#ff5f56; } .y { background:#ffbd2e; } .g { background:#27c93f; }
  .title { margin-left: 14px; font-size: 14px; color:#9ea1a6; }
  pre { margin: 0; padding: 30px 36px; font-size: 18px; line-height: 1.65; white-space: pre-wrap; }
  .muted { color: #6c7075; }
  .sage { color: #8fba8a; }
  .rust { color: #d9846a; }
  .ink { color: #e6e6e1; }
  .caret { display: inline-block; width: 11px; background: #e6e6e1; animation: blink 1s step-start infinite; }
  @keyframes blink { 50% { opacity: 0; } }
</style></head><body><div class="wrap"><div class="term">
  <div class="bar"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div><div class="title">kaizen-mcp · zsh</div></div>
  <pre id="t"><span class="muted">~</span> <span class="sage">$</span> <span id="out"></span><span class="caret">&nbsp;</span></pre>
</div></div></body></html>`;
}

async function animateTerminal(page) {
  const append = (chunk) => page.evaluate((c) => {
    const el = document.getElementById('out');
    if (!el) return;
    el.innerHTML += c
      .replace(/</g, '&lt;')
      .replace(/\$/g, '<span class="sage">$</span>')
      .replace(/→/g, '<span class="sage">→</span>')
      .replace(/kaizen_[a-z_]+/g, (m) => `<span class="sage">${m}</span>`)
      .replace(/kaizen-mcp/g, '<span class="sage">kaizen-mcp</span>');
  }, chunk);

  const cmd = 'npx -y kaizen-mcp';
  for (const ch of cmd) {
    await append(ch);
    await sleep(90 + Math.random() * 50);
  }
  await append('\n');
  await sleep(700);

  const lines = [
    { text: '\n', after: 0 },
    { text: 'kaizen-mcp v0.1.0 listening on stdio\n', after: 650 },
    { text: '\n', after: 0 },
    { text: '→ tools/list { count: 4 }\n', after: 450 },
    { text: '   kaizen_list_charts\n', after: 170 },
    { text: '   kaizen_get_overview\n', after: 170 },
    { text: '   kaizen_describe_chart\n', after: 170 },
    { text: '   kaizen_get_chart\n\n', after: 400 },
    { text: '→ tools/call kaizen_get_overview\n', after: 550 },
    { text: '   MRR: $18,422  ·  active subs: 3,417  ·  trials: 194\n\n', after: 700 },
    { text: '→ tools/call kaizen_describe_chart { chart: "mrr" }\n', after: 550 },
    { text: '   segments: [ store, product, country, platform ]\n\n', after: 700 },
    { text: '→ tools/call kaizen_get_chart { chart: "mrr", segment: "store" }\n', after: 550 },
    { text: '   app_store: $12,108  ·  play_store: $6,314\n', after: 300 },
  ];
  for (const line of lines) {
    await append(line.text);
    await sleep(line.after);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
