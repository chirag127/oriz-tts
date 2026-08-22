# Phase Details — Deep Content

Deep content moved out of SKILL.md body. Referenced from workflow steps.

---

## Phase 0.6: Compute Budget Tracking

Cost tracker pattern:

```python
# Simple cost tracker pattern
import json, os
from datetime import datetime

COST_LOG = "results/cost_log.jsonl"

def log_cost(experiment: str, model: str, input_tokens: int, output_tokens: int, cost_usd: float):
    entry = {
        "timestamp": datetime.now().isoformat(),
        "experiment": experiment,
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_usd": cost_usd,
    }
    with open(COST_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")
```

**When budget is tight**: Run pilot experiments (1-2 seeds, subset of tasks) before committing to full sweeps. Use cheaper models for debugging pipelines, then switch to target models for final runs.

**Compute Budget Checklist:**
- [ ] API costs: (model price per token) × (estimated tokens per run) × (number of runs)
- [ ] GPU hours: (time per experiment) × (number of experiments) × (number of seeds)
- [ ] Human evaluation costs: (annotators) × (hours) × (hourly rate)
- [ ] Total budget ceiling and contingency (add 30-50% for reruns)

---

## Phase 0.7: Multi-Author Coordination

Most papers have 3-10 authors. Establish workflows early:

| Workflow | Tool | When to Use |
|----------|------|-------------|
| **Overleaf** | Browser-based | Multiple authors editing simultaneously, no git experience |
| **Git + LaTeX** | `git` with `.gitignore` for aux files | Technical teams, need branch-based review |
| **Overleaf + Git sync** | Overleaf premium | Best of both — live collab with version history |

**Section ownership**: Assign each section to one primary author. Others comment but don't edit directly. Prevents merge conflicts and style inconsistency.

**Author Coordination Checklist:**
- [ ] Agree on section ownership (who writes what)
- [ ] Set up shared workspace (Overleaf or git repo)
- [ ] Establish notation conventions (before anyone writes)
- [ ] Schedule internal review rounds (not just at the end)
- [ ] Designate one person for final formatting pass
- [ ] Agree on figure style (colors, fonts, sizes) before creating figures

**LaTeX conventions to agree on early**:
- `\method{}` macro for consistent method naming
- Citation style: `\citet{}` vs `\citep{}` usage
- Math notation: lowercase bold for vectors, uppercase bold for matrices, etc.
- British vs American spelling

---

## Phase 1.2b: Iterative Literature Search

A flat search (one round of queries) typically misses important related work. Use an iterative **breadth-then-depth** pattern inspired by deep research pipelines:

```
Round 1 (Breadth): 4-6 parallel queries covering different angles
  - "[method] + [domain]"
  - "[problem name] state-of-the-art 2024 2025"
  - "[baseline method] comparison"
  - "[alternative approach] vs [your approach]"
  → Collect papers, extract key concepts and terminology

Round 2 (Depth): Generate follow-up queries from Round 1 learnings
  - New terminology discovered in Round 1 papers
  - Papers cited by the most relevant Round 1 results
  - Contradictory findings that need investigation
  → Collect papers, identify remaining gaps

Round 3 (Targeted): Fill specific gaps
  - Missing baselines identified in Rounds 1-2
  - Concurrent work (last 6 months, same problem)
  - Key negative results or failed approaches
  → Stop when new queries return mostly papers you've already seen
```

**When to stop**: If a round returns >80% papers already in your collection, the search is saturated. Typically 2-3 rounds suffice. For survey papers, expect 4-5 rounds.

**For agent-based workflows**: Delegate each round's queries in parallel via `delegate_task`. Collect results, deduplicate, then generate the next round's queries from the combined learnings.

---

## Phase 2.5: Human Evaluation Design

Many NLP, HCI, and alignment papers require human evaluation as primary or complementary evidence. Design this before running automated experiments — human eval often has longer lead times (IRB approval, annotator recruitment).

**When human evaluation is needed:**
- Automated metrics don't capture what you care about (fluency, helpfulness, safety)
- Your contribution is about human-facing qualities (readability, preference, trust)
- Reviewers at NLP venues (ACL, EMNLP) expect it for generation tasks

**Key design decisions:**

