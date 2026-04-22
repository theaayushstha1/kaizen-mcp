#!/usr/bin/env node
/**
 * Playwright demo for Kaizen @ 1920x1080, matched to the 68s Kokoro voiceover.
 *
 * Beats (seconds):
 *   0–12   hero + thesis
 *   12–18  first question typed
 *   18–28  get_overview response (reading)
 *   28–36  second question typed
 *   36–46  describe_chart → get_chart composition
 *   46–52  reasoning trace panel
 *   52–58  terminal pane: kaizen-mcp over stdio
 *   58–64  SCORECARD.md on GitHub
 *   64–68  PROCESS.md on GitHub
 *
 * Run: KAIZEN_VIDEO=1 node scripts/demo-recorder.mjs
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const URL = process.env.KAIZEN_URL ?? 'https://kaizen-silk.vercel.app';
const REPO_URL = 'https://github.com/theaayushstha1/kaizen-mcp';
const SCORECARD_URL = `${REPO_URL}/blob/main/evals/SCORECARD.md`;
const PROCESS_URL = `${REPO_URL}/blob/main/docs/PROCESS.md`;
const RECORD_VIDEO = process.env.KAIZEN_VIDEO === '1';
const VIDEO_DIR = resolve('docs/assets/demo-video');
if (RECORD_VIDEO) mkdirSync(VIDEO_DIR, { recursive: true });

const W = 1920;
const H = 1080;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  console.log('════════════════════════════════════════\n');
  await sleep(3000);

  // 0–12s: hero.
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder*="Dark Noise"]', { timeout: 20000 });
  await sleep(10500);

  // 12s: first question.
  const input = page.locator('input[placeholder*="Dark Noise"]');
  await smoothMoveTo(page, input);
  await sleep(600);
  await input.click();
  await typeHuman(page, input, 'How is Dark Noise doing right now');
  await sleep(350);
  await page.locator('button:has-text("Ask")').click();

  await page.waitForSelector('text=/MRR|subscriptions|trial|overview/i', { timeout: 45000 });
  await sleep(7500);

  // 28s: second question.
  await input.click();
  await input.fill('');
  await typeHuman(page, input, 'Break down MRR by store this quarter');
  await sleep(300);
  await page.locator('button:has-text("Ask")').click();

  await page.waitForSelector('text=/store|app_store|play_store/i', { timeout: 60000 });
  await sleep(4500);

  // 46s: reasoning trace.
  const traceButton = page.locator('button:has-text("reasoning trace")').first();
  if (await traceButton.isVisible().catch(() => false)) {
    await traceButton.scrollIntoViewIfNeeded();
    await sleep(300);
    await traceButton.click();
    await sleep(5000);
  }

  // 52s: terminal pane for the MCP adapter.
  await page.goto('data:text/html;charset=utf-8,' + encodeURIComponent(terminalPage()));
  await sleep(600);
  await animateTerminal(page);
  await sleep(1200);

  // 58s: scorecard — load then scroll through the full table.
  await page.goto(SCORECARD_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(1400);
  await smoothScrollFull(page, 6000);

  // 70s: process log — load then scroll through decisions + receipts.
  await page.goto(PROCESS_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(1400);
  await smoothScrollFull(page, 8000);

  console.log('\n  Demo complete.\n');
  await context.close();
  await browser.close();
}

async function typeHuman(page, locator, text) {
  for (const char of text) {
    await locator.type(char, { delay: 35 + Math.random() * 35 });
  }
}

async function smoothMoveTo(page, locator) {
  const box = await locator.boundingBox();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 25 });
}

async function smoothScrollFull(page, durationMs) {
  const totalScrollable = await page.evaluate(() => Math.max(0, document.body.scrollHeight - window.innerHeight));
  if (totalScrollable <= 0) {
    await sleep(durationMs);
    return;
  }
  const steps = 60;
  const stepPx = totalScrollable / steps;
  const interval = durationMs / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepPx);
    await sleep(interval);
  }
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
  <pre id="t"><span class="muted">~/kaizen-mcp</span> <span class="sage">$</span> <span id="out"></span><span class="caret">&nbsp;</span></pre>
</div></div></body></html>`;
}

async function animateTerminal(page) {
  const lines = [
    { text: 'pnpm mcp\n', after: 280 },
    { text: '\n', after: 0 },
    { text: '> kaizen@0.1.0 mcp\n', after: 60 },
    { text: '> tsx bin/mcp.ts\n\n', after: 160 },
    { text: 'kaizen-mcp v0.1.0 listening on stdio\n', after: 350 },
    { text: '\n', after: 0 },
    { text: '→ tools/list { count: 4 }\n', after: 200 },
    { text: '   kaizen_list_charts\n', after: 50 },
    { text: '   kaizen_get_overview\n', after: 50 },
    { text: '   kaizen_describe_chart\n', after: 50 },
    { text: '   kaizen_get_chart\n\n', after: 150 },
    { text: '→ tools/call kaizen_get_overview\n', after: 250 },
    { text: '   MRR: $18,422  ·  active subs: 3,417  ·  trials: 194\n', after: 300 },
  ];
  for (const line of lines) {
    await page.evaluate((chunk) => {
      const el = document.getElementById('out');
      if (!el) return;
      el.innerHTML += chunk
        .replace(/</g, '&lt;')
        .replace(/\$/g, '<span class="sage">$</span>')
        .replace(/→/g, '<span class="sage">→</span>')
        .replace(/kaizen_[a-z_]+/g, (m) => `<span class="sage">${m}</span>`);
    }, line.text);
    await sleep(line.after);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
