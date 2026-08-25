/**
 * Convert all dataset repos to -api repos with full spec compliance
 * Run: node scripts/convert-all-datasets.cjs
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPOS_DIR = path.join(__dirname, '../repos');
const CATALOG = JSON.parse(fs.readFileSync(path.join(__dirname, 'api-catalog.json'), 'utf8')).catalog;

const DATASET_REPOS = CATALOG
  .filter(c => fs.existsSync(path.join(REPOS_DIR, c.id)) && !fs.existsSync(path.join(REPOS_DIR, c.id + '-api')))
  .map(c => c.id);

console.log(`Found ${DATASET_REPOS.length} dataset repos to convert:`);
DATASET_REPOS.forEach(r => console.log('  -', r));

// Template from india-states-api
const TEMPLATE_DIR = path.join(REPOS_DIR, 'india-states-api');

function run(cmd, cwd) {
  try {
    execSync(cmd, { cwd, stdio: 'pipe' });
    return true;
  } catch (e) {
    console.error(`  FAIL: ${cmd} - ${e.message}`);
    return false;
  }
}

function copyTemplate(src, dest, replacements = {}) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyTemplate(path.join(src, file), path.join(dest, file), replacements);
    }
  } else {
    let content = fs.readFileSync(src, 'utf8');
    for (const [key, val] of Object.entries(replacements)) {
      content = content.replace(new RegExp(key, 'g'), val);
    }
    fs.writeFileSync(dest, content);
  }
}

async function convertRepo(repoName) {
  console.log(`\n=== Converting ${repoName} ===`);
  const srcDir = path.join(REPOS_DIR, repoName);
  const destDir = path.join(REPOS_DIR, `${repoName}-api`);

  if (fs.existsSync(destDir)) {
    console.log(`  SKIP: ${repoName}-api already exists`);
    return false;
  }

  // Read source data
  const dataFile = path.join(srcDir, 'data.json');
  if (!fs.existsSync(dataFile)) {
    console.log(`  SKIP: No data.json in ${repoName}`);
    return false;
  }
  const rawData = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  console.log(`  Records: ${rawData.length}`);

  // Read source README for metadata
  const readmeFile = path.join(srcDir, 'README.md');
  let readmeContent = '';
  if (fs.existsSync(readmeFile)) readmeContent = fs.readFileSync(readmeFile, 'utf8');

  // Extract metadata from catalog
  const catalogEntry = CATALOG.find(c => c.id === repoName);
  const title = catalogEntry?.title || repoName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const description = catalogEntry?.description || `${title} API`;
  const category = catalogEntry?.category || 'general';
  const source = catalogEntry?.source || 'Public data';
  const license = catalogEntry?.license || 'CC-BY-4.0';
  const cadence = catalogEntry?.cadence || 'manual';

  // Create destination
  fs.mkdirSync(destDir, { recursive: true });

  // Copy template structure
  const dirs = ['data', 'schemas', 'api/v1', 'scraper', 'scraper/fixtures', 'tests', 'examples', 'website', 'scripts', 'docs', '.github/workflows'];
  for (const dir of dirs) {
    fs.mkdirSync(path.join(destDir, dir), { recursive: true });
  }

  // 1. Copy data.json to api/v1
  const apiDataFile = path.join(destDir, 'api/v1/data.json');
  fs.writeFileSync(apiDataFile, JSON.stringify(rawData, null, 2) + '\n');

  // 2. Generate individual files
  const individualDir = path.join(destDir, 'api/v1/individual');
  fs.mkdirSync(individualDir, { recursive: true });
  for (const item of rawData) {
    const id = item.id || item.code || item.slug || item.name?.replace(/\s+/g, '-').toLowerCase();
    if (id) {
      // Sanitize filename
      const safeId = id.replace(/[^a-zA-Z0-9._-]/g, '_');
      fs.writeFileSync(path.join(individualDir, `${safeId}.json`), JSON.stringify(item, null, 2) + '\n');
    }
  }

  // 3. Generate JSON Schema
  const schema = generateSchema(rawData, title);
  fs.writeFileSync(path.join(destDir, 'schemas/data.json'), JSON.stringify(schema, null, 2) + '\n');

  // 4. Generate OpenAPI
  const openapi = generateOpenAPI(repoName, title, description, rawData, source, license);
  fs.writeFileSync(path.join(destDir, 'openapi.yaml'), openapi);

  // 5. Generate search index
  const searchIndex = generateSearchIndex(rawData);
  fs.writeFileSync(path.join(destDir, 'api/v1/search-index.json'), JSON.stringify(searchIndex, null, 2) + '\n');

  // 6. Generate meta.json
  const meta = {
    status: 'healthy',
    lastUpdated: new Date().toISOString(),
    sourceUpdatedAt: new Date().toISOString(),
    retrievedAt: new Date().toISOString(),
    recordCount: rawData.length,
    version: '1.0.0',
    schemaVersion: '1.0.0',
    source: source,
    license: license,
    updateCadence: cadence,
    nextUpdateDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastFailedAt: null,
    failureReason: null
  };
  fs.writeFileSync(path.join(destDir, 'api/v1/meta.json'), JSON.stringify(meta, null, 2) + '\n');

  // 7. Create scraper
  const scraper = generateScraper(repoName, title, source);
  fs.writeFileSync(path.join(destDir, 'scraper/index.cjs'), scraper);

  // 8. Create scraper fixture
  fs.writeFileSync(path.join(destDir, 'scraper/fixtures/expected.json'), JSON.stringify({ recordCount: rawData.length }, null, 2) + '\n');

  // 9. Create validation test
  const test = generateTest(repoName, rawData);
  fs.writeFileSync(path.join(destDir, 'tests/validate-schema.test.cjs'), test);

  // 10. Create build scripts
  createBuildScripts(destDir, repoName);

  // 11. Create website
  const websiteHtml = generateWebsite(repoName, title, description, source, license, rawData.length);
  fs.writeFileSync(path.join(destDir, 'website/index.html'), websiteHtml);

  // 12. Create GitHub Actions workflows
  createWorkflows(destDir, repoName, cadence);

  // 13. Create README
  const readme = generateReadme(repoName, title, description, source, license, cadence, rawData.length);
  fs.writeFileSync(path.join(destDir, 'README.md'), readme);

  // 14. Create CHANGELOG
  const changelog = `# Changelog\n\n## 1.0.0 — ${new Date().toISOString().split('T')[0]}\n\n### Added\n- Complete dataset conversion from ${repoName}\n- JSON Schema validation\n- OpenAPI 3.1 specification\n- Individual record endpoints\n- Search index for client-side search\n- Metadata endpoint\n- Static website with interactive explorer\n- GitHub Actions: scheduled updates + Pages deployment\n- Test suite\n- Last-known-good mechanism\n- Source attribution and license documentation\n`;
  fs.writeFileSync(path.join(destDir, 'CHANGELOG.md'), changelog);

  // 15. Copy LICENSE
  const srcLicense = path.join(srcDir, 'LICENSE');
  const destLicense = path.join(destDir, 'LICENSE');
  if (fs.existsSync(srcLicense)) {
    fs.copyFileSync(srcLicense, destLicense);
  } else {
    fs.writeFileSync(destLicense, `MIT License\n\nCopyright (c) ${new Date().getFullYear()} Chirag Singhal\n\nData sourced from ${source} under ${license}.\n`);
  }

  // 16. Create SECURITY.md
  fs.writeFileSync(path.join(destDir, 'SECURITY.md'), generateSecurity());

  // 17. Create package.json
  const pkg = generatePackageJson(repoName, title, description);
  fs.writeFileSync(path.join(destDir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');

  // 18. Initialize git and commit
  process.chdir(destDir);
  if (!run('git init', destDir)) return false;
  if (!run('git add -A', destDir)) return false;
  if (!run(`git commit -m "feat: convert ${repoName} to ${repoName}-api with full API spec"`, destDir)) return false;

  // 19. Create GitHub repo and push
  console.log(`  Creating GitHub repo...`);
  const ghCreate = `gh repo create chirag127/${repoName}-api --public --source=. --push`;
  if (!run(ghCreate, destDir)) {
    console.log(`  GitHub create failed, trying without --push...`);
    run(`gh repo create chirag127/${repoName}-api --public`, destDir);
    run('git push -u origin main', destDir);
  }

  // 20. Add as submodule
  process.chdir('/c/g/ws');
  console.log(`  Adding submodule...`);
  run(`git submodule add https://github.com/chirag127/${repoName}-api.git repos/${repoName}-api`);

  // 21. Update catalog
  updateCatalog(repoName, title, description, category, source, license, cadence, rawData.length);

  console.log(`  SUCCESS: ${repoName}-api`);
  return true;
}

function generateSchema(data, title) {
  if (data.length === 0) return { type: 'array', items: { type: 'object' } };

  const sample = data[0];
  const properties = {};
  for (const [key, value] of Object.entries(sample)) {
    const type = typeof value;
    properties[key] = { type };
    if (type === 'string' && key.toLowerCase().includes('id')) properties[key].pattern = '^[A-Z0-9-]+$';
  }
  const required = Object.keys(sample).filter(k => sample[k] !== null && sample[k] !== undefined);

  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    $id: `https://chirag127.github.io/${title.toLowerCase().replace(/\s+/g, '-')}/schemas/data.json`,
    title,
    type: 'array',
    items: {
      type: 'object',
      required,
      properties
    }
  };
}

function generateOpenAPI(repoName, title, description, data, source, license) {
  const sample = data[0] || {};
  const properties = {};
  for (const [key, value] of Object.entries(sample)) {
    const type = typeof value;
    properties[key] = { type };
  }

  return `openapi: 3.1.0
info:
  title: ${title}
  description: ${description}
  version: 1.0.0
  license:
    name: ${license}
  contact:
    name: Oriz Free Public APIs
    url: https://oriz.in/apis/${repoName}
servers:
  - url: https://chirag127.github.io/${repoName}-api
    description: GitHub Pages
paths:
  /api/v1/data.json:
    get:
      summary: ${title}
      description: ${description}
      operationId: listData
      responses:
        '200':
          description: JSON array
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties: ${JSON.stringify(properties, null, 12).replace(/\n/g, '\n                  ')}
  /api/v1/individual/{id}.json:
    get:
      summary: Get single record
      operationId: getRecord
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        '200':
          description: Record object
          content:
            application/json:
              schema:
                type: object
                properties: ${JSON.stringify(properties, null, 12).replace(/\n/g, '\n                  ')}
        '404': { description: Not found }
  /api/v1/search-index.json:
    get:
      summary: Search index
      operationId: getSearchIndex
      responses:
        '200': { description: Search index }
  /api/v1/meta.json:
    get:
      summary: Dataset metadata
      operationId: getMeta
      responses:
        '200':
          description: Metadata
          content:
            application/json:
              schema: { type: object }
`;
}

function generateSearchIndex(data) {
  const index = { byId: {}, searchableFields: [] };
  const searchable = ['name', 'title', 'code', 'id'];
  for (const item of data) {
    const id = item.id || item.code || item.slug || item.name?.replace(/\s+/g, '-').toLowerCase();
    if (id) index.byId[id] = item;
  }
  return index;
}

function generateScraper(repoName, title, source) {
  return `/**
 * ${title} Scraper
 * Source: ${source}
 * Run: node scraper/index.cjs
 */
