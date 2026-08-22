---
name: research-paper-writing
title: Research Paper Writing Pipeline
description: "Write ML papers for NeurIPS/ICML/ICLR: design→submit."
version: 1.1.0
author: Orchestra Research
license: MIT
dependencies: [semanticscholar, arxiv, habanero, requests, scipy, numpy, matplotlib, SciencePlots]
platforms: [linux, macos]
metadata:
  hermes:
    tags: [Research, Paper Writing, Experiments, ML, AI, NeurIPS, ICML, ICLR, ACL, AAAI, COLM, LaTeX, Citations, Statistical Analysis]
    category: research
    related_skills: [arxiv, ml-paper-writing, subagent-driven-development, plan]
    requires_toolsets: [terminal, files]

---

# Research Paper Writing Pipeline

End-to-end pipeline for producing publication-ready ML/AI research papers targeting **NeurIPS, ICML, ICLR, ACL, AAAI, and COLM**. This skill covers the full research lifecycle: experiment design, execution, monitoring, analysis, paper writing, review, revision, and submission.

This is **not a linear pipeline** — it is an iterative loop. Results trigger new experiments. Reviews trigger new analysis. The agent must handle these feedback loops.

<!-- ascii-guard-ignore -->
```
┌─────────────────────────────────────────────────────────────┐
│                    RESEARCH PAPER PIPELINE                  │
│                                                             │
│  Phase 0: Project Setup ──► Phase 1: Literature Review      │
│       │                          │                          │
│       ▼                          ▼                          │
│  Phase 2: Experiment     Phase 5: Paper Drafting ◄──┐      │
│       Design                     │                   │      │
│       │                          ▼                   │      │
│       ▼                    Phase 6: Self-Review      │      │
│  Phase 3: Execution &           & Revision ──────────┘      │
│       Monitoring                 │                          │
│       │                          ▼                          │
│       ▼                    Phase 7: Submission               │
│  Phase 4: Analysis ─────► (feeds back to Phase 2 or 5)     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```
<!-- ascii-guard-ignore-end -->

---

## When To Use This Skill

Use this skill when:
- **Starting a new research paper** from an existing codebase or idea
- **Designing and running experiments** to support paper claims
- **Writing or revising** any section of a research paper
- **Preparing for submission** to a specific conference or workshop
- **Responding to reviews** with additional experiments or revisions
- **Converting** a paper between conference formats
- **Writing non-empirical papers** — theory, survey, benchmark, or position papers (see [references/paper-types.md](references/paper-types.md))
- **Designing human evaluations** for NLP, HCI, or alignment research
- **Preparing post-acceptance deliverables** — posters, talks, code releases

## Core Philosophy

1. **Be proactive.** Deliver complete drafts, not questions. Produce something concrete they can react to, then iterate.
2. **Never hallucinate citations.** AI-generated citations have ~40% error rate. Fetch programmatically. Mark unverifiable as `[CITATION NEEDED]`.
3. **Paper is a story, not a collection of experiments.** One clear contribution in a single sentence. If you can't, the paper isn't ready.
4. **Experiments serve claims.** Every experiment states which claim it supports. Never run experiments disconnected from the narrative.
5. **Commit early, commit often.** Git log is the experiment history.

### Proactivity and Collaboration

**Default: Be proactive. Draft first, ask with the draft.**

| Confidence | Action |
|-----------------|--------|
| **High** (clear repo, obvious contribution) | Write full draft, iterate on feedback |
| **Medium** (some ambiguity) | Draft with flagged uncertainties, continue |
| **Low** (major unknowns) | Ask 1-2 questions via `clarify`, then draft |

Draft all sections autonomously — flag uncertainties with the draft. Block for input only when: target venue unclear, multiple contradictory framings, results seem incomplete, explicit request to review first.

---

## Phase 0: Project Setup

**Goal**: Establish workspace, understand existing work, identify contribution.

### 0.1 Explore

```bash
ls -la; find . -name "*.py" | head -30
find . -name "*.md" -o -name "*.txt" | xargs grep -l -i "result\|conclusion\|finding"
```

Look for: `README.md`, `results/`/`outputs/`/`experiments/`, `configs/`, `.bib` files, drafts.

### 0.2 Organize