| Decision | Options | Guidance |
|----------|---------|----------|
| **Annotator type** | Expert, crowdworker, end-user | Match to what your claims require |
| **Scale** | Likert (1-5), pairwise comparison, ranking | Pairwise is more reliable than Likert for LLM outputs |
| **Sample size** | Per annotator and total items | Power analysis or minimum 100 items, 3+ annotators |
| **Agreement metric** | Cohen's kappa, Krippendorff's alpha, ICC | Krippendorff's alpha for >2 annotators; report raw agreement too |
| **Platform** | Prolific, MTurk, internal team | Prolific for quality; MTurk for scale; internal for domain expertise |

**Annotation guideline checklist:**
- [ ] Clear task description with examples (good AND bad)
- [ ] Decision criteria for ambiguous cases
- [ ] At least 2 worked examples per category
- [ ] Attention checks / gold standard items (10-15% of total)
- [ ] Qualification task or screening round
- [ ] Estimated time per item and fair compensation (>= local minimum wage)
- [ ] IRB/ethics review if required by your institution

**Reporting requirements** (reviewers check all of these):
- Number of annotators and their qualifications
- Inter-annotator agreement with specific metric and value
- Compensation details (amount, estimated hourly rate)
- Annotation interface description or screenshot (appendix)
- Total annotation time

See `references/human-evaluation.md` for statistical tests for human eval data, crowdsourcing quality control patterns, and IRB guidance.

---

## Phase 3.5: Experiment Journal

Git commits track what happened, but not the **exploration tree** — the decisions about what to try next based on what you learned. Maintain a structured experiment journal:

```json
// experiment_journal.jsonl — append one entry per experiment attempt
{
  "id": "exp_003",
  "parent": "exp_001",
  "timestamp": "2025-05-10T14:30:00Z",
  "hypothesis": "Adding scope constraints will fix convergence failure from exp_001",
  "plan": "Re-run autoreason with max_tokens=2000 and fixed structure template",
  "config": {"model": "haiku", "strategy": "autoreason", "max_tokens": 2000},
  "status": "completed",
  "result_path": "results/exp_003/",
  "key_metrics": {"win_rate": 0.85, "convergence_rounds": 3},
  "analysis": "Scope constraints fixed convergence. Win rate jumped from 0.42 to 0.85.",
  "next_steps": ["Try same constraints on Sonnet", "Test without structure template"],
  "figures": ["figures/exp003_convergence.pdf"]
}
```

**Why a journal, not just git?** Git tracks file changes. The journal tracks the reasoning: why you tried X, what you learned, and what that implies for the next experiment. When writing the paper, this tree is invaluable for the Methods section ("we observed X, which motivated Y") and for honest failure reporting.

**Selecting the best path**: When the journal shows a branching tree (exp_001 → exp_002a, exp_002b, exp_003), identify the path that best supports the paper's claims. Document dead-end branches in the appendix as ablations or negative results.

**Snapshot code per experiment**:
```bash
cp experiment.py results/exp_003/experiment_snapshot.py
```
This enables exact reproduction even after subsequent code changes.

---

## Phase 4: Result Analysis

### 4.1 Aggregate Results

```python
# Standard analysis pattern
import json, os
from pathlib import Path

results = {}
for result_file in Path("results/").rglob("result.json"):
    data = json.loads(result_file.read_text())
    strategy = result_file.parent.name
    task = result_file.parent.parent.name
    results.setdefault(strategy, {})[task] = data

# Compute aggregate metrics
for strategy, tasks in results.items():
    scores = [t["score"] for t in tasks.values()]
    print(f"{strategy}: mean={np.mean(scores):.1f}, std={np.std(scores):.1f}")
```

### 4.2 Statistical Significance

Always compute:
- **Error bars**: Standard deviation or standard error, specify which
- **Confidence intervals**: 95% CI for key results
- **Pairwise tests**: McNemar's test for comparing two methods
- **Effect sizes**: Cohen's d or h for practical significance

See `references/experiment-patterns.md` for complete implementations of McNemar's test, bootstrapped CIs, and Cohen's h.

### 4.3 Handling Negative or Null Results

When your hypothesis was wrong or results are inconclusive:

| Situation | Action | Venue Fit |
|-----------|--------|-----------|
| Hypothesis wrong but **why** is informative | Frame paper around the analysis of why | NeurIPS, ICML (if analysis is rigorous) |
| Method doesn't beat baselines but **reveals something new** | Reframe contribution as understanding/analysis | ICLR (values understanding), workshop papers |
| Clean negative result on popular claim | Write it up — the field needs to know | NeurIPS Datasets & Benchmarks, TMLR, workshops |
| Results inconclusive, no clear story | Pivot — run different experiments or reframe | Don't force a paper that isn't there |

**How to write a negative results paper:**
- Lead with what the community believes and why it matters to test it
- Describe your rigorous methodology (must be airtight — reviewers will scrutinize harder)
- Present the null result clearly with statistical evidence
- Analyze **why** the expected result didn't materialize
- Discuss implications for the field

**Venues that explicitly welcome negative results**: NeurIPS (Datasets & Benchmarks track), TMLR, ML Reproducibility Challenge, workshops at major conferences.

### 4.6 Experiment Log (Bridge to Writeup)

Before moving to paper writing, create a structured experiment log that bridges results to prose:

```markdown
# Experiment Log

## Contribution (one sentence)
[The paper's main claim]

## Experiments Run

### Experiment 1: [Name]
- **Claim tested**: [Which paper claim this supports]
- **Setup**: [Model, dataset, config, number of runs]
- **Key result**: [One sentence with the number]
- **Result files**: results/exp1/final_info.json
- **Figures generated**: figures/exp1_comparison.pdf
- **Surprising findings**: [Anything unexpected]

## Figures
| Filename | Description | Which section it belongs in |
|----------|-------------|---------------------------|
| figures/main_comparison.pdf | Bar chart comparing all methods | Results, Figure 2 |

## Failed Experiments (document for honesty)
- [What was tried, why it failed, what it tells us]

## Open Questions
- [Anything the results raised that the paper should address]
```

**Why this matters**: When drafting, the agent can load `experiment_log.md` alongside the LaTeX template and produce a first draft grounded in actual results. Without it, the writing agent parses raw JSON/CSV and infers the story — a common source of hallucinated numbers.

Commit this log alongside the results.

### Decide: More Experiments or Write?

| Situation | Action |
|-----------|--------|
| Core claims supported, results significant | Move to Phase 5 (writing) |
| Results inconclusive, need more data | Back to Phase 2 (design) |
| Unexpected finding suggests new direction | Back to Phase 2 (design) |
| Missing one ablation reviewers will ask for | Run it, then Phase 5 |
| All experiments done but some failed | Note failures, move to Phase 5 |

---

## Phase 5: Context Management for Large Projects

A paper project with 50+ experiment files, multiple result directories, and extensive literature notes can easily exceed the agent's context window.

**What to load into context per drafting task:**

| Drafting Task | Load Into Context | Do NOT Load |
|---------------|------------------|-------------|
| Writing Introduction | `experiment_log.md`, contribution statement, 5-10 most relevant paper abstracts | Raw result JSONs, full experiment scripts, all literature notes |
| Writing Methods | Experiment configs, pseudocode, architecture description | Raw logs, results from other experiments |
| Writing Results | `experiment_log.md`, result summary tables, figure list | Full analysis scripts, intermediate data |
| Writing Related Work | Organized citation notes, .bib file | Experiment files, raw PDFs |
| Revision pass | Full paper draft, specific reviewer concerns | Everything else |

**Principles:**
- `experiment_log.md` is the primary context bridge
- Load one section's context at a time when delegating
- Summarize, don't include raw files
- For very large projects, create a `context/` directory with pre-compressed summaries:
  ```
  context/
    contribution.md          # 1 sentence
    experiment_summary.md    # Key results table
    literature_map.md        # Organized citation notes
    figure_inventory.md      # List of figures with descriptions
  ```

---

## Phase 5: Two-Pass Refinement Pattern

Proven effective in SakanaAI's AI-Scientist pipeline.

**Pass 1 — Write + immediate refine per section:**
For each section, write a complete draft, then immediately refine in the same context. Catches local issues (clarity, flow, completeness) while fresh.

**Pass 2 — Global refinement with full-paper context:**
After all sections are drafted, revisit each with awareness of the complete paper. Catches cross-section issues: redundancy, inconsistent terminology, narrative flow, gaps.