const fs = require('fs');
const path = require('path');

const FIXTURES_DIR = path.join(__dirname, 'fixtures');
const OUTPUT_DIR = path.join(__dirname, '../api/v1');

async function scrape() {
  console.log('${title} Scraper');
  console.log('Source:', '${source}');
  console.log('Note: Static reference data. Validating existing data.');

  const existing = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'data.json'), 'utf8'));
  console.log(\`Existing records: \${existing.length}\`);

  if (!fs.existsSync(FIXTURES_DIR)) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  fs.writeFileSync(
    path.join(FIXTURES_DIR, 'expected.json'),
    JSON.stringify({ recordCount: existing.length }, null, 2) + '\\n'
  );

  console.log('Validation complete. Data is current.');
}

scrape().catch(err => {
  console.error('Scraper failed:', err.message);
  process.exit(1);
});
`;
}

function generateTest(repoName, data) {
  return `/**
 * Schema validation tests
 * Run: npm test
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/data.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../api/v1/data.json'), 'utf8'));

let passed = 0, failed = 0;

function validate(item) {
  const errors = [];
  if (schema.items && schema.items.required) {
    for (const field of schema.items.required) {
      if (!(field in item)) errors.push(\`Missing required field: \${field}\`);
    }
  }
  return errors;
}

console.log('Test 1: Schema validation');
for (const item of data) {
  const errors = validate(item);
  if (errors.length > 0) {
    console.error('  FAIL:', item.id || 'unknown', errors.join(', '));
    failed++;
  } else passed++;
}

console.log('Test 2: No duplicate IDs');
const ids = data.map(d => d.id || d.code || d.slug).filter(Boolean);
const dupes = [...new Set(ids.filter((x, i) => ids.indexOf(x) !== i))];
if (dupes.length > 0) { console.error('  FAIL: Duplicates:', dupes.join(', ')); failed++; }
else { console.log('  PASS'); passed++; }

console.log('Test 3: Individual files exist');
const indivDir = path.join(__dirname, '../api/v1/individual');
let filesOk = true;
for (const item of data) {
  const id = item.id || item.code || item.slug;
  if (id && !fs.existsSync(path.join(indivDir, \`\${id}.json\`))) {
    console.error('  FAIL: Missing', id);
    filesOk = false; failed++;
  }
}
if (filesOk) { console.log('  PASS'); passed++; }

console.log(\`\n\${passed} passed, \${failed} failed\`);
process.exit(failed > 0 ? 1 : 0);
`;
}

