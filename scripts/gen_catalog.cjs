#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const gitmodules = fs.readFileSync(path.join(root, '.gitmodules'), 'utf8');

// Parse .gitmodules
const subs = [];
const re = /\[submodule "([^"]+)"\]\s+path = ([^\n]+)\s+url = ([^\n]+)/g;
let m;
while ((m = re.exec(gitmodules)) !== null) {
  subs.push({ section: m[1].trim(), p: m[2].trim(), url: m[3].trim() });
}

// Load GitHub API metadata
const meta = {};
for (const f of ['p1.json', 'p2.json']) {
  const fp = path.join(root, '.tmp_catalog', f);
  if (!fs.existsSync(fp)) continue;
  try {
    const arr = JSON.parse(fs.readFileSync(fp, 'utf8'));
    for (const r of arr) {
      meta[r.name] = {
        description: r.description || '',
        language: r.language || '',
        homepage: r.homepage || '',
        archived: !!r.archived,
        fork: !!r.fork,
        stars: r.stargazers_count || 0,
      };
    }
  } catch (e) { /* ignore */ }
}

function nameOf(sub) {
  return sub.p.replace(/^repos\//, '');
}

// Curated fallbacks for private / undescribed repos
const FALLBACK = {
  'NassCom-AI-Data-Analysis-And-Modeling-Notebooks': 'NassCom AI data-analysis & modeling notebooks',
  'Stochastic-Thinking-MCP-Server': 'MCP server implementing stochastic/randomized reasoning strategies',
  'Witticismdo': 'Witty todo app',
  'agent-configs': 'Shared agent & assistant configuration files',
  'books': 'Personal books collection & notes',
  'cloud-automation': 'Cloud infrastructure automation scripts',
  'credit-disputes': 'Credit dispute letters & tracking documents',
  'email-blaster': 'Bulk email sending tool',
  'envpact-secrets': 'Encrypted secrets for envpact (sops+age)',
  'hai-cli-setup': 'Setup/config for AI CLI tools',
  'i2i-portfolio-data': 'Portfolio data feeds for i2i tools',
  'kt-transcripts': 'Knowledge-transfer session transcripts',
  'life-cli': 'Personal life-management CLI',
  'life-cli-secrets': 'Encrypted secrets for life-cli (sops+age)',
  'me-site-private-data': 'Private content/data for the personal site',
  'mf-mailer': 'Mutual-fund report mailer',
  'oriz-blog-career': 'Oriz blog — career vertical',
  'oriz-blog-devtools': 'Oriz blog — devtools vertical',
  'oriz-blog-entertainment': 'Oriz blog — entertainment vertical',
  'oriz-kt-search': 'Search over knowledge-transfer transcripts',
  'personal-vault': 'Encrypted personal vault (sops+age)',
  'prompts': 'Curated LLM prompt library',
  'qbittorrent-bitsearch': 'qBittorrent automation via BitSearch',
  'rag-lens': 'RAG pipeline inspection/debugging tool',
  'releases': 'Release artifacts & notes hub',
  'sap-cpq-automation': 'SAP CPQ workflow automation',
  'screenpipe': 'Fork of screenpipe — 24/7 screen & audio capture',
  'searxng-local': 'Local SearXNG metasearch instance setup',
  'servicenow-mcp': 'MCP server for ServiceNow',
  'sms-txn-watch': 'SMS transaction watcher/parser',
  'sops-lens': 'VS Code extension for viewing sops-encrypted files',
  'sound-scraper': 'Audio/sound scraping tooling',
  'sponsorblock-ai': 'AI-assisted SponsorBlock segment tooling',
  'tickertape-mmi': 'Tickertape MMI (market mood index) tracker',
  'userscripts': 'Collection of browser userscripts (Tampermonkey)',
  'video-download': 'Video download helper scripts',
  'workflows': 'Reusable GitHub Actions workflows',
  'youtube-ai-navigator-bs-ext': 'Browser extension to navigate YouTube with AI summaries/jump links',
  'youtube-content-automation': 'YouTube content pipeline automation',
  'zenfocus-bs-ext': 'Focus/zen-mode browser extension',
  'si-units': 'Static JSON API — SI units reference',
  'rbi-rates': 'Static JSON API — RBI policy rates',
  'sql-functions': 'Static JSON API — SQL function reference',
  'unicode-blocks': 'Static JSON API — Unicode block reference',
  'timezone-data': 'Static JSON API — timezone data',
  'software-licenses': 'Static JSON API — software license reference',
  'regex-tokens': 'Static JSON API — regex token reference',
  'upsc-syllabus': 'Static JSON API — UPSC syllabus',
  'savings-rates': 'Static JSON API — savings account rates',
  'tds-rates': 'Static JSON API — TDS rates',
  'stock-exchanges': 'Static JSON API — stock exchanges reference',
  'reit-data': 'Static JSON API — REIT data',
  'vegetables': 'Static JSON API — vegetables reference',
  'quotes': 'Static JSON API — quotes collection',
  'typography-terms': 'Static JSON API — typography terms glossary',
  'smartphones': 'Static JSON API — smartphone specs',
  'usb-standards': 'Static JSON API — USB standards reference',
  'wifi-standards': 'Static JSON API — Wi-Fi standards reference',
};

function categorize(name, info) {
  if (/^oriz-blog-/.test(name)) return 'Oriz Blog Network';
  if (/mcp/.test(name)) return 'MCP Servers';
  if (/-bs-ext$/.test(name)) return 'Browser Extensions';
  if (['OmniRoute', 'freellmapi', 'freellmpool', 'screenpipe'].includes(name)) return 'Forked Infrastructure';
  if (/^oz-/.test(name)) return 'Oz Tools';
  if (/^(india|http|mime|iso|ncert|si-units|rbi|countries|currencies|languages|continents|country-|emoji|timezone|json-schema|css-|html-|javascript-|software-licenses|regex-|crypto-|nav-units|jee-|neet-|gate-|upsc-|math-|physics-|chemistry-|periodic-|programming-|git-commands|linux-commands|sql-functions|file-extensions|indian-|fd-rates|savings-rates|gst-rates|income-tax|tds-rates|ipo-calendar|ipo-performance|mutual-fund|stock-exchanges|reit-data|currency-rates|gsec-rates|fruits|vegetables|crop-seasons|colors|quotes|holiday-world|typography-terms|smartphones|mobile-chipsets|usb-standards|wifi-standards|android-versions|gpus|display-panels|cricket-|nutrition)/.test(name)) return 'Static JSON Data APIs';
  if (/^oriz-/.test(name)) return 'Oriz Apps & Tools';
  if (['agent-configs', 'books', 'books-summary', 'book-vault', 'credit-disputes', 'personal-vault', 'me-site-private-data', 'life-cli-secrets', 'envpact-secrets', 'kt-transcripts', 'claude-cert-videos', 'i2i-portfolio-data', 'prompts', 'games', 'olivia'].includes(name)) return 'Personal & Private';
  return 'Projects, Tools & Automation';
}

// Build catalog
const groups = new Map();
let missingDesc = [];
for (const sub of subs) {
  const name = nameOf(sub);
  const info = meta[name] || {};
  if (!info.description) {
    if (FALLBACK[name]) info.description = FALLBACK[name];
    else { info.description = ''; missingDesc.push(name); }
  }
  const cat = categorize(name, info);
  if (!groups.has(cat)) groups.set(cat, []);
  groups.get(cat).push({ name, url: sub.url, ...info });
}

const sortedCats = [...groups.keys()].sort((a, b) => a.localeCompare(b));

let out = `# Repository Catalog\n\n`;
out += `Monorepo of ${subs.length} submodules, all at flat \`repos/<name>\` paths.\n`;
out += `Registered in [\`.gitmodules\`](.gitmodules). Clone everything with:\n\n`;
out += '```bash\ngit clone --recurse-submodules <this-repo-url>\n# or, for an already-cloned repo:\ngit submodule update --init --recursive\n```\n\n';

out += `## Contents\n\n`;
for (const cat of sortedCats) {
  const list = groups.get(cat);
  out += `- [${cat}](#${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}) (${list.length})\n`;
}
out += `\n---\n`;

for (const cat of sortedCats) {
  const list = groups.get(cat).sort((a, b) => a.name.localeCompare(b.name));
  out += `\n## ${cat}\n\n`;
  out += `| Repo | Description |\n|------|-------------|\n`;
  for (const r of list) {
    let desc = r.description || '*No description*';
    // Escape pipes for markdown tables
    desc = desc.replace(/\|/g, '\\|');
    const badges = [];
    if (r.archived) badges.push('🗄️ archived');
    if (r.fork) badges.push('🍴 fork');
    if (badges.length) desc += ` (${badges.join(', ')})`;
    out += `| [${r.name}](${r.url.replace(/\.git$/, '')}) | ${desc} |\n`;
  }
}

fs.writeFileSync(path.join(root, 'README.md'), out);
console.log(`Wrote README.md: ${subs.length} submodules across ${sortedCats.length} categories`);
if (missingDesc.length) console.log(`No GitHub description found for ${missingDesc.length}: ${missingDesc.join(', ')}`);