```
Second-pass refinement prompt (per section):
"Review the [SECTION] in the context of the complete paper.
- Does it fit with the rest? Any redundancies with other sections?
- Is terminology consistent with Introduction and Methods?
- Can anything be cut without weakening the message?
- Does the narrative flow from previous section and into next?
Make minimal, targeted edits. Do not rewrite from scratch."
```

---

## Phase 5.9: Appendix Strategy

Appendices are unlimited at all major venues and essential for reproducibility.

| Appendix Section | What Goes Here |
|-----------------|---------------|
| **Proofs & Derivations** | Full proofs too long for main text. Main text: "proof in Appendix A." |
| **Additional Experiments** | Ablations, scaling curves, per-dataset breakdowns, hyperparameter sensitivity |
| **Implementation Details** | Full hyperparameter tables, training details, hardware specs, random seeds |
| **Dataset Documentation** | Data collection process, annotation guidelines, licensing, preprocessing |
| **Prompts & Templates** | Exact prompts (for LLM-based methods), evaluation templates |
| **Human Evaluation** | Annotation interface screenshots, instructions, IRB details |
| **Additional Figures** | Per-task breakdowns, trajectory visualizations, failure cases |

**Rules**:
- Main paper must be self-contained — reviewers are not required to read appendices
- Never put critical evidence only in the appendix
- Cross-reference: "Full results in Table 5 (Appendix B)"
- Use `\appendix`, then `\section{A: Proofs}` etc.

### Page Budget Management

| Cut Strategy | Saves | Risk |
|-------------|-------|------|
| Move proofs to appendix | 0.5-2 pages | Low — standard practice |
| Condense related work | 0.5-1 page | Medium — may miss key citations |
| Combine tables with subfigures | 0.25-0.5 page | Low — often improves readability |
| Use `\vspace{-Xpt}` sparingly | 0.1-0.3 page | Low if subtle, high if obvious |
| Remove qualitative examples | 0.5-1 page | Medium — reviewers like examples |
| Reduce figure sizes | 0.25-0.5 page | High — figures must remain readable |

**Do NOT**: reduce font size, change margins, remove required sections (limitations, broader impact), or use `\small`/`\footnotesize` for main text.

---

## Phase 5.10: Ethics & Broader Impact Statement

Most venues require or strongly encourage this. Not boilerplate — reviewers read it, can flag ethics concerns that trigger desk rejection.

**Components:**

| Component | Content | Required By |
|-----------|---------|-------------|
| **Positive societal impact** | How your work benefits society | NeurIPS, ICML |
| **Potential negative impact** | Misuse risks, dual-use concerns, failure modes | NeurIPS, ICML |
| **Fairness & bias** | Does your method/data have known biases? | All venues (implicitly) |
| **Environmental impact** | Compute carbon footprint for large-scale training | ICML, increasingly NeurIPS |
| **Privacy** | Does your work use/enable processing of personal data? | ACL, NeurIPS |
| **LLM disclosure** | Was AI used in writing or experiments? | ICLR (mandatory), ACL |

**Statement template:**

```latex
\section*{Broader Impact Statement}
% NeurIPS/ICML: after conclusion, does not count toward page limit

% 1. Positive applications (1-2 sentences)
This work enables [specific application] which may benefit [specific group].

% 2. Risks and mitigations (1-3 sentences, be specific)
[Method/model] could potentially be misused for [specific risk]. We mitigate
this by [specific mitigation, e.g., releasing only model weights above size X,
including safety filters, documenting failure modes].

% 3. Limitations of impact claims (1 sentence)
Our evaluation is limited to [specific domain]; broader deployment would
require [specific additional work].
```

**Common mistakes:**
- "We foresee no negative impacts" (almost never true — reviewers distrust)
- Being vague: "this could be misused" without specifying how
- Ignoring compute costs for large-scale work
- Forgetting to disclose LLM use at venues that require it

**Compute carbon footprint** (training-heavy papers):
```python
# ML CO2 Impact tool methodology
gpu_hours = 1000
gpu_tdp_watts = 400  # A100 = 400W
pue = 1.1  # Power Usage Effectiveness (data center overhead)
carbon_intensity = 0.429  # kg CO2/kWh (US average; varies by region)

energy_kwh = (gpu_hours * gpu_tdp_watts * pue) / 1000
carbon_kg = energy_kwh * carbon_intensity
print(f"Energy: {energy_kwh:.0f} kWh, Carbon: {carbon_kg:.0f} kg CO2eq")
```