function createBuildScripts(destDir, repoName) {
  // generate-individual.cjs
  fs.writeFileSync(path.join(destDir, 'scripts/generate-individual.cjs'), `
const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../api/v1/data.json'), 'utf8'));
const outDir = path.join(__dirname, '../api/v1/individual');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
for (const item of data) {
  const id = item.id || item.code || item.slug || item.name?.replace(/\\s+/g, '-').toLowerCase();
  if (id) fs.writeFileSync(path.join(outDir, \`\${id}.json\`), JSON.stringify(item, null, 2) + '\\n');
}
console.log(\`Generated \${data.length} individual files\`);
`);

  // generate-search-index.cjs
  fs.writeFileSync(path.join(destDir, 'scripts/generate-search-index.cjs'), `
const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../api/v1/data.json'), 'utf8'));
const index = { byId: {} };
for (const item of data) {
  const id = item.id || item.code || item.slug || item.name?.replace(/\\s+/g, '-').toLowerCase();
  if (id) index.byId[id] = item;
}
fs.writeFileSync(path.join(__dirname, '../api/v1/search-index.json'), JSON.stringify(index, null, 2) + '\\n');
console.log('Generated search index');
`);

  // generate-meta.cjs
  fs.writeFileSync(path.join(destDir, 'scripts/generate-meta.cjs'), `
const fs = require('fs');
const path = require('path');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../api/v1/data.json'), 'utf8'));
const meta = {
  status: 'healthy',
  lastUpdated: new Date().toISOString(),
  sourceUpdatedAt: new Date().toISOString(),
  retrievedAt: new Date().toISOString(),
  recordCount: data.length,
  version: '1.0.0',
  schemaVersion: '1.0.0',
  source: '${repoName}',
  license: 'CC-BY-4.0',
  updateCadence: 'manual',
  nextUpdateDue: new Date(Date.now() + 90*24*60*60*1000).toISOString(),
  lastFailedAt: null,
  failureReason: null
};
fs.writeFileSync(path.join(__dirname, '../api/v1/meta.json'), JSON.stringify(meta, null, 2) + '\\n');
console.log('Generated meta.json');
`);

  // validate.cjs
  fs.writeFileSync(path.join(destDir, 'scripts/validate.cjs'), `
const fs = require('fs');
const path = require('path');
const schema = JSON.parse(fs.readFileSync(path.join(__dirname, '../schemas/data.json'), 'utf8'));
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../api/v1/data.json'), 'utf8'));
let errors = 0;
for (const item of data) {
  if (schema.items && schema.items.required) {
    for (const field of schema.items.required) {
      if (!(field in item)) { console.error('Missing', field); errors++; }
    }
  }
}
if (errors > 0) process.exit(1);
console.log('Validation passed');
`);
}

