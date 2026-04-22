#!/usr/bin/env node
/**
 * Playwright demo script for Kaizen.
 *
 * Matches the 91s voiceover timing at docs/assets/voiceover.mp3.
 * Start OpenScreen recording at the same moment you launch this.
 * Opens a full Chromium window, runs the exact two-question flow the
 * voiceover narrates.
 *
 * Run: node scripts/demo-recorder.mjs
 * Optional env:
 *   KAIZEN_URL (default https://kaizen-silk.vercel.app)
 *   KAIZEN_VIDEO=1 to also save an internal Playwright video
 */

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const URL = process.env.KAIZEN_URL ?? 'https://kaizen-silk.vercel.app';
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
  console.log('  Kaizen demo recorder');
  console.log('  Start OpenScreen now. Window will open in 3s.');
  console.log('════════════════════════════════════════\n');
  await sleep(3000);

  // 0s: land on hero. Voiceover covers thesis (beat 1, ~20s).
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('input[placeholder*="Dark Noise"]', { timeout: 20000 });

  // 3–23s: hold on hero while voiceover says "Your agent is a customer now..."
  await sleep(20000);

  // 23s: focus input and start typing first question.
  const input = page.locator('input[placeholder*="Dark Noise"]');
  await input.click();
  await sleep(500);
  await typeHuman(page, input, 'How is Dark Noise doing right now');
  await sleep(600);

  // 28s: submit first question. Voiceover transitions to "The agent calls one primitive, get overview..."
  await page.locator('button:has-text("Ask")').click();

  // Wait for agent to stream a response (tool chip + prose).
  await page.waitForSelector('text=/MRR|subscriptions|trial|overview/i', { timeout: 45000 });
  await sleep(8000);

  // ~45s: type the second, composition question.
  await input.click();
  await input.fill('');
  await typeHuman(page, input, 'Break down MRR by store this quarter');
  await sleep(500);
  await page.locator('button:has-text("Ask")').click();

  // Wait for the describe_chart -> get_chart composition to finish.
  await page.waitForSelector('text=/store|app_store|play_store/i', { timeout: 60000 });
  await sleep(6000);

  // ~75s: open the reasoning trace panel (voiceover: "Every call is inspectable").
  const traceButton = page.locator('button:has-text("reasoning trace")').first();
  if (await traceButton.isVisible().catch(() => false)) {
    await traceButton.scrollIntoViewIfNeeded();
    await sleep(500);
    await traceButton.click();
    await sleep(6000);
  }

  // ~87s: scroll to bottom for the sign-off.
  await page.mouse.wheel(0, 600);
  await sleep(5000);

  console.log('\n  Demo complete. Stop OpenScreen.\n');
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
