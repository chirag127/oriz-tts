#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const url = process.argv[2];
const output = process.argv[3] || 'discovery-fixture.json';
if (!url) {
  console.error('Usage: node scripts/playwright-discover.mjs <url> [output]');
  process.exit(2);
}

let playwright;
try { playwright = await import('playwright'); }
catch {
  console.error('Playwright is not installed. Install it in the discovery environment only; cron refreshes use direct HTTP.');
  process.exit(1);
}

const browser = await playwright.chromium.launch({ headless: true });
const page = await browser.newPage();
const requests = [];
const redact = value => String(value || '').replace(/[?&](token|key|secret|password|authorization)=[^&]*/gi, '$1=[REDACTED]');
page.on('request', request => {
  const resource = request.resourceType();
  if (!['xhr', 'fetch'].includes(resource)) return;
  requests.push({ method: request.method(), url: redact(request.url()), resourceType: resource });
});
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
const result = { version: '1.0.0', capturedAt: new Date().toISOString(), page: redact(url), requests };
mkdirSync(resolve(output, '..'), { recursive: true });
writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
await browser.close();
console.log(`Captured ${requests.length} sanitized API request(s) to ${output}`);