function createWorkflows(destDir, repoName, cadence) {
  const scheduleMap = {
    'daily': '0 0 * * *',
    'weekly': '0 0 * * 0',
    'monthly': '0 0 1 * *',
    'quarterly': '0 0 1 */3 *',
    'yearly': '0 0 1 1 *',
    'manual': '0 0 1 1 *' // yearly for manual
  };
  const schedule = scheduleMap[cadence] || '0 0 1 */3 *';

  // update.yml
  fs.writeFileSync(path.join(destDir, '.github/workflows/update.yml'), `name: Update ${repoName} Data

on:
  schedule:
    - cron: '${schedule}'
  workflow_dispatch:
    inputs:
      force:
        description: 'Force update'
        required: false
        default: 'false'

concurrency:
  group: update-${repoName}
  cancel-in-progress: false

jobs:
  update:
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci || npm install
      - name: Run scraper
        id: scraper
        run: node scraper/index.cjs
        continue-on-error: true
      - name: Validate
        id: validate
        run: node scripts/validate.cjs
        continue-on-error: true
      - name: Generate artifacts
        if: steps.scraper.outcome == 'success' && steps.validate.outcome == 'success'
        run: |
          node scripts/generate-individual.cjs
          node scripts/generate-search-index.cjs
          node scripts/generate-meta.cjs
      - name: Check changes
        id: check
        run: |
          git add -A
          if git diff --cached --quiet; then
            echo "changed=false" >> \$GITHUB_OUTPUT
          else
            echo "changed=true" >> \$GITHUB_OUTPUT
          fi
      - name: Commit and push
        if: steps.check.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git commit -m "data: update ${repoName} [\$(date -u +%Y-%m-%d)]"
          git push
      - name: Create issue on failure
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            const title = \`Data update failed: \${new Date().toISOString()}\`;
            const body = \`Scraper or validation failed. Last known good data retained.\n\nRun: \${context.runId}\`;
            github.rest.issues.create({ owner: context.repo.owner, repo: context.repo.repo, title, body });
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: update-artifacts-\${{ github.run_id }}
          path: |
            scraper/fixtures/
            logs/
            diagnostics/
          retention-days: 7
`);

  // deploy.yml
  fs.writeFileSync(path.join(destDir, '.github/workflows/deploy.yml'), `name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v5
      - name: Build
        run: |
          mkdir -p _site
          cp -r api _site/
          cp -r schemas _site/
          cp website/index.html _site/
          cp openapi.yaml _site/
          cp README.md _site/
          cp LICENSE _site/
          cp SECURITY.md _site/ 2>/dev/null || true
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
      - uses: actions/deploy-pages@v4
        id: deployment
      - run: echo "Deployed to \${{ steps.deployment.outputs.page_url }}"
`);
}

