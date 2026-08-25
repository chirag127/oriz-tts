#!/usr/bin/env node
/**
 * api-repo-factory.mjs
 *
 * Generates atomic API repositories from the catalog.
 * Each repo gets: README, LICENSE, data/schema, openapi.yaml,
 * docs/index.html, .github/workflows, and seed data for the 10 pilot APIs.
 *
 * Usage:
 *   node scripts/api-repo-factory.mjs --dry-run          # show what would be created
 *   node scripts/api-repo-factory.mjs --pilot            # generate only the 10 pilot repos
 *   node scripts/api-repo-factory.mjs --all              # generate all catalog entries
 *   node scripts/api-repo-factory.mjs --id http-status   # generate a single API by ID
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, chmodSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = resolve(process.env.WORKSPACE_ROOT || process.cwd());
const CATALOG = JSON.parse(readFileSync(join(ROOT, 'scripts', 'api-catalog.json'), 'utf8'));
const REPOS = join(ROOT, 'repos');
const TPL = join(ROOT, 'scripts', 'api-templates');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const refresh = args.includes('--refresh');
const pilotOnly = args.includes('--pilot');
const allFlag = args.includes('--all');
const singleId = args.find(a => !a.startsWith('--'));

const LICENSE_MAP = {
  'CC0-1.0': 'CC0-1.0|CC0|CC Zero',
  'CC-BY-4.0': 'CC-BY-4.0|CC BY|CC Attribution',
  'Unicode-DFS-2.1': 'Unicode-DFS-2.1|Unicode',
  'public-domain': 'public-domain|Public Domain',
  'MIT': 'MIT',
};

function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

function ensureDir(d) { if (!existsSync(d)) mkdirSync(d, { recursive: true }); }

function writeFile(p, content, executable) {
  ensureDir(dirname(p));
  writeFileSync(p, content, 'utf8');
  if (executable) chmodSync(p, 0o755);
}

function gitInit(dir) {
  execSync(`git init "${dir}"`);
  execSync(`git -C "${dir}" config user.name "github-actions[bot]"`);
  execSync(`git -C "${dir}" config user.email "github-actions[bot]@users.noreply.github.com"`);
  execSync(`git -C "${dir}" checkout -b main`);
  execFileSync('git', ['-C', dir, 'add', '-A']);
  execFileSync('git', ['-C', dir, 'commit', '-m', 'feat: initial API scaffold']);
}

function execSync(cmd) {
  try { execFileSync('bash', ['-c', cmd], { encoding: 'utf8', stdio: ['ignore', 'ignore', 'ignore'] }); }
  catch { /* best-effort */ }
}

function generateReadme(api, urlBase) {
  const epRows = api.endpoints.map(e => `| \`${e}\` | JSON |`);
  return `# ${api.title}

> ${api.description}

**Category:** ${api.category} · **Data:** ${api.source} · **License:** ${api.license} · **Updates:** ${api.cadence}

## API Endpoints

All endpoints are served as static JSON from GitHub Pages.

| Endpoint | Format |
|----------|--------|
${epRows.join('\n')}

## Usage

\`\`\`bash
curl https://chirag127.github.io/${api.id}/data.json
\`\`\`

\`\`\`javascript
const res = await fetch('https://chirag127.github.io/${api.id}/data.json');
const data = await res.json();
\`\`\`

## Data

- Source: ${api.source}
- License: ${api.license}
- Last updated: \`${new Date().toISOString()}\`

See \`data/\` for raw JSON and \`data/schema.json\` for the schema.

## Documentation

Visit the [interactive docs](https://chirag127.github.io/${api.id}/) for the browsable API reference.

## Contributing

Issues and PRs welcome. Ensure \`data/schema.json\` validates all data files.

## License

${api.license}
`;
}

function generateSchema(api) {
  return JSON.stringify({
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": `https://chirag127.github.io/${api.id}/data/schema.json`,
    "title": api.title,
    "description": api.description,
    "type": "array",
    "items": {
      "type": "object",
      "required": ["id", "name"],
      "properties": {
        "id": { "type": "string", "description": "Unique identifier" },
        "name": { "type": "string", "description": "Display name" }
      }
    }
  }, null, 2) + '\n';
}