```
workspace/
  paper/           # LaTeX source, figures, compiled PDFs
  experiments/     # Runner scripts
  code/            # Method implementation
  results/         # Raw results (auto-generated)
  tasks/           # Task/benchmark definitions
  human_eval/      # Human eval materials (if needed)
```

### 0.3 Version Control

```bash
git init && git remote add origin <repo-url> && git checkout -b paper-draft
```

Every completed experiment batch = one commit with descriptive message.

### 0.4 Identify the Contribution

Before writing, articulate: **The What** (single thing this paper contributes), **The Why** (evidence), **The So What** (why readers care). Propose: "Based on my understanding, the main contribution is: [one sentence]. Key results: [Y]. Is this the framing?"

### 0.5–0.7 Plan, Budget, Coordinate

Use `todo` for structured project plan. Estimate compute budget (API + GPU + human eval + 30-50% contingency). Track spend with a cost logger. Establish author coordination (Overleaf vs Git vs both), section ownership, notation conventions before anyone writes.

Cost tracker, author checklist, LaTeX conventions: [references/phase-details.md](references/phase-details.md).

---

## Phase 1: Literature Review

**Goal**: Find related work, identify baselines, gather citations.

### 1.1–1.2 Search

Seed from existing citations (grep repo). Load `arxiv` skill for structured discovery via `skill_view("arxiv")` — arXiv REST, Semantic Scholar, BibTeX gen. Use `web_search` for breadth, `web_extract` for specific papers. Optional Exa MCP: `Codex mcp add exa -- npx -y mcp-remote "https://mcp.exa.ai/mcp"`.

### 1.2b Deepen (Breadth then Depth)

Flat search misses relevant work. Over 2-3 rounds: Round 1 = 4-6 parallel queries covering different angles; Round 2 = follow-ups from Round 1 learnings; Round 3 = gap-filling. Stop when >80% of results are already collected.

Full protocol: [references/phase-details.md](references/phase-details.md).

### 1.3 Verify Every Citation

**NEVER generate BibTeX from memory. ALWAYS fetch programmatically.**

Mandatory 5-step process per citation:

```
1. SEARCH  → Semantic Scholar or Exa MCP with specific keywords
2. VERIFY  → paper exists in 2+ sources (Semantic Scholar + arXiv/CrossRef)
3. RETRIEVE → BibTeX via DOI content negotiation
4. VALIDATE → the claim actually appears in the paper
5. ADD     → verified BibTeX to bibliography
Any step fails → mark [CITATION NEEDED], inform scientist
```

```python
import requests

def doi_to_bibtex(doi: str) -> str:
    response = requests.get(
        f"https://doi.org/{doi}",
        headers={"Accept": "application/x-bibtex"}
    )
    response.raise_for_status()
    return response.text
```

If unverifiable: `\cite{PLACEHOLDER_author2024_verify_this}  % TODO: Verify` and tell the scientist "[X] citations marked as placeholders."

Full API docs and `CitationManager` class: [references/citation-workflow.md](references/citation-workflow.md).

### 1.4 Organize Related Work

Group papers by methodology, not paper-by-paper.

- **Good**: "One line of work uses X's assumption [refs] whereas we use Y's assumption because..."
- **Bad**: "Smith et al. introduced X. Jones et al. introduced Y. We combine both."

---

## Phase 2: Experiment Design

**Goal**: Design experiments that directly support paper claims.

### 2.1 Map Claims to Experiments

| Claim | Experiment | Expected Evidence |
|-------|-----------|-------------------|
| "Our method outperforms baselines" | Main comparison (Table 1) | Win rate, significance |
| "Effect larger for weaker models" | Model scaling study | Monotonic improvement curve |
| "Convergence requires scope constraints" | Constrained vs unconstrained | Convergence rate comparison |

**Rule**: If an experiment doesn't map to a claim, don't run it.

### 2.2 Design Baselines

- **Naive**: Simplest possible approach
- **Strong**: Best known existing method
- **Ablation**: Your method minus one component
- **Compute-matched**: Same compute budget, different allocation

### 2.3 Evaluation Protocol

Before running: metrics (with direction symbols), aggregation, statistical tests, sample sizes.

### 2.4 Write Experiment Scripts