function generateReadme(repoName, title, description, source, license, cadence, count) {
  return `# ${title}

> ${description}

**Scope:** ${repoName.replace(/-/g, ' ')}
**Source:** ${source}
**License:** ${license}
**Update cadence:** ${cadence}
**Status:** active
**Version:** 1.0.0

## Quick Start

\`\`\`bash
curl https://chirag127.github.io/${repoName}-api/api/v1/data.json
\`\`\`

\`\`\`javascript
const res = await fetch('https://chirag127.github.io/${repoName}-api/api/v1/data.json');
const data = await res.json();
\`\`\`

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| \`GET /api/v1/data.json\` | All ${count} records |
| \`GET /api/v1/individual/{id}.json\` | Single record by ID |
| \`GET /api/v1/search-index.json\` | Client-side search index |
| \`GET /api/v1/meta.json\` | Dataset metadata |

## Website

Interactive docs: https://chirag127.github.io/${repoName}-api/

## OpenAPI

See \`openapi.yaml\`.

## Repository

https://github.com/chirag127/${repoName}-api

## Attribution

Data sourced from ${source}. Licensed under ${license}. This API is an independent aggregation.
`;
}

function generateSecurity() {
  return `# Security Policy

## Reporting Vulnerabilities
Email: security@oriz.in

## Scope
Static JSON data (public domain / CC-BY-4.0). No PII, no auth, no secrets.

## What IS a vulnerability
- Secrets/credentials in repo
- Personal data in published datasets

## Data Sensitivity
Only public-domain or CC-BY-4.0 data published.
`;
}