function generateOpenapi(api) {
  const paths = {
    "/data.json": {
      "get": {
        "summary": `${api.title} data`,
        "description": api.description,
        "responses": {
          "200": {
            "description": "JSON response",
            "content": { "application/json": { "schema": { "type": "array" } } }
          }
        }
      }
    }
  };
  for (const ep of api.endpoints) {
    paths[ep.replace(/\.json$/, '') || '/'] = {
      "get": {
        "summary": api.title,
        "description": api.description,
        "responses": {
          "200": {
            "description": "JSON response",
            "content": { "application/json": { "schema": { "type": "array" } } }
          }
        }
      }
    };
  }
  return JSON.stringify({
    "openapi": "3.1.0",
    "info": {
      "title": api.title,
      "description": api.description,
      "version": "1.0.0",
      "license": { "name": api.license }
    },
    "servers": [
      { "url": `https://chirag127.github.io/${api.id}`, "description": "GitHub Pages" }
    ],
    "paths": paths
  }, null, 2) + '\n';
}

function generateIndexHtml(api) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(api.title)}</title>
  <style>body{font-family:system-ui;max-width:800px;margin:2rem auto;padding:0 1rem;color:#111}
  h1{font-size:1.4rem}code{background:#f5f5f5;padding:.1em .3em;border-radius:3px}
  .endpoint{background:#f0f7ff;padding:1rem;border-radius:8px;margin:.5rem 0}
  pre{overflow-x:auto;background:#1a1a2e;color:#e0e0e0;padding:1rem;border-radius:8px}</style>
</head>
<body>
  <h1>${esc(api.title)}</h1>
  <p>${esc(api.description)}</p>
  <p><strong>Category:</strong> ${esc(api.category)} · <strong>License:</strong> ${esc(api.license)}</p>
  <h2>Try it</h2>
  <div class="endpoint"><strong><code>GET /data.json</code></strong><pre>curl https://chirag127.github.io/${api.id}/data.json</pre></div>
  ${api.endpoints.map(e => `<div class="endpoint">
    <strong><code>GET ${e}</code></strong>
    <pre>curl https://chirag127.github.io/${api.id}${e}</pre>
  </div>`).join('\n')}
  <h2>Schema</h2>
  <p><a href="data/schema.json">data/schema.json</a></p>
  <footer><p>Data: ${esc(api.source)} · Updated: ${new Date().toISOString().slice(0, 10)}</p></footer>
</body></html>\n`;
}

function generateSeedData(api) {
  const seeds = {
    "http-status": [
      { "id": "200", "name": "OK", "class": "success", "description": "The request succeeded." },
      { "id": "201", "name": "Created", "class": "success", "description": "The request succeeded and created a resource." },
      { "id": "301", "name": "Moved Permanently", "class": "redirect", "description": "The resource has a new permanent URL." },
      { "id": "400", "name": "Bad Request", "class": "client-error", "description": "The server cannot process the request." },
      { "id": "401", "name": "Unauthorized", "class": "client-error", "description": "Authentication is required or invalid." },
      { "id": "404", "name": "Not Found", "class": "client-error", "description": "The requested resource was not found." },
      { "id": "500", "name": "Internal Server Error", "class": "server-error", "description": "The server encountered an unexpected condition." }
    ],
    "si-units": [
      { "id": "m", "name": "metre", "symbol": "m", "quantity": "length", "definition": "SI base unit of length." },
      { "id": "kg", "name": "kilogram", "symbol": "kg", "quantity": "mass", "definition": "SI base unit of mass." },
      { "id": "s", "name": "second", "symbol": "s", "quantity": "time", "definition": "SI base unit of time." },
      { "id": "A", "name": "ampere", "symbol": "A", "quantity": "electric current", "definition": "SI base unit of electric current." },
      { "id": "K", "name": "kelvin", "symbol": "K", "quantity": "temperature", "definition": "SI base unit of thermodynamic temperature." },
      { "id": "mol", "name": "mole", "symbol": "mol", "quantity": "amount of substance", "definition": "SI base unit of amount of substance." },
      { "id": "cd", "name": "candela", "symbol": "cd", "quantity": "luminous intensity", "definition": "SI base unit of luminous intensity." }
    ],
    "india-states": [
      { "id": "IN-AP", "name": "Andhra Pradesh", "capital": "Amaravati", "status": "pilot-fixture" },
      { "id": "IN-MH", "name": "Maharashtra", "capital": "Mumbai", "status": "pilot-fixture" }
    ],
    "india-districts": [
      { "id": "IN-AP-AN", "name": "Anantapur", "state": "Andhra Pradesh", "status": "pilot-fixture" },
      { "id": "IN-MH-PU", "name": "Pune", "state": "Maharashtra", "status": "pilot-fixture" }
    ],
    "india-pincode": [
      { "id": "110001", "name": "New Delhi GPO", "district": "New Delhi", "state": "Delhi", "status": "pilot-fixture" },
      { "id": "400001", "name": "Mumbai GPO", "district": "Mumbai", "state": "Maharashtra", "status": "pilot-fixture" }
    ],
    "india-holidays": [
      { "id": "2026-01-26", "name": "Republic Day", "country": "IN", "status": "pilot-fixture" },
      { "id": "2026-08-15", "name": "Independence Day", "country": "IN", "status": "pilot-fixture" },
      { "id": "2026-10-02", "name": "Gandhi Jayanti", "country": "IN", "status": "pilot-fixture" }
    ],
    "mime-types": [
      { "id": "application/json", "name": "JSON", "extensions": [".json"] },
      { "id": "text/html", "name": "HTML", "extensions": [".html", ".htm"] },
      { "id": "text/css", "name": "CSS", "extensions": [".css"] },
      { "id": "application/pdf", "name": "PDF", "extensions": [".pdf"] },
      { "id": "image/png", "name": "PNG", "extensions": [".png"] },
      { "id": "image/jpeg", "name": "JPEG", "extensions": [".jpg", ".jpeg"] }
    ],
    "iso-codes": [
      { "id": "IN", "name": "India", "alpha2": "IN", "currency": "INR", "language": "hi" },
      { "id": "US", "name": "United States", "alpha2": "US", "currency": "USD", "language": "en" },
      { "id": "GB", "name": "United Kingdom", "alpha2": "GB", "currency": "GBP", "language": "en" }
    ],
    "ncert-books": [
      { "id": "class-10-mathematics", "name": "Mathematics", "class": "10", "status": "pilot-fixture" },
      { "id": "class-10-science", "name": "Science", "class": "10", "status": "pilot-fixture" }
    ],
    "rbi-rates": [
      { "id": "repo-rate", "name": "Repo Rate", "value": null, "unit": "percent", "status": "awaiting-source-refresh" },
      { "id": "reverse-repo-rate", "name": "Reverse Repo Rate", "value": null, "unit": "percent", "status": "awaiting-source-refresh" }
    ]
  };
  return seeds[api.id] || [{ "id": api.id, "name": api.title, "status": "scaffold", "source": api.source }];
}

function generateWorkflow(api) {
  const cadenceMap = {
    'manual': null,
    'daily': '0 6 * * *',
    'weekly': '0 6 * * 1',
    'monthly': '0 6 1 * *',
    'quarterly': '0 6 1 1,4,7,10 *',
    'yearly': '0 6 1 1 *',
    'event-based': null,
  };
  const cron = cadenceMap[api.cadence];
  return `name: Validate and deploy

on:
  workflow_dispatch:
  push:
    paths:
      - 'data/**'
      - 'data.json'
      - 'index.html'
      - 'openapi.json'
      - '.github/workflows/deploy.yml'
${cron ? `  schedule:\n    - cron: '${cron}'` : ''}

permissions:
  contents: write

concurrency:
  group: pages-${api.id}
  cancel-in-progress: true

jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - name: Validate JSON data files
        run: |
          set -euo pipefail
          for f in data/*.json data.json; do
            [ -f "$f" ] || continue
            [ "$f" = "data/schema.json" ] && continue
            echo "validating $f"
            node -e "JSON.parse(require('fs').readFileSync('$f'))"
          done
      - name: Validate OpenAPI spec
        run: |
          node -e "JSON.parse(require('fs').readFileSync('openapi.json'))"

  deploy:
    needs: validate
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Publish static site to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_branch: gh-pages
          publish_dir: .
          force_orphan: true
`;
}

function generateSearchIndex(api, data) {
  return JSON.stringify({
    version: "1.0.0",
    generatedAt: new Date().toISOString(),
    fields: ["id", "name", "keywords"],
    records: data.map(item => ({
      id: String(item.id),
      name: item.name,
      keywords: [item.name, item.id, api.category, ...(api.searchKeywords || [])].join(" ").toLowerCase()
    }))
  }, null, 2) + "\n";
}

function generateTypes(api) {
  return `export interface ${api.id.replace(/(^|[-_])([a-z])/g, (_, __, c) => c.toUpperCase())}Record {\n  id: string;\n  name: string;\n  [key: string]: unknown;\n}\n\nexport type ${api.id.replace(/(^|[-_])([a-z])/g, (_, __, c) => c.toUpperCase())} = ${api.id.replace(/(^|[-_])([a-z])/g, (_, __, c) => c.toUpperCase())}Record[];\n`;
}

function generateLlms(api) {
  return `# ${api.title}\n\n${api.description}\n\n- API: https://chirag127.github.io/${api.id}/data.json\n- OpenAPI: https://chirag127.github.io/${api.id}/openapi.json\n- Schema: https://chirag127.github.io/${api.id}/data/schema.json\n- License: ${api.license}\n- Source: ${api.source}\n- Status: ${api.id}\n`;
}

function generateNotice(api) {
  return `# Data attribution\n\n- Dataset: ${api.title}\n- Declared source: ${api.source}\n- Declared license: ${api.license}\n- This repository contains a small clearly-labelled pilot fixture until the source has been independently validated.\n`;
}

function generateGitignore() {
  return `.DS_Store\nnode_modules/\n*.log\n.env\n`;
}

function generateLicense(licenseType) {
  if (licenseType === 'CC0-1.0' || licenseType === 'public-domain') {
    return `# Public Domain / CC0

To the extent possible under law, the author(s) have dedicated all copyright
and related and neighboring rights to this work to the public domain.

This work is published from: India.\n`;
  }
  if (licenseType === 'CC-BY-4.0') {
    return `# Creative Commons Attribution 4.0 International

Copyright ${new Date().getFullYear()} Chirag Singhal

This work is licensed under the Creative Commons Attribution 4.0 International License.

You are free to:

  Share — copy and redistribute the material in any medium or format
  Adapt — remix, transform, and build upon the material for any purpose

Under the following terms:

  Attribution — You must give appropriate credit, provide a link to the license,
  and indicate if changes were made.

Full license: https://creativecommons.org/licenses/by/4.0/\n`;
  }
  return `MIT License\nCopyright ${new Date().getFullYear()} Chirag Singhal\n`;
}

function selectEntry(id) {
  return CATALOG.catalog.find(e => e.id === id);
}

function entriesToGenerate() {
  if (singleId) {
    const e = selectEntry(singleId);
    if (!e) { console.error(`ID "${singleId}" not found in catalog`); process.exit(1); }
    return [e];
  }
  if (pilotOnly) {
    return CATALOG.pilot.map(id => selectEntry(id)).filter(Boolean);
  }
  if (allFlag) {
    return CATALOG.catalog;
  }
  console.error('Usage: api-repo-factory.mjs [--dry-run] [--pilot|--all] [--id <api-id>]');
  process.exit(1);
}

// ─── Main ───
const entries = entriesToGenerate();
let created = 0;
let skipped = 0;

for (const api of entries) {
  const dir = join(REPOS, api.id);
  if (existsSync(dir) && !refresh) {
    console.log(`SKIP (exists): repos/${api.id}`);
    skipped++;
    continue;
  }
  if (dryRun) {
    console.log(`${refresh ? 'WOULD REFRESH' : 'WOULD CREATE'}: repos/${api.id} [${api.category}] ${api.title}`);
    created++;
    continue;
  }

  console.log(`CREATING: repos/${api.id}`);
  ensureDir(join(dir, 'data'));
  ensureDir(join(dir, 'docs'));
  ensureDir(join(dir, '.github', 'workflows'));

  const seedData = generateSeedData(api);
  writeFile(join(dir, 'README.md'), generateReadme(api, `https://chirag127.github.io/${api.id}`));
  writeFile(join(dir, 'LICENSE'), generateLicense(api.license));
  writeFile(join(dir, 'NOTICE.md'), generateNotice(api));
  writeFile(join(dir, '.gitignore'), generateGitignore());
  writeFile(join(dir, 'data', 'schema.json'), generateSchema(api));
  writeFile(join(dir, 'openapi.json'), generateOpenapi(api));
  const indexHtml = generateIndexHtml(api);
  writeFile(join(dir, 'index.html'), indexHtml);
  writeFile(join(dir, 'docs', 'index.html'), indexHtml);
  writeFile(join(dir, '.github', 'workflows', 'deploy.yml'), generateWorkflow(api));
  const seedJson = JSON.stringify(seedData, null, 2) + '\n';
  writeFile(join(dir, 'search-index.json'), generateSearchIndex(api, seedData));
  writeFile(join(dir, 'types.d.ts'), generateTypes(api));
  writeFile(join(dir, 'llms.txt'), generateLlms(api));
  writeFile(join(dir, 'data.json'), seedJson);
  writeFile(join(dir, 'data', 'index.json'), seedJson);
  for (const endpoint of api.endpoints) {
    if (!endpoint.startsWith('/data/') || endpoint.includes('{')) continue;
    writeFile(join(dir, endpoint.slice(1)), seedJson);
  }

  console.log(`  repos/${api.id}/ ✓`);
  created++;
}

console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Total in catalog: ${CATALOG.catalog.length}`);
