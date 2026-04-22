#!/usr/bin/env node
/**
 * Playwright demo script for Kaizen, matched to docs/assets/voiceover.mp3 (~91s).
 *
 * Beat map (approximate, seconds from start):
 *   0–20   hero + thesis narration (static)
 *   20–30  intro the app, hover the "Dark Noise" pill
 *   30–43  first question -> get_overview response
 *   43–60  second question -> describe_chart then get_chart composition
 *   60–68  open "Show reasoning trace" panel
 *   68–74  navigate to /blog/your-agent-is-a-customer-now, scroll to SVG diagram
 *   74–80  navigate to the GitHub repo
 *   80–86  open SCORECARD.md
 *   86–91  open docs/PROCESS.md (sign-off)
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

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--window-position=0,0', '--window-size=1440,900'],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    recordVideo: RECORD_VIDEO ? { dir: VIDEO_DIR, size: { width: 1440, height: 900 } } : undefined,
  });
  const page = await context.newPage();

  console.log('\n════════════════════════════════════════');
  console.log('  Kaizen full walkthrough');
  console.log('  Window opens in 3s, recording: ' + (RECORD_VIDEO ? 'on' : 'off'));
  console.log('════════════════════════════════════════\n');
  await sleep(3000);

  // 0–20s: land on hero, hold through thesis narration.
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder*="Dark Noise"]', { timeout: 20000 });
  await sleep(18000);

  // 20–30s: subtle cursor move to the input area ("Dark Noise, project key is pre-loaded").
  const input = page.locator('input[placeholder*="Dark Noise"]');
  await input.hover();
  await sleep(1500);
  await input.click();
  await sleep(1000);

  // 23s: type + submit first question.
  await typeHuman(page, input, 'How is Dark Noise doing right now');
  await sleep(500);
  await page.locator('button:has-text("Ask")').click();

  // Wait for overview response to appear.
  await page.waitForSelector('text=/MRR|subscriptions|trial|overview/i', { timeout: 45000 });
  // 30–43s: let the viewer read the agent's response.
  await sleep(11000);

  // 43s: second question, composition.
  await input.click();
  await input.fill('');
  await typeHuman(page, input, 'Break down MRR by store this quarter');
  await sleep(400);
  await page.locator('button:has-text("Ask")').click();

  // Wait for describe_chart -> get_chart composition.
  await page.waitForSelector('text=/store|app_store|play_store/i', { timeout: 60000 });
  // 55–60s: reading time on composed answer.
  await sleep(6000);

  // 60s: click "Show reasoning trace".
  const traceButton = page.locator('button:has-text("reasoning trace")').first();
  if (await traceButton.isVisible().catch(() => false)) {
    await traceButton.scrollIntoViewIfNeeded();
    await sleep(400);
    await traceButton.click();
    await sleep(6500);
  }

  // 68s: navigate to the blog post.
  await page.goto(`${URL}/blog/your-agent-is-a-customer-now`, { waitUntil: 'domcontentloaded' });
  await sleep(1500);
  // Scroll down to the architecture diagram so viewers see it during the "code on GitHub" line.
  await page.mouse.wheel(0, 1600);
  await sleep(4500);

  // 74s: jump to the GitHub repo root.
  await page.goto(REPO_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(5500);

  // 80s: open the committed scorecard.
  await page.goto(SCORECARD_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(5500);

  // 86s: open the process log for sign-off.
  await page.goto(PROCESS_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await sleep(5000);

  console.log('\n  Demo complete.\n');
  await context.close();
  await browser.close();
}

async function typeHuman(page, locator, text) {
  for (const char of text) {
    await locator.type(char, { delay: 40 + Math.random() * 40 });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