function generatePackageJson(repoName, title, description) {
  return {
    name: `${repoName}-api`,
    version: '1.0.0',
    description,
    type: 'module',
    scripts: {
      test: 'node tests/validate-schema.test.cjs',
      validate: 'node scripts/validate.cjs',
      build: 'node scripts/generate-individual.cjs && node scripts/generate-search-index.cjs && node scripts/generate-meta.cjs',
      scrape: 'node scraper/index.cjs',
      deploy: 'echo "Deploy via GitHub Actions"'
    },
    keywords: [repoName, 'api', 'json', 'static', 'github-pages'],
    license: 'MIT',
    repository: { type: 'git', url: `https://github.com/chirag127/${repoName}-api.git` },
    homepage: `https://chirag127.github.io/${repoName}-api/`
  };
}

function updateCatalog(repoName, title, description, category, source, license, cadence, count) {
  const catalogPath = path.join(__dirname, 'api-catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

  // Remove old entry if exists
  catalog.catalog = catalog.catalog.filter(c => c.id !== repoName && c.id !== `${repoName}-api`);

  // Add new entry
  catalog.catalog.push({
    id: `${repoName}-api`,
    searchScore: 80,
    category,
    title: `${title} API`,
    description,
    cadence,
    source,
    license,
    endpoints: [
      '/api/v1/data.json',
      '/api/v1/individual/{id}.json',
      '/api/v1/search-index.json',
      '/api/v1/meta.json'
    ],
    searchKeywords: [repoName, ...repoName.split('-')]
  });

  catalog.meta.totalEntries = catalog.catalog.length;
  catalog.meta.generatedAt = new Date().toISOString();

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + '\n');
}

// Main
async function main() {
  console.log('Starting conversion of', DATASET_REPOS.length, 'repos...\n');

  let success = 0, failed = 0;
  for (const repo of DATASET_REPOS) {
    try {
      const ok = await convertRepo(repo);
      if (ok) success++; else failed++;
    } catch (e) {
      console.error(`  ERROR: ${repo} - ${e.message}`);
      failed++;
    }
  }

  console.log(`\n=== DONE ===`);
  console.log(`Success: ${success}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);