# Eval workflow — running + evaluating test cases

Reference for [`skill-creator/SKILL.md`](../SKILL.md). Load when running the eval loop for a new or improved skill.

One continuous sequence — don't stop partway through.

Results go in `<skill-name>-workspace/` as a sibling to the skill dir. Iterations: `iteration-1/`, `iteration-2/`. Each test case: `eval-0/`, `eval-1/`. Create dirs as you go, not upfront.

## Step 1: Spawn all runs in the same turn

For each test case, spawn TWO subagents in the SAME turn — with-skill and baseline. Don't spawn with-skill first and come back for baselines later.

**With-skill:**
```
Execute this task:
- Skill path: <path-to-skill>
- Task: <eval prompt>
- Input files: <eval files if any, or "none">
- Save outputs to: <workspace>/iteration-<N>/eval-<ID>/with_skill/outputs/
- Outputs to save: <what the user cares about>
```

**Baseline** (context-dependent):
- New skill: no skill. Same prompt. Save to `without_skill/outputs/`.
- Improving existing skill: **snapshot the old version first** (`cp -r <skill-path> <workspace>/skill-snapshot/`), point baseline at snapshot. Save to `old_skill/outputs/`.

`eval_metadata.json` per test case (assertions can be empty for now):
```json
{
  "eval_id": 0,
  "eval_name": "descriptive-name",
  "prompt": "The task",
  "assertions": []
}
```

## Step 2: While runs in progress, draft assertions

Don't just wait. Draft quantitative assertions per test case. Explain them to the user. Update `eval_metadata.json` + `evals/evals.json`.

Good assertions: objectively verifiable, descriptive names. Subjective skills (writing style, design) → qualitative only. Don't force assertions on judgment calls.

## Step 3: As runs complete, capture timing

Each subagent completion returns `total_tokens` + `duration_ms`. Save immediately to `timing.json` in the run dir. **Only chance** — the notification isn't persisted.

## Step 4: Grade, aggregate, launch viewer

1. **Grade** — spawn a grader subagent that reads `agents/grader.md` and evaluates each assertion. Save `grading.json`. Fields: `text`, `passed`, `evidence` (viewer depends on these exact names).
2. **Aggregate** — `python -m scripts.aggregate_benchmark <workspace>/iteration-N --skill-name <name>`. Produces `benchmark.json` + `benchmark.md`.
3. **Analyst pass** — read benchmark, surface patterns (non-discriminating assertions, high-variance evals, time/token tradeoffs). See `agents/analyzer.md`.
4. **Launch viewer:**
   ```bash
   python <skill-creator-path>/eval-viewer/generate_review.py \
     <workspace>/iteration-N \
     --skill-name "my-skill" \
     --benchmark <workspace>/iteration-N/benchmark.json
   ```
   For iteration 2+, also pass `--previous-workspace <workspace>/iteration-<N-1>`.
5. **Tell user:** "Opened results in your browser. Two tabs — Outputs + Benchmark. When done, come back."

## Step 5: Read feedback

`feedback.json`:
```json
{
  "reviews": [
    {"run_id": "eval-0-with_skill", "feedback": "chart is missing axis labels", "timestamp": "..."},
    {"run_id": "eval-1-with_skill", "feedback": ""}
  ],
  "status": "complete"
}
```

Empty feedback = user thought it was fine. Focus improvements on cases with specific complaints.

## Iteration

1. Apply improvements
2. Rerun into `iteration-<N+1>/`
3. Reviewer with `--previous-workspace`
4. Wait for user
5. Repeat

Stop when: user happy · feedback all empty · no meaningful progress.

## Improvement principles

1. **Generalize from feedback.** Skills get used across many prompts. If it only works on your test examples, it's useless. Try different metaphors, different patterns, before fiddly overfitty fixes.
2. **Keep prompt lean.** Remove non-pulling-weight sections. Read transcripts — if skill wastes model time, cut that section.
3. **Explain the why.** Bare MUSTs → reframe with reasoning. All-caps ALWAYS/NEVER is a yellow flag.
4. **Look for repeated work.** If all runs write similar helper scripts, bundle the script.

## Reference files (obra/superpowers writing-skills)

- `agents/grader.md` — evaluate assertions
- `agents/comparator.md` — blind A/B between versions
- `agents/analyzer.md` — analyze why one version won
- `references/schemas.md` — JSON structures for evals.json, grading.json, benchmark.json

## Environment differences

- **Claude.ai:** no subagents. Read SKILL.md, follow it yourself on each test prompt one at a time. Skip baselines and quantitative benchmarking; use qualitative feedback only.
- **Cowork:** subagents work, but no browser/display. Use `--static <output_path>` on the viewer for standalone HTML. Feedback downloads as file; copy into workspace.
