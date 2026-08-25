#!/usr/bin/env node
import { existsSync, readFileSync, copyFileSync, writeFileSync } from 'node:fs';

const source = process.env.API_SOURCE_URL;
const target = process.env.API_TARGET_FILE || 'data.json';
const lastGood = process.env.API_LAST_GOOD_FILE || `${target}.last-known-good`;
if (!source) { console.error('API_SOURCE_URL is required'); process.exit(2); }

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), Number(process.env.API_TIMEOUT_MS || 30000));
try {
  const response = await fetch(source, { signal: controller.signal, headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error(`source returned HTTP ${response.status}`);
  const body = await response.text();
  const data = JSON.parse(body);
  if (!Array.isArray(data) && (data === null || typeof data !== 'object')) throw new Error('source response is not JSON data');
  JSON.stringify(data);
  if (existsSync(target)) copyFileSync(target, lastGood);
  writeFileSync(target, JSON.stringify(data, null, 2) + '\n');
  console.log(`refreshed ${target} from ${source}`);
} catch (error) {
  console.error(`refresh failed: ${error.message}`);
  if (existsSync(lastGood)) { copyFileSync(lastGood, target); console.error(`retained last-known-good ${lastGood}`); }
  else { console.error('no last-known-good snapshot exists; refusing to publish empty data'); }
  process.exit(1);
} finally { clearTimeout(timeout); }