---

## Phase 5.11: Datasheets & Model Cards

If the paper introduces a **new dataset** or **releases a model**, include structured documentation. NeurIPS Datasets & Benchmarks requires this.

**Datasheets for Datasets** (Gebru et al., 2021) — include in appendix:

- Motivation: Why was this dataset created? What task does it support?
- Composition: What are the instances? How many? What data types?
- Collection: How was data collected? What was the source?
- Preprocessing: What cleaning/filtering was applied?
- Distribution: How is the dataset distributed? Under what license?
- Maintenance: Who maintains it? How to report issues?
- Ethical considerations: Contains personal data? Consent obtained? Potential for harm? Known biases?

**Model Cards** (Mitchell et al., 2019) — for model releases:

- Model details: Architecture, training data, training procedure
- Intended use: Primary use cases, out-of-scope uses
- Metrics: Evaluation metrics and results on benchmarks
- Ethical considerations: Known biases, fairness evaluations
- Limitations: Known failure modes, domains where model underperforms

---

## Writing Style

**Sentence-level clarity (Gopen & Swan's 7 Principles):**

| Principle | Rule |
|-----------|------|
| Subject-verb proximity | Keep subject and verb close |
| Stress position | Place emphasis at sentence ends |
| Topic position | Put context first, new info after |
| Old before new | Familiar info → unfamiliar info |
| One unit, one function | Each paragraph makes one point |
| Action in verb | Use verbs, not nominalizations |
| Context before new | Set stage before presenting |

**Word choice (Lipton, Steinhardt):**
- Be specific: "accuracy" not "performance"
- Eliminate hedging: drop "may" unless genuinely uncertain
- Consistent terminology throughout
- Avoid incremental vocabulary: "develop", not "combine"

Full writing guide with examples: `references/writing-guide.md`

---

## Paper Section Structure Cheatsheet

### Title
- State contribution/finding, or highlight surprising result, or name method + what it does
- Include method name for citability + 1-2 keywords reviewers search for
- Avoid colons unless both halves carry meaning; keep under ~15 words

### Abstract (5-Sentence Formula, Farquhar)
1. What you achieved
2. Why hard and important
3. How you do it (specialist keywords for discoverability)
4. What evidence you have
5. Most remarkable number/result

Delete generic openings like "Large language models have achieved remarkable success..."

### Figure 1
Draft before writing introduction — forces clarity on the core idea.

| Type | When to Use |
|---------------|-------------|
| **Method diagram** | New architecture or pipeline |
| **Results teaser** | One compelling result tells the whole story |
| **Problem illustration** | The problem is unintuitive |
| **Conceptual diagram** | Abstract contribution needs visual grounding |

Rules: Figure 1 understandable without text. Caption alone communicates core idea.

### Introduction (1-1.5 pages max)
- Clear problem statement, brief approach overview
- 2-4 bullet contribution list (max 1-2 lines each in two-column)
- Methods should start by page 2-3

### Methods (enable reimplementation)
- Conceptual outline or pseudocode
- All hyperparameters listed
- Architectural details sufficient for reproduction
- Present final design decisions; ablations go in experiments

### Experiments & Results (per experiment)
- What claim it supports; how it connects to main contribution
- What to observe: "the blue line shows X, which demonstrates Y"
- Error bars with methodology (std dev vs std error)
- Hyperparameter search ranges, compute (GPU type, hours), seeds

### Related Work
Organize methodologically, not paper-by-paper. Cite generously — reviewers likely authored relevant papers.

### Limitations (REQUIRED)
- All major conferences require this
- Reviewers are instructed NOT to penalize honest limitation acknowledgment
- Pre-empt criticisms; explain why limitations don't undermine core claims

### Conclusion & Discussion
- Restate contribution in one sentence (different wording from abstract)
- Summarize key findings (2-3 sentences, not a list)
- Implications for field
- Future work: 2-3 concrete next steps (not vague "we leave X for future work")
- **Do NOT** introduce new results or claims