Patterns from successful pipelines:

**Incremental saving** — save after each step for crash recovery:
```python
result_path = f"results/{task}/{strategy}/result.json"
if os.path.exists(result_path):
    continue  # Skip already-completed work
# ... run experiment ...
with open(result_path, 'w') as f:
    json.dump(result, f, indent=2)
```

**Artifact preservation** — all intermediate outputs under `results/<experiment>/<task>/<strategy>/`.

**Separation of concerns** — separate scripts for generation, evaluation, visualization (`run_experiment.py`, `run_baselines.py`, `run_comparison_judge.py`, `analyze_results.py`, `make_charts.py`).

Complete design patterns, cron monitoring, error recovery: [references/experiment-patterns.md](references/experiment-patterns.md).

### 2.5 Human Evaluation Design (If Applicable)

Many NLP/HCI/alignment papers require human evaluation. Design before automated experiments — human eval has longer lead times (IRB, annotator recruitment). Decisions: annotator type, scale (pairwise > Likert for LLM outputs), sample size (100+ items, 3+ annotators), agreement metric (Krippendorff's alpha for >2 annotators), platform.

Full design guide, checklist, reporting: [references/phase-details.md](references/phase-details.md), [references/human-evaluation.md](references/human-evaluation.md).

---

## Phase 3: Experiment Execution & Monitoring

**Goal**: Run experiments reliably, monitor progress, recover from failures.

### 3.1 Launch

```bash
nohup python run_experiment.py --config config.yaml > logs/experiment_01.log 2>&1 &
echo $!  # Record the PID
```

Independent experiments in parallel — mindful of API rate limits.

### 3.2 Monitor (Cron Pattern)

```
1. ps aux | grep <pattern>         # is process running?
2. tail -30 <logfile>              # progress
3. ls <result_dir>                 # completed results
4. cat <result_file>               # read and report
5. If done: git add -A && git commit -m "..." && git push
6. Report structured (tables with key metrics)
7. Answer the key analytical question
```

**Silent mode**: Nothing changed since last check → respond `[SILENT]`.

### 3.3 Handle Failures

| Failure | Detection | Recovery |
|---------|-----------|----------|
| API rate limit / credit | 402/429 in logs | Wait, re-run (scripts skip completed work) |
| Process crash | PID gone, incomplete results | Re-run from last checkpoint |
| Timeout on hard problems | Stuck, no log progress | Kill and skip, note in results |
| Wrong model ID | Errors referencing model name | Fix ID and re-run |

**Key**: Scripts always check for existing results and skip completed work.

### 3.4 Commit + 3.5 Journal

Commit after each batch (`git commit -m "Add <experiment>: <finding>"`). Maintain `experiment_journal.jsonl` — one entry per attempt with hypothesis, plan, config, status, key metrics, analysis, next steps. Snapshot code (`cp experiment.py results/exp_003/experiment_snapshot.py`).

Full journal schema and rationale: [references/phase-details.md](references/phase-details.md).

---

## Phase 4: Result Analysis

**Goal**: Extract findings, compute statistics, identify the story.

### 4.1–4.3 Aggregate, Test, Identify Story

Aggregate results across strategies/tasks. Compute error bars, 95% CIs, pairwise tests (McNemar's), effect sizes (Cohen's d/h). Explicitly answer: main finding? what surprised you? what failed? follow-ups?

Negative/null results, stats implementations: [references/phase-details.md](references/phase-details.md). McNemar's / bootstrapped CIs / Cohen's h code: [references/experiment-patterns.md](references/experiment-patterns.md).

### 4.4 Figures and Tables

**Figures**: vector PDF via `plt.savefig('fig.pdf')`; colorblind-safe palettes (Okabe-Ito or Paul Tol); self-contained captions; no title inside figure.

**Tables**: `booktabs`; bold best per metric; direction symbols; consistent decimal precision.

Full LaTeX patterns: [references/latex-toolkit.md](references/latex-toolkit.md).

### 4.5 More Experiments or Write?

| Situation | Action |
|-----------|--------|
| Core claims supported, results significant | Move to Phase 5 |
| Results inconclusive, need more data | Back to Phase 2 |
| Missing one ablation reviewers will ask for | Run it, then Phase 5 |

### 4.6 Experiment Log (Bridge to Writeup)

Before writing, create `experiment_log.md` — the single most important connective tissue between experiments and writeup. Contribution (one sentence); experiments run (claim tested, setup, key result, files, figures, surprising findings); figures table; failed experiments; open questions.

Schema and rationale: [references/phase-details.md](references/phase-details.md).

---

## Iterative Refinement: Strategy Selection

Any output can be iteratively refined. Autoreason research provides empirical evidence for when each strategy works. Quick guide:

| Situation | Strategy |
|-----------|----------|
| Mid-tier model + constrained task | Autoreason (sweet spot) |
| Frontier model + unconstrained task | Critique-and-revise or single pass |
| Code with test cases | Autoreason (code variant) |
| Very weak model (Llama 8B) | Single pass |

Autoreason value depends on the **generation-evaluation gap**: widest for mid-tier, structurally shrinking at frontier. Loop = Critic → Author B → Synthesizer → 3-judge Borda panel, k=2 convergence.

Decision table, gap analysis, loop details, failure modes: [references/iterative-refinement.md](references/iterative-refinement.md). Prompts, model guide, scope constraints, Borda scoring: [references/autoreason-methodology.md](references/autoreason-methodology.md).

---

## Phase 5: Paper Drafting

**Goal**: Complete, publication-ready paper.

### Narrative Principle

**Paper is not a collection of experiments — it's a story with one clear contribution supported by evidence.**

Three Pillars (crystal clear by end of introduction):

| Pillar | Description | Test |
|--------|-------------|------|
| **What** | 1-3 specific novel claims | State in one sentence? |
| **Why** | Rigorous empirical evidence | Experiments distinguish hypothesis from alternatives? |
| **So What** | Why readers should care | Connects to a recognized community problem? |

**If you cannot state your contribution in one sentence, you don't yet have a paper.**

Writing philosophy synthesized from Neel Nanda, Sebastian Farquhar, Gopen & Swan, Zachary Lipton, Jacob Steinhardt, Ethan Perez, Karpathy. Deep dives: [references/writing-guide.md](references/writing-guide.md) and [references/sources.md](references/sources.md).

### Context Management + Two-Pass Refinement

Papers with 50+ experiment files exceed context. Load one section's context at a time. `experiment_log.md` is the primary context bridge (Step 4.6). Two-pass: Pass 1 = write + refine per section; Pass 2 = global refinement.

Full loading matrix, principles, refinement prompts: [references/phase-details.md](references/phase-details.md).

### Time Allocation

Approximately equal time on: (1) abstract, (2) introduction, (3) figures, (4) everything else combined. Most reviewers form judgments before reaching methods.

### Writing Workflow

Checklist: (1) one-sentence contribution → (2) Figure 1 → (3) abstract (5-sentence) → (4) introduction (1-1.5p max) → (5) methods → (6) experiments & results → (7) related work → (8) conclusion & discussion → (9) limitations (REQUIRED) → (10) appendix → (11) paper checklist → (12) final review.

Section-by-section structure cheatsheet: [references/phase-details.md](references/phase-details.md#paper-section-structure-cheatsheet). Appendix strategy, page budget, Ethics/Broader Impact (Step 5.10), Datasheets & Model Cards (Step 5.11): [references/phase-details.md](references/phase-details.md).

### LaTeX Toolkit

Professional preamble (`microtype`, `booktabs`, `siunitx`, `subcaption`, `tikz`, `algorithm2e`, `cleveref`, Okabe-Ito), subfigures, decimal alignment, TikZ patterns (pipeline/matrix/loop), pseudocode, `latexdiff`, SciencePlots. LaTeX error checklist to append to refinement prompts. Templates per venue + setup workflow + pitfalls: [references/latex-toolkit.md](references/latex-toolkit.md), [templates/README.md](templates/README.md).

### Writing Style (Micro-Level)

Gopen & Swan's 7 principles; word choice (Lipton, Steinhardt): be specific, eliminate hedging, consistent terminology. Full guide: [references/writing-guide.md](references/writing-guide.md).

---

## Phase 6: Self-Review & Revision

**Goal**: Simulate the review process before submission. Ensemble reviewing with a meta-reviewer is far more calibrated than single-pass.

Workflow: (6.1) generate N=3-5 independent reviews (different models/temperatures, negative-bias default) → meta-review as Area Chair → optional 2-3 rounds reflection; (6.1b) VLM visual review pass on compiled PDF; (6.1c) claim verification pass (fresh sub-agent to prevent confirmation bias); (6.2) prioritize Critical/High/Medium/Low; (6.3) revision cycle per issue; (6.4) rebuttal (point-by-point, `latexdiff`, thank reviewers); (6.5) snapshot at milestones.

Full review prompts, meta-review pattern, rebuttal format: [references/self-review.md](references/self-review.md). Reviewer rubrics: [references/reviewer-guidelines.md](references/reviewer-guidelines.md).

---

## Phase 7: Submission Preparation

**Goal**: Final checks, formatting, submission.

### Step 7.1: Conference Checklist

Every venue has mandatory checklists. Incomplete = potential desk rejection. See [references/checklists.md](references/checklists.md) for NeurIPS 16-item, ICML broader impact + reproducibility, ICLR LLM disclosure, ACL mandatory limitations, universal pre-submission checklist.

### Steps 7.2–7.10 Overview

- 7.2 Anonymization; 7.3 Formatting; 7.4 Pre-compile validation (`chktex`, cite/figure/label checks); 7.5 Final compilation (`latexmk -pdf`); 7.6 Conference-specific requirements; 7.7 Format conversion between venues; 7.8 Camera-ready; 7.9 arXiv strategy (timing, categories, versioning); 7.10 Research code packaging.

Full checklists, code snippets, decision trees: [references/submission.md](references/submission.md).

---

## Phase 8: Post-Acceptance Deliverables

Poster (Z-pattern, readable at 3m, `beamerposter`), Talk/Spotlight (5min or 15-20min, one idea per slide, backup slides), Blog/Social (Twitter 5-8 tweets, blog 800-1500 words, project page). Post within 1-2 days of camera-ready.

Full guidelines: [references/post-acceptance.md](references/post-acceptance.md).

---

## Workshop & Short Papers

Same pipeline, different constraints. Workshop bar: novel direction, interesting negative results, work-in-progress. ACL: Long (8p), Short (4p, ONE claim), Findings (8p). Short paper strategy: pick ONE claim, support thoroughly — don't compress.

Full comparison and strategy: [references/post-acceptance.md](references/post-acceptance.md).

---

## Paper Types Beyond Empirical ML

Main pipeline targets empirical ML. Other types:

- **Theory**: theorems/bounds are contribution; proof sketches in main, full in appendix; explicit assumptions.
- **Survey/tutorial**: organization is contribution; clear taxonomy; comprehensive within scope. Best: TMLR, JMLR, Foundations & Trends.
- **Benchmark**: benchmark itself; datasheet mandatory; must be challenging + construct-valid. Best: NeurIPS Datasets & Benchmarks, LREC-COLING.
- **Position**: argument is contribution; engage counterarguments seriously. Best: ICML position track, workshops, TMLR.

Full guidance per paper type: [references/paper-types.md](references/paper-types.md).

---

## Hermes Agent Integration

Hermes tools: `terminal`, `process`, `execute_code`, `read_file`/`write_file`/`patch`, `web_search`, `web_extract`, `delegate_task`, `todo`, `memory`, `cronjob`, `clarify`, cron `deliver:`. Related skills: `arxiv`, `subagent-driven-development`, `plan`, `qmd`, `diagramming`, `data-science`.

Patterns: experiment monitoring, parallel section drafting via `delegate_task`, citation verification via `execute_code`, state management via `memory`+`todo`, cron monitoring with `[SILENT]` protocol.

**This skill supersedes `ml-paper-writing`** — contains all its content plus the full experiment/analysis pipeline and autoreason methodology.

Full reference with prompts and examples: [references/hermes-integration.md](references/hermes-integration.md).

---

## Reviewer Evaluation Criteria

| Criterion | What They Check |
|-----------|----------------|
| **Quality** | Soundness, well-supported claims, fair baselines |
| **Clarity** | Writing, reproducibility, consistent notation |
| **Significance** | Community impact, advances understanding |
| **Originality** | New insights (doesn't require new method) |

**NeurIPS 6-point**: 6 Strong Accept, 5 Accept, 4 Borderline Accept, 3 Borderline Reject, 2 Reject, 1 Strong Reject.

Detailed guidelines, common concerns, rebuttal strategies: [references/reviewer-guidelines.md](references/reviewer-guidelines.md).

---

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| Abstract too generic | Delete first sentence if it could prepend any ML paper. |
| Introduction exceeds 1.5 pages | Split background into Related Work. Front-load contribution bullets. |
| Experiments lack explicit claims | Add "This experiment tests whether [claim]..." before each. |
| Missing statistical significance | Add error bars, number of runs, tests, CIs. |
| Scope creep in experiments | Every experiment maps to a claim. Cut experiments that don't. |
| Missing broader impact statement | See [phase-details.md](references/phase-details.md) §5.10. "No negative impacts" almost never credible. |
| Human eval criticized as weak | See [human-evaluation.md](references/human-evaluation.md). Report agreement, annotators, compensation. |
| Reproducibility questioned | Release code (Step 7.10), all hyperparameters, seeds, compute details. |
| Theory paper lacks intuition | Add proof sketches before formal proofs. See [paper-types.md](references/paper-types.md). |
| Negative/null results | See [phase-details.md](references/phase-details.md) §4.3. Consider workshops, TMLR, reframe as analysis. |

---

## Reference Documents

Existing: [writing-guide.md](references/writing-guide.md), [citation-workflow.md](references/citation-workflow.md), [checklists.md](references/checklists.md), [reviewer-guidelines.md](references/reviewer-guidelines.md), [sources.md](references/sources.md), [experiment-patterns.md](references/experiment-patterns.md), [autoreason-methodology.md](references/autoreason-methodology.md), [human-evaluation.md](references/human-evaluation.md), [paper-types.md](references/paper-types.md).

Added: [phase-details.md](references/phase-details.md) (deep Phase 0-5 content), [latex-toolkit.md](references/latex-toolkit.md) (preamble/tables/TikZ/algorithm2e/latexdiff/SciencePlots/templates), [iterative-refinement.md](references/iterative-refinement.md) (strategy selection, gen-eval gap, autoreason loop), [self-review.md](references/self-review.md) (ensemble/visual/claim-verification/rebuttals), [submission.md](references/submission.md) (anon/validate/convert/arXiv/code/camera-ready), [post-acceptance.md](references/post-acceptance.md) (poster/talk/blog + workshop/short papers), [hermes-integration.md](references/hermes-integration.md).

### LaTeX Templates

`templates/` for **NeurIPS 2025**, **ICML 2026**, **ICLR 2026**, **ACL**, **AAAI 2026**, **COLM 2025**. Compilation: [templates/README.md](templates/README.md).

### Key External Sources

- [Neel Nanda: How to Write ML Papers](https://www.alignmentforum.org/posts/eJGptPbbFPZGLpjsp/highly-opinionated-advice-on-how-to-write-ml-papers)
- [Sebastian Farquhar: How to Write ML Papers](https://sebastianfarquhar.com/on-research/2024/11/04/how_to_write_ml_papers/)
- [Gopen & Swan: Science of Scientific Writing](https://cseweb.ucsd.edu/~swanson/papers/science-of-writing.pdf)
- [Lipton: Heuristics for Scientific Writing](https://www.approximatelycorrect.com/2018/01/29/heuristics-technical-scientific-writing-machine-learning-perspective/)
- [Perez: Easy Paper Writing Tips](https://ethanperez.net/easy-paper-writing-tips/)

**APIs:** [Semantic Scholar](https://api.semanticscholar.org/api-docs/) | [CrossRef](https://www.crossref.org/documentation/retrieve-metadata/rest-api/) | [arXiv](https://info.arxiv.org/help/api/basics.html)

**Venues:** [NeurIPS](https://neurips.cc/Conferences/2025/PaperInformation/StyleFiles) | [ICML](https://icml.cc/Conferences/2025/AuthorInstructions) | [ICLR](https://iclr.cc/Conferences/2026/AuthorGuide) | [ACL](https://github.com/acl-org/acl-style-files)

<!-- Ported from Hermes 2026-07-09 -->
