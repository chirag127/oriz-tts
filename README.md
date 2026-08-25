# Repository Catalog

Monorepo of 251 submodules, all at flat `repos/<name>` paths.
Registered in [`.gitmodules`](.gitmodules). Clone everything with:

```bash
git clone --recurse-submodules <this-repo-url>
# or, for an already-cloned repo:
git submodule update --init --recursive
```

## Contents

- [Browser Extensions](#browser-extensions) (5)
- [Forked Infrastructure](#forked-infrastructure) (4)
- [MCP Servers](#mcp-servers) (4)
- [Oriz Apps & Tools](#oriz-apps-tools) (44)
- [Oriz Blog Network](#oriz-blog-network) (26)
- [Oz Tools](#oz-tools) (4)
- [Personal & Private](#personal-private) (15)
- [Projects, Tools & Automation](#projects-tools-automation) (69)
- [Static JSON Data APIs](#static-json-data-apis) (80)

---

## Browser Extensions

| Repo | Description |
|------|-------------|
| [chronokeep-bs-ext](https://github.com/chirag127/chronokeep-bs-ext) | Auto-archive every page you visit to the Wayback Machine. MV3 browser extension, 100% client-side, no account. Chrome/Firefox/Edge. |
| [ghosttyper-bs-ext](https://github.com/chirag127/ghosttyper-bs-ext) | GhostTyper — Copilot-style inline AI writing suggestions in any text field, Tab to accept. 100% client-side, 7 providers (Pollinations free default + Groq/Cerebras/Gemini/OpenRouter/Mistral/Custom). MV3. |
| [peekinsight-bs-ext](https://github.com/chirag127/peekinsight-bs-ext) | AI-powered browser extension for instant link previews. Hover over any URL to get concise AI summaries, read times, and credibility scores without leaving your page. Boost research and productivity with on-demand context, powered by Gemini. |
| [youtube-ai-navigator-bs-ext](https://github.com/chirag127/youtube-ai-navigator-bs-ext) | Browser extension to navigate YouTube with AI summaries/jump links |
| [zenfocus-bs-ext](https://github.com/chirag127/zenfocus-bs-ext) | Focus/zen-mode browser extension |

## Forked Infrastructure

| Repo | Description |
|------|-------------|
| [freellmapi](https://github.com/chirag127/freellmapi) | OpenAI-compatible proxy that stacks the free tiers of 28 LLM providers (~4B tokens/month) behind one /v1 endpoint — plus any custom OpenAI-compatible endpoint. Smart routing, automatic failover, encrypted keys. Personal experimentation only. (🍴 fork) |
| [freellmpool](https://github.com/chirag127/freellmpool) | Free LLM API pool: 24 LLM providers cataloged, 222 routes, 407 cataloged chat models, keyless start when available. (🍴 fork) |
| [OmniRoute](https://github.com/chirag127/OmniRoute) | Never stop coding. Free MIT AI gateway: one endpoint, 290+ providers (90+ free), 500+ models — Kimi, Claude, GPT, OpenAI, Gemini, GLM, DeepSeek, MiniMax. Works with Claude Code, Codex, Cursor, OpenCode, Cline & Copilot. Quota-aware auto-fallback, RTK+Caveman compression saves 15-95% tokens, MCP/A2A, Desktop/PWA. Built by 500+ contributors (🍴 fork) |
| [screenpipe](https://github.com/chirag127/screenpipe) | Fork of screenpipe — 24/7 screen & audio capture |

## MCP Servers

| Repo | Description |
|------|-------------|
| [envpact-mcp-server](https://github.com/chirag127/envpact-mcp-server) | MCP server for envpact — bring centralized secret management to AI coding agents (Cursor, Windsurf, Claude Code) |
| [knowledge-mcp](https://github.com/chirag127/knowledge-mcp) | Public MCP server exposing chirag127's OKF knowledge bundle — search, read, list, related. No auth. CF Worker. |
| [mdv-mcp](https://github.com/chirag127/mdv-mcp) | Local, private MCP server for a markdown/Obsidian vault - NVIDIA nemotron-3-embed-1b semantic search, pure-JS int8 vector store, read/write/delete tools. Local only, never published to npm. |
| [servicenow-mcp](https://github.com/chirag127/servicenow-mcp) | MCP server for ServiceNow |

## Oriz Apps & Tools

| Repo | Description |
|------|-------------|
| [oriz-auth-app](https://github.com/chirag127/oriz-auth-app) | oriz central auth — Clerk-powered SSO hub for *.oriz.in (account.oriz.in / auth.oriz.in) |
| [oriz-blog](https://github.com/chirag127/oriz-blog) | Personal blog — chirag127.dev. Built with Astro. |
| [oriz-brain](https://github.com/chirag127/oriz-brain) | Ambient personal-AI OS — thin orchestrator consolidating the fleet's ingest/memory/reason/notify pieces |
| [oriz-broker-compare](https://github.com/chirag127/oriz-broker-compare) | Every Indian stock broker's real charges, compared — 30 brokers × 12 fields, verified & sourced. broker-compare.oriz.in |
| [oriz-cards](https://github.com/chirag127/oriz-cards) | oriz-cards — India card intelligence platform: credit/debit/prepaid cards across 12 banks. Static catalog + comparison UI. Lives at cards.oriz.in. |
| [oriz-case](https://github.com/chirag127/oriz-case) | Case & format converter for devs/writers — camelCase, snake_case, kebab, PascalCase, CONSTANT, Title, Sentence + code-identifier reformatting. 100% client-side. |
| [oriz-chat](https://github.com/chirag127/oriz-chat) | Free client-side AI chat — multi-turn, model picker, markdown, IndexedDB history, presets, export. No signup, runs in your browser. |
| [oriz-color](https://github.com/chirag127/oriz-color) | Color studio — picker, palette + gradient generator, WCAG contrast checker, extract palette from image, hex/rgb/hsl/oklch convert. 100% client-side. |
| [oriz-convert](https://github.com/chirag127/oriz-convert) | Universal converter — CSV/JSON/YAML/XML, units, number bases, color formats. 100% client-side, no upload, no signup. Live: https://convert.oriz.in |
| [oriz-dev](https://github.com/chirag127/oriz-dev) | Keyboard-first terminal developer multitool — JSON, base64, JWT, URL, UUID, timestamp, cron, hash, diff, regex. 100% client-side, no upload, no signup. |
| [oriz-diagram](https://github.com/chirag127/oriz-diagram) | Diagram-as-code — client-side Mermaid live editor with SVG/PNG export and flowchart/sequence/ER/gantt/class templates. No upload, no signup. |
| [oriz-envpact-dashboard-app](https://github.com/chirag127/oriz-envpact-dashboard-app) | Web dashboard for envpact — visual secret management via GitHub OAuth (Astro + Cloudflare Pages) |
| [oriz-finance](https://github.com/chirag127/oriz-finance) | Finance calculators site - EMI, SIP, mutual fund returns, tax (India + US), retirement, mortgage, currency, P/E, NPS. Built with Astro 6 + React 19 islands + Tailwind v4. Pure-JS computations, no server. Static site, deployed to Cloudflare Pages at https://finance.oriz.in. Free, no card-on-file. |
| [oriz-finance-compare](https://github.com/chirag127/oriz-finance-compare) | India financial product comparison + analysis hub — zero-balance bank accounts, private banks (stocks & investments planned). Data tables + static site. |
| [oriz-hash](https://github.com/chirag127/oriz-hash) | Client-side crypto/hash toolkit — SHA-1/256/384/512, HMAC, base64/hex, random bytes, password generator + strength, UUID. 100% in-browser, no upload. |
| [oriz-home](https://github.com/chirag127/oriz-home) | oriz.in home dashboard — personal command centre. |
| [oriz-img](https://github.com/chirag127/oriz-img) | Client-side image toolkit — resize, crop, compress, convert (PNG/JPEG/WebP) & strip EXIF. 100% in-browser, no upload. https://img.oriz.in |
| [oriz-invoice](https://github.com/chirag127/oriz-invoice) | GST-aware invoice generator — line items, auto totals+tax, multi-currency, logo, print→PDF, amount-in-words. 100% client-side, no signup. |
| [oriz-ipo](https://github.com/chirag127/oriz-ipo) | Hourly India IPO grey-market-premium (GMP) analyzer + ipo.oriz.in terminal — scrapes live GMP across sources, ranks by GMP (>5%), gathers YouTube reviews, notifies Telegram/ntfy, publishes per-IPO blog. |
| [oriz-json](https://github.com/chirag127/oriz-json) | JSON power tool that runs 100% in your browser: format, validate, tree view, JSONPath, JSON/CSV, diff, sort keys. No upload, no signup. |
| [oriz-knowledge-site](https://github.com/chirag127/oriz-knowledge-site) | Astro source for knowledge.oriz.in — 828 OKF concept files rendered as a warm-paper reader |
| [oriz-kt-search](https://github.com/chirag127/oriz-kt-search) | Search over knowledge-transfer transcripts |
| [oriz-links-site](https://github.com/chirag127/oriz-links-site) | Astro source for links.oriz.in — curated 2026 best-programmer-sites, editorial magazine style |
| [oriz-lore](https://github.com/chirag127/oriz-lore) | Lore app — story and world-building knowledge base. |
| [oriz-md](https://github.com/chirag127/oriz-md) | Markdown Studio — split-screen zen editor with live GFM preview, syntax highlighting, TOC, HTML export & print-to-PDF. 100% client-side. |
| [oriz-me](https://github.com/chirag127/oriz-me) | me.oriz.in — Chirag Singhal personal media hub: music, movies, anime, books, TV |
| [oriz-mmi](https://github.com/chirag127/oriz-mmi) | Tickertape Market Mood Index (MMI) tracker — hourly India fear/greed sentiment gauge + dark dial site + Telegram/ntfy notifications |
| [oriz-muse](https://github.com/chirag127/oriz-muse) | AI writing studio — generate stories, poems, lyrics, blogs & essays, continue drafts, rewrite in styles. 100% client-side, no signup. https://muse.oriz.in |
| [oriz-name](https://github.com/chirag127/oriz-name) | Neon-marquee name generator for brands, products, startups, usernames and repos — vibe controls + client-side availability heuristics + AI taglines. 100% client-side. |
| [oriz-ncert](https://github.com/chirag127/oriz-ncert) | NCERT textbook content — structured markdown for AI agent consumption and study. |
| [oriz-networth](https://github.com/chirag127/oriz-networth) | Free, India-first net-worth & portfolio tracker — browser-only, no sign-up, git-as-DB. Astro + Cloudflare Pages. |
| [oriz-nifty-signal](https://github.com/chirag127/oriz-nifty-signal) | Nifty market-timing signal — is now a good time to buy Indian equity? Valuation (PE, Buffett indicator) + sentiment (MMI) verdict, daily. |
| [oriz-palette-ai](https://github.com/chirag127/oriz-palette-ai) | AI brand-kit generator — describe a brand, get palette + font pairing + tagline + logo-idea prompt, preview a mock landing card, export CSS/JSON tokens. 100% client-side. |
| [oriz-pdf](https://github.com/chirag127/oriz-pdf) | Blueprint PDF toolkit — merge, split, rotate, reorder, extract pages/text/images, images→PDF. 100% client-side, no upload, no signup. https://pdf.oriz.in |
| [oriz-persona](https://github.com/chirag127/oriz-persona) | AI character chat — create personas (name/traits/voice), roleplay chat, save characters, share via URL. 100% client-side, no server. |
| [oriz-portfolio-lab](https://github.com/chirag127/oriz-portfolio-lab) | Max-Sharpe portfolio studio for India — combine equity, intl ETFs, gold & P2P into a risk-adjusted-return allocation with honest downside. Free, browser-only, no sign-up. |
| [oriz-qr](https://github.com/chirag127/oriz-qr) | QR studio — generate (URL, text, Wi-Fi, contact, UPI, email, SMS), restyle colors + logo, and scan via camera. 100% client-side, no upload, no signup. https://qr.oriz.in |
| [oriz-quiz](https://github.com/chirag127/oriz-quiz) | AI quiz + flashcard maker — paste notes/topic, generate MCQ quiz or SM-2 spaced-repetition flashcards, take the quiz, score, export. 100% client-side, no signup. quiz.oriz.in |
| [oriz-resume](https://github.com/chirag127/oriz-resume) | Client-side ATS-clean resume builder — form → templates, live preview, print→PDF, autosave, JSON import/export. resume.oriz.in |
| [oriz-screen-watch](https://github.com/chirag127/oriz-screen-watch) | screener.in fundamentals + Nifty500-Value-50-style value-score tracker for Indian value stocks |
| [oriz-status](https://github.com/chirag127/oriz-status) | Custom status page + uptime monitoring for the oriz.in family (CF Worker cron + KV + Astro static) |
| [oriz-story-dice](https://github.com/chirag127/oriz-story-dice) | Creative play: story dice, writing-prompt roller, would-you-rather, this-or-that. AI-expandable, shareable, 100% client-side. |
| [oriz-text](https://github.com/chirag127/oriz-text) | Writing-desk text toolkit: case convert, word/char count, dedupe/sort lines, slugify, lorem, reverse, whitespace, find & replace + optional AI polish. 100% client-side. |
| [oriz-tts](https://github.com/chirag127/oriz-tts) | Text-to-speech in your browser — pick a voice, dial rate & pitch, watch words light up as spoken. 100% client-side, no upload, no signup. |

## Oriz Blog Network

| Repo | Description |
|------|-------------|
| [oriz-blog-ai](https://github.com/chirag127/oriz-blog-ai) | latent — a working log on building AI systems that survive production. Astro blog, lab-notebook identity. https://ai-blog.oriz.in |
| [oriz-blog-arts](https://github.com/chirag127/oriz-blog-arts) | The Maker's Bench — practical arts and crafts writing: daily drawing, hand-lettering, and earning from what you make. |
| [oriz-blog-beauty](https://github.com/chirag127/oriz-blog-beauty) | Lumen — plain, tested skincare notes. Astro blog with a bespoke Beauty & Skincare identity. Live: https://beauty-blog.oriz.in |
| [oriz-blog-business](https://github.com/chirag127/oriz-blog-business) | The Ledger — field notes for founders and freelancers: validating ideas cheaply, pricing your work, landing the first 10 customers. business-blog.oriz.in |
| [oriz-blog-career](https://github.com/chirag127/oriz-blog-career) | Oriz blog — career vertical |
| [oriz-blog-devtools](https://github.com/chirag127/oriz-blog-devtools) | Oriz blog — devtools vertical |
| [oriz-blog-education](https://github.com/chirag127/oriz-blog-education) | The Margin — a study log. How to learn to code, study methods that stick, and the best free learning resources. Astro. |
| [oriz-blog-entertainment](https://github.com/chirag127/oriz-blog-entertainment) | Oriz blog — entertainment vertical |
| [oriz-blog-finance](https://github.com/chirag127/oriz-blog-finance) | Compound — plain money notes for Indian investors and savers. Distinct Astro finance blog. finance-blog.oriz.in |
| [oriz-blog-food](https://github.com/chirag127/oriz-blog-food) | The Test Kitchen Ledger — recipes tested on a real weeknight. Astro food blog at food-blog.oriz.in. |
| [oriz-blog-gaming](https://github.com/chirag127/oriz-blog-gaming) | Arcade-dusk gaming blog — games, gear, and getting good. Astro 6. Live: https://gaming-blog.oriz.in |
| [oriz-blog-health](https://github.com/chirag127/oriz-blog-health) | Vitals — a calm, evidence-minded health & fitness blog on sleep, strength, and stress. Astro. health-blog.oriz.in |
| [oriz-blog-hobbies](https://github.com/chirag127/oriz-blog-hobbies) | The Bench — hobbies & gear starter guides. Distinct Astro blog for hobbies-blog.oriz.in |
| [oriz-blog-home-diy](https://github.com/chirag127/oriz-blog-home-diy) | The Workbench — Home & DIY projects with real steps, tool lists, and honest costs. Astro blog for home-diy-blog.oriz.in |
| [oriz-blog-lifestyle](https://github.com/chirag127/oriz-blog-lifestyle) | Slow Hours — a calm lifestyle blog on minimalism, daily routines and simple living. Astro, bespoke identity. |
| [oriz-blog-marketing](https://github.com/chirag127/oriz-blog-marketing) | RankRoom — plain, tested marketing & SEO tactics. Distinct SERP-native Astro blog. |
| [oriz-blog-news](https://github.com/chirag127/oriz-blog-news) | The Standpoint — a news & commentary desk that sorts signal from noise. Astro blog, news-blog.oriz.in |
| [oriz-blog-parenting](https://github.com/chirag127/oriz-blog-parenting) | Kitchen Table — calm, practical, judgement-free writing on raising kids and family life. Astro. |
| [oriz-blog-pets](https://github.com/chirag127/oriz-blog-pets) | PawPost — practical, science-checked pet care for dogs and cats. |
| [oriz-blog-relationships](https://github.com/chirag127/oriz-blog-relationships) | Between — a relationships letter. Practical, warm writing on communication, distance, and boundaries. |
| [oriz-blog-remote-work](https://github.com/chirag127/oriz-blog-remote-work) | Off-Grid — a remote work & freelancing blog. Astro, distinct timezone-dashboard identity. remote-work-blog.oriz.in |
| [oriz-blog-self-dev](https://github.com/chirag127/oriz-blog-self-dev) | practicelog — a working log of habits, focus, and follow-through. self-dev-blog.oriz.in |
| [oriz-blog-sports](https://github.com/chirag127/oriz-blog-sports) | The Chalkboard — a sports blog: scorecards, tactics, and training, broken down for fans. sports-blog.oriz.in |
| [oriz-blog-sustainability](https://github.com/chirag127/oriz-blog-sustainability) | Compost — a sustainable-living notebook. Low-waste habits, honest claim-checking, repair over replace. Astro. |
| [oriz-blog-tech](https://github.com/chirag127/oriz-blog-tech) | Software, drawn to scale — a software-engineering blog. Astro, tech-blog.oriz.in |
| [oriz-blog-travel](https://github.com/chirag127/oriz-blog-travel) | Field notes for Indian travellers — budget routes, solo-travel safety, and digital-nomad visas. Astro blog at travel-blog.oriz.in. |

## Oz Tools

| Repo | Description |
|------|-------------|
| [oz-ai](https://github.com/chirag127/oz-ai) | Single client-side AI client for the fleet — wraps g4f/gpt4free with multi-provider failover (Pollinations, DeepInfra, Puter). Framework-agnostic TS. No API key. |
| [oz-chrome](https://github.com/chirag127/oz-chrome) | Shared Astro header/footer/shell for oriz.in sites. Themes via --oz-* tokens; no fixed brand look. |
| [oz-file](https://github.com/chirag127/oz-file) | Framework-agnostic browser file helpers: FileReader promises, Blob download, drag-drop, print-to-PDF, byte formatting. Zero deps. |
| [oz-tokens-base](https://github.com/chirag127/oz-tokens-base) | The --oz-* CSS custom-property contract: color roles, space scale, radii, font slots, motion. Pure CSS, no JS, zero deps. |

## Personal & Private

| Repo | Description |
|------|-------------|
| [agent-configs](https://github.com/chirag127/agent-configs) | Shared agent & assistant configuration files |
| [book-vault](https://github.com/chirag127/book-vault) | *No description* |
| [books](https://github.com/chirag127/books) | Personal books collection & notes |
| [books-summary](https://github.com/chirag127/books-summary) | *No description* |
| [claude-cert-videos](https://github.com/chirag127/claude-cert-videos) | Claude Certified Developer Foundations courses turned into small, chaptered, narrated study videos (TTS + ffmpeg) |
| [credit-disputes](https://github.com/chirag127/credit-disputes) | Credit dispute letters & tracking documents |
| [envpact-secrets](https://github.com/chirag127/envpact-secrets) | Encrypted secrets for envpact (sops+age) |
| [games](https://github.com/chirag127/games) | oriz.games — free browser games (2048, Sudoku, Tetris, Chess & more). Pure HTML/CSS/JS PWA, offline-capable, no install/login. https://games.oriz.in |
| [i2i-portfolio-data](https://github.com/chirag127/i2i-portfolio-data) | Portfolio data feeds for i2i tools |
| [kt-transcripts](https://github.com/chirag127/kt-transcripts) | Knowledge-transfer session transcripts |
| [life-cli-secrets](https://github.com/chirag127/life-cli-secrets) | Encrypted secrets for life-cli (sops+age) |
| [me-site-private-data](https://github.com/chirag127/me-site-private-data) | Private content/data for the personal site |
| [olivia](https://github.com/chirag127/olivia) | Olivia — a modular Python voice assistant for Windows. Speech-to-text + text-to-speech control for search, weather, news, translation, system monitoring, automation, and more. |
| [personal-vault](https://github.com/chirag127/personal-vault) | Encrypted personal vault (sops+age) |
| [prompts](https://github.com/chirag127/prompts) | Curated LLM prompt library |

## Projects, Tools & Automation

| Repo | Description |
|------|-------------|
| [agent-forge](https://github.com/chirag127/agent-forge) | Multi-agent LLM orchestrator — planner/executor, tool-calling, eval harness. Keyless (g4f). Python. |
| [aktu-cs](https://github.com/chirag127/aktu-cs) | AI-generated CS engineering study notes + lab portfolios for all 8 semesters (AKTU syllabus) — compiler design, DBMS, ML, DAA, networks, software engineering lab, and more. Markdown, per-semester. |
| [automation-scripts](https://github.com/chirag127/automation-scripts) | Personal collection of one-off automation & scraping scripts — AdGuard filter tooling, Chrome Web Store, Discord/Telegram bots, AI-API clients, web scraping. Secrets via sops+age. |
| [bookmark-mind](https://github.com/chirag127/bookmark-mind) | Browser extension that auto-organizes bookmarks with any OpenAI-compatible LLM — bring your own key. 13 built-in providers (Groq, OpenRouter, Gemini, Mistral, DeepSeek, OpenAI, LM Studio, Ollama, LiteLLM…) + any custom endpoint via one uniform adapter. AES-256-GCM key storage, provider fallback, zero telemetry. |
| [Campaign-Manager](https://github.com/chirag127/Campaign-Manager) | AdVantage: A unified SaaS platform for managing multi-channel ad campaigns (Google Ads, Meta, etc.) with real-time analytics, lead tracking, and a cross-platform dashboard (React web & React Native mobile). Built with Node.js & MongoDB. (🗄️ archived) |
| [cinesense](https://github.com/chirag127/cinesense) | AI movie recommender: TF-IDF content-based filtering + IMDb sentiment analysis. Flask, scikit-learn, TMDB dataset. |
| [Clear-Thought-MCP-server](https://github.com/chirag127/Clear-Thought-MCP-server) | MCP server providing systematic thinking, mental models, and debugging approaches for enhanced LLM problem-solving |
| [cloud-automation](https://github.com/chirag127/cloud-automation) | Cloud infrastructure automation scripts |
| [ContentSync-MultiPlatform-Content-Syndication-Web-App](https://github.com/chirag127/ContentSync-MultiPlatform-Content-Syndication-Web-App) | Automated content syndication system publishing Markdown to multiple platforms and generating a static website. Supports Dev.to, Hashnode, Medium, WordPress, and more. Features idempotency, CLI, and CI/CD. |
| [deploy-kit](https://github.com/chirag127/deploy-kit) | Kubernetes + Terraform + GitHub Actions GitOps reference deploy for a containerized service. |
| [design-system](https://github.com/chirag127/design-system) | Framework-agnostic design system for oriz.in sites — atomic @chirag127/* packages (tokens, themes, web-component atoms). One package set, a distinct look per site. |
| [email-blaster](https://github.com/chirag127/email-blaster) | Bulk email sending tool |
| [envpact](https://github.com/chirag127/envpact) | $0 serverless Git-backed secrets manager for solo devs: one private repo, shared keys, CLI + MCP + VS Code + GitHub Action. |
| [envpact-gh-action](https://github.com/chirag127/envpact-gh-action) | GitHub Action for envpact — sync secrets from your private vault to CI/CD |
| [envpact-npm-cli](https://github.com/chirag127/envpact-npm-cli) | Centralized, serverless secrets manager CLI for solo devs (Node.js, zero dependencies) |
| [envpact-registry-publisher-npm-cli](https://github.com/chirag127/envpact-registry-publisher-npm-cli) | Programmatic submission of MCP servers to every public registry (Smithery, official, glama, mcp.so, awesome-mcp-servers). Run on every npm publish. |
| [envpact-vscode-vsc-ext](https://github.com/chirag127/envpact-vscode-vsc-ext) | VS Code extension for envpact — manage centralized secrets visually inside the editor |
| [fii-dii-activity-api](https://github.com/chirag127/fii-dii-activity-api) | FII/DII activity tracker API for Indian equity markets. Daily institutional flow data. |
| [filter-lists](https://github.com/chirag127/filter-lists) | Custom DNS + browser filter lists supplementing OISD + AdGuard defaults. Adblock, domains, and hosts formats for NextDNS, AdGuard, uBlock Origin, Pi-hole. |
| [filter-report](https://github.com/chirag127/filter-report) | Multi-platform ad/tracker/cookie-popup/annoyance filter report preparer. Pre-fills issue templates for uBlock, AdGuard, EasyList, Brave, DandelionSprout for 1-click human submit. |
| [Gitanest](https://github.com/chirag127/Gitanest) | Manifest V3 browser extension that shows a random Bhagavad Gita verse + meaning on click. |
| [go-vault](https://github.com/chirag127/go-vault) | High-performance Go microservice — gRPC, Postgres, Redis cache, Prometheus metrics, Docker. |
| [google-transparency-report-analysis](https://github.com/chirag127/google-transparency-report-analysis) | Independent data analysis + visualization of Google's complete Transparency Report -- copyright removals, government requests, HTTPS, Safe Browsing, and more. Notebook + CLI + static data-viz site. |
| [hai-cli-setup](https://github.com/chirag127/hai-cli-setup) | Setup/config for AI CLI tools |
| [happy](https://github.com/chirag127/happy) | Mobile and Web client for Codex and Claude Code, with realtime voice, encryption and fully featured (🍴 fork) |
| [human-eval](https://github.com/chirag127/human-eval) | A robust Python framework for benchmarking the functional correctness of Large Language Models (LLMs) on code generation tasks. Automate evaluation of model-generated code against problem-solving datasets with detailed pass@k metrics, ensuring reliable and secure assessment. (🍴 fork) |
| [i2i-yield-watch](https://github.com/chirag127/i2i-yield-watch) | Automated high-yield loan intelligence for i2iFunding. Scrapes every 5 min, sends Telegram/ntfy/Email/Discord alerts, live Firestore-backed dashboard. |
| [innercord-internship](https://github.com/chirag127/innercord-internship) | Internship documentation and project report from InnerCord — includes PDF report, presentation, and markdown notes. |
| [Installation-Instructions](https://github.com/chirag127/Installation-Instructions) | Step-by-step guide for installing browser extensions on desktop (Chrome/Edge) and mobile (Kiwi), or running one as a plain website. |
| [itsm-auto-responder](https://github.com/chirag127/itsm-auto-responder) | Generic ITSM incident auto-responder with multi-LLM support and GitHub Actions cron |
| [janaushadhi-ecommerce-astro](https://github.com/chirag127/janaushadhi-ecommerce-astro) | Jan Aushadhi generic medicine store — Astro static storefront. |
| [janaushadhi-ecommerce-laravel](https://github.com/chirag127/janaushadhi-ecommerce-laravel) | Jan Aushadhi generic medicine store — Laravel PHP storefront with Razorpay payments. |
| [janaushadhi-ecommerce-nextjs](https://github.com/chirag127/janaushadhi-ecommerce-nextjs) | Jan Aushadhi generic medicine store — Next.js storefront with Razorpay payments. |
| [janaushadhi-ecommerce-wordpress](https://github.com/chirag127/janaushadhi-ecommerce-wordpress) | Jan Aushadhi generic medicine store — WordPress + WooCommerce storefront. |
| [kirtuclub-downloader](https://github.com/chirag127/kirtuclub-downloader) | Unified Python CLI to download, assemble, OCR, and merge comic PDFs (download → topdf → ocr → merge). |
| [leak-finder](https://github.com/chirag127/leak-finder) | Local-first CLI that finds money leaks in Indian bank statements (PDFs) |
| [lendenclub-helper](https://github.com/chirag127/lendenclub-helper) | *No description* |
| [life-cli](https://github.com/chirag127/life-cli) | Personal life-management CLI |
| [LyricLens-AI-Song-Meaning-Web-App](https://github.com/chirag127/LyricLens-AI-Song-Meaning-Web-App) | Client-side AI song-meaning + multi-source lyrics web app — searches lyrics.ovh, LRCLIB, Genius, and LLM knowledge; explains meanings and searches the web automatically. 100% client-side, BYO free AI key. |
| [memoria-android](https://github.com/chirag127/memoria-android) | Memoria — Android-native Life Memory OS. Git/Obsidian-vault-backed personal memory, capture & knowledge-extraction. Markdown is the source of truth. |
| [mf-mailer](https://github.com/chirag127/mf-mailer) | Mutual-fund report mailer |
| [ml-notebooks](https://github.com/chirag127/ml-notebooks) | Jupyter notebooks: Deep Learning, CNN, NLP, scikit-learn ML algorithms with practical implementations. |
| [morphe-patches](https://github.com/chirag127/morphe-patches) | Public Morphe patch sources — device-detection removal for Android apps. Signed APK releases live in chirag127/morphe-releases (private). |
| [multisearchx](https://github.com/chirag127/multisearchx) | Search multiple terms across 30+ search engines simultaneously. Vanilla JS, no backend, no signup. |
| [NassCom-AI-Data-Analysis-And-Modeling-Notebooks](https://github.com/chirag127/NassCom-AI-Data-Analysis-And-Modeling-Notebooks) | NassCom AI data-analysis & modeling notebooks |
| [ndns](https://github.com/chirag127/ndns) | Complete NextDNS account CLI (Deno/Bun TS, official API) |
| [olympics](https://github.com/chirag127/olympics) | Static JSON API - olympics |
| [OmniDistribute](https://github.com/chirag127/OmniDistribute) | Apex TypeScript engine for resilient, idempotent, multi-channel content distribution. Automatically publish Markdown articles to 32+ platforms (Dev.to, Hashnode, Medium, Social Media) and generate a fast, static blog site from a single source. |
| [omnijournal](https://github.com/chirag127/omnijournal) | OmniJournal — World-class open-source AI-powered journaling, note-taking and PKM app. Replaces Notion, Obsidian, Logseq, Day One and more. |
| [omniroute-cookie-bridge](https://github.com/chirag127/omniroute-cookie-bridge) | Browser extension (MV3) that captures AI web-provider sessions (HttpOnly cookies + bearer tokens) and pushes them into a local OmniRoute proxy. 23 web + 167 API-key + 18 OAuth providers, ru+en. (🍴 fork) |
| [packages](https://github.com/chirag127/packages) | Auto-discovery catalog of every @chirag127/oriz npm package. Live at packages.oriz.in. Astro Starlight + Cloudflare Pages. |
| [portable-toolkit](https://github.com/chirag127/portable-toolkit) | Personal collection of portable Windows utilities — AutoClicker, DNSBench, PatchMyPC, TrafficMonitor, dupeGuru. No installation required. |
| [qbittorrent-bitsearch](https://github.com/chirag127/qbittorrent-bitsearch) | qBittorrent automation via BitSearch |
| [rag-lens](https://github.com/chirag127/rag-lens) | RAG pipeline inspection/debugging tool |
| [releases](https://github.com/chirag127/releases) | Release artifacts & notes hub |
| [sap-cpq-automation](https://github.com/chirag127/sap-cpq-automation) | SAP CPQ workflow automation |
| [searxng-local](https://github.com/chirag127/searxng-local) | Local SearXNG metasearch instance setup |
| [sms-txn-watch](https://github.com/chirag127/sms-txn-watch) | SMS transaction watcher/parser |
| [sops-lens](https://github.com/chirag127/sops-lens) | VS Code extension for viewing sops-encrypted files |
| [sound-scraper](https://github.com/chirag127/sound-scraper) | Audio/sound scraping tooling |
| [sponsorblock-ai](https://github.com/chirag127/sponsorblock-ai) | AI-assisted SponsorBlock segment tooling |
| [Stochastic-Thinking-MCP-Server](https://github.com/chirag127/Stochastic-Thinking-MCP-Server) | MCP server implementing stochastic/randomized reasoning strategies |
| [tickertape-mmi](https://github.com/chirag127/tickertape-mmi) | Tickertape MMI (market mood index) tracker |
| [unicode-blocks](https://github.com/chirag127/unicode-blocks) | Static JSON API — Unicode block reference |
| [userscripts](https://github.com/chirag127/userscripts) | Collection of browser userscripts (Tampermonkey) |
| [video-download](https://github.com/chirag127/video-download) | Video download helper scripts |
| [Witticismdo](https://github.com/chirag127/Witticismdo) | Witty todo app |
| [workflows](https://github.com/chirag127/workflows) | Reusable GitHub Actions workflows |
| [youtube-content-automation](https://github.com/chirag127/youtube-content-automation) | YouTube content pipeline automation |

## Static JSON Data APIs

| Repo | Description |
|------|-------------|
| [android-versions](https://github.com/chirag127/android-versions) | Static JSON API - android-versions |
| [chemistry-formulas](https://github.com/chirag127/chemistry-formulas) | Static JSON API - chemistry-formulas |
| [colors](https://github.com/chirag127/colors) | Static JSON API - colors |
| [continents](https://github.com/chirag127/continents) | Static JSON API - continents |
| [countries](https://github.com/chirag127/countries) | Static JSON API - countries |
| [country-calling-codes](https://github.com/chirag127/country-calling-codes) | Static JSON API - country-calling-codes |
| [cricket-ipl](https://github.com/chirag127/cricket-ipl) | Static JSON API - cricket-ipl |
| [cricket-world-cup](https://github.com/chirag127/cricket-world-cup) | Static JSON API - cricket-world-cup |
| [crop-seasons](https://github.com/chirag127/crop-seasons) | Static JSON API - crop-seasons |
| [crypto-algorithms](https://github.com/chirag127/crypto-algorithms) | Static JSON API - crypto-algorithms |
| [css-properties](https://github.com/chirag127/css-properties) | Static JSON API - css-properties |
| [currencies](https://github.com/chirag127/currencies) | Static JSON API - currencies |
| [currency-rates](https://github.com/chirag127/currency-rates) | Static JSON API - currency-rates |
| [display-panels](https://github.com/chirag127/display-panels) | Static JSON API - display-panels |
| [emoji](https://github.com/chirag127/emoji) | Static JSON API - emoji |
| [fd-rates](https://github.com/chirag127/fd-rates) | Static JSON API - fd-rates |
| [file-extensions](https://github.com/chirag127/file-extensions) | Static JSON API - file-extensions |
| [fruits](https://github.com/chirag127/fruits) | Static JSON API - fruits |
| [gate-syllabus](https://github.com/chirag127/gate-syllabus) | Static JSON API - gate-syllabus |
| [git-commands](https://github.com/chirag127/git-commands) | Static JSON API - git-commands |
| [gpus](https://github.com/chirag127/gpus) | Static JSON API - gpus |
| [gsec-rates](https://github.com/chirag127/gsec-rates) | Static JSON API - gsec-rates |
| [gst-rates](https://github.com/chirag127/gst-rates) | Static JSON API - gst-rates |
| [holiday-world](https://github.com/chirag127/holiday-world) | Static JSON API - holiday-world |
| [html-elements](https://github.com/chirag127/html-elements) | Static JSON API - html-elements |
| [http-headers](https://github.com/chirag127/http-headers) | Static JSON API - http-headers |
| [http-status](https://github.com/chirag127/http-status) | Static JSON API - http-status |
| [income-tax-slabs](https://github.com/chirag127/income-tax-slabs) | Static JSON API - income-tax-slabs |
| [india-airports](https://github.com/chirag127/india-airports) | Static JSON API - india-airports |
| [india-districts](https://github.com/chirag127/india-districts) | Static JSON API - india-districts |
| [india-holidays](https://github.com/chirag127/india-holidays) | Static JSON API - india-holidays |
| [india-isd-codes](https://github.com/chirag127/india-isd-codes) | Static JSON API - india-isd-codes |
| [india-parliament](https://github.com/chirag127/india-parliament) | Static JSON API - india-parliament |
| [india-pincode](https://github.com/chirag127/india-pincode) | Static JSON API - india-pincode |
| [india-pincodes-by-state](https://github.com/chirag127/india-pincodes-by-state) | Static JSON API - india-pincodes-by-state |
| [india-railway-stations](https://github.com/chirag127/india-railway-stations) | Static JSON API - india-railway-stations |
| [india-states](https://github.com/chirag127/india-states) | Static JSON API - india-states |
| [india-timezones](https://github.com/chirag127/india-timezones) | Static JSON API - india-timezones |
| [indian-banks](https://github.com/chirag127/indian-banks) | Static JSON API - indian-banks |
| [indian-crops](https://github.com/chirag127/indian-crops) | Static JSON API - indian-crops |
| [indian-foods](https://github.com/chirag127/indian-foods) | Static JSON API - indian-foods |
| [indian-spices](https://github.com/chirag127/indian-spices) | Static JSON API - indian-spices |
| [ipo-calendar](https://github.com/chirag127/ipo-calendar) | Static JSON API - ipo-calendar |
| [ipo-performance](https://github.com/chirag127/ipo-performance) | Static JSON API - ipo-performance |
| [iso-codes](https://github.com/chirag127/iso-codes) | Static JSON API - iso-codes |
| [javascript-builtin](https://github.com/chirag127/javascript-builtin) | Static JSON API - javascript-builtin |
| [jee-syllabus](https://github.com/chirag127/jee-syllabus) | Static JSON API - jee-syllabus |
| [json-schema-ref](https://github.com/chirag127/json-schema-ref) | Static JSON API - json-schema-ref |
| [languages](https://github.com/chirag127/languages) | Static JSON API - languages |
| [linux-commands](https://github.com/chirag127/linux-commands) | Static JSON API - linux-commands |
| [math-formulas](https://github.com/chirag127/math-formulas) | Static JSON API - math-formulas |
| [mime-types](https://github.com/chirag127/mime-types) | Static JSON API - mime-types |
| [mobile-chipsets](https://github.com/chirag127/mobile-chipsets) | Static JSON API - mobile-chipsets |
| [mutual-fund-categories](https://github.com/chirag127/mutual-fund-categories) | Static JSON API - mutual-fund-categories |
| [nav-units](https://github.com/chirag127/nav-units) | Static JSON API - nav-units |
| [ncert-books](https://github.com/chirag127/ncert-books) | Static JSON API - ncert-books |
| [ncert-chapters](https://github.com/chirag127/ncert-chapters) | Static JSON API - ncert-chapters |
| [neet-syllabus](https://github.com/chirag127/neet-syllabus) | Static JSON API - neet-syllabus |
| [nutrition](https://github.com/chirag127/nutrition) | Static JSON API - nutrition |
| [periodic-table](https://github.com/chirag127/periodic-table) | Static JSON API - periodic-table |
| [physics-formulas](https://github.com/chirag127/physics-formulas) | Static JSON API - physics-formulas |
| [programming-concepts](https://github.com/chirag127/programming-concepts) | Static JSON API - programming-concepts |
| [programming-languages](https://github.com/chirag127/programming-languages) | Static JSON API - programming-languages |
| [quotes](https://github.com/chirag127/quotes) | Static JSON API — quotes collection |
| [rbi-rates](https://github.com/chirag127/rbi-rates) | Static JSON API — RBI policy rates |
| [regex-tokens](https://github.com/chirag127/regex-tokens) | Static JSON API — regex token reference |
| [reit-data](https://github.com/chirag127/reit-data) | Static JSON API — REIT data |
| [savings-rates](https://github.com/chirag127/savings-rates) | Static JSON API — savings account rates |
| [si-units](https://github.com/chirag127/si-units) | Static JSON API — SI units reference |
| [smartphones](https://github.com/chirag127/smartphones) | Static JSON API — smartphone specs |
| [software-licenses](https://github.com/chirag127/software-licenses) | Static JSON API — software license reference |
| [sql-functions](https://github.com/chirag127/sql-functions) | Static JSON API — SQL function reference |
| [stock-exchanges](https://github.com/chirag127/stock-exchanges) | Static JSON API — stock exchanges reference |
| [tds-rates](https://github.com/chirag127/tds-rates) | Static JSON API — TDS rates |
| [timezone-data](https://github.com/chirag127/timezone-data) | Static JSON API — timezone data |
| [typography-terms](https://github.com/chirag127/typography-terms) | Static JSON API — typography terms glossary |
| [upsc-syllabus](https://github.com/chirag127/upsc-syllabus) | Static JSON API — UPSC syllabus |
| [usb-standards](https://github.com/chirag127/usb-standards) | Static JSON API — USB standards reference |
| [vegetables](https://github.com/chirag127/vegetables) | Static JSON API — vegetables reference |
| [wifi-standards](https://github.com/chirag127/wifi-standards) | Static JSON API — Wi-Fi standards reference |
