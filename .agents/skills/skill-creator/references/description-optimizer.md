# Description optimizer — automated eval loop

Reference for [`skill-creator/SKILL.md`](../SKILL.md). Load when running description optimization for an existing skill.

After creating or improving a skill, offer to optimize the description for better triggering accuracy.

## Step 1: Generate trigger-eval queries

20 queries — mix of should-trigger and should-not-trigger. Save as JSON:

```json
[
  {"query": "the user prompt", "should_trigger": true},
  {"query": "another prompt", "should_trigger": false}
]
```

Queries must be **realistic** — the kind of thing a real user actually types. Not abstract requests, but concrete with file paths, personal context, column names, company names, URLs. Some lowercase or containing typos. Mix of lengths. Focus on edge cases.

**Bad:** `"Format this data"` · `"Extract text from PDF"`

**Good:** `"ok so my boss just sent me this xlsx file (its in my downloads, called something like 'Q4 sales final FINAL v2.xlsx') and she wants me to add a column that shows the profit margin as a percentage. The revenue is in column C and costs are in column D i think"`

### Should-trigger (8-10)

Different phrasings of the same intent — some formal, some casual. Include cases where user doesn't explicitly name the skill or file type but clearly needs it. Uncommon use cases. Cases where this skill competes with another but should win.

### Should-not-trigger (8-10)

**Near-misses** — queries that share keywords or concepts but need something different. Adjacent domains. Ambiguous phrasing where a naive keyword match would trigger but shouldn't. Cases where the query touches on what the skill does but in a context where another tool is more appropriate.

**Anti-pattern:** don't make should-not-trigger queries obviously irrelevant. "Write a fibonacci function" as a negative test for a PDF skill is too easy — doesn't test anything. Negatives should be genuinely tricky.

## Step 2: Review with user

Use the HTML template at `assets/eval_review.html`:

1. Read the template
2. Replace placeholders:
   - `__EVAL_DATA_PLACEHOLDER__` → JSON array (no quotes; it's a JS variable)
   - `__SKILL_NAME_PLACEHOLDER__` → skill name
   - `__SKILL_DESCRIPTION_PLACEHOLDER__` → current description
3. Write to `/tmp/eval_review_<skill-name>.html`, open it
4. User edits queries, toggles should-trigger, adds/removes, clicks Export
5. Downloads to `~/Downloads/eval_set.json` — check for `eval_set (1).json` if multiple

Bad eval queries → bad description. Don't skip this step.

## Step 3: Run optimization loop

Tell user: "This takes some time — running the loop in the background, I'll check periodically."

```bash
python -m scripts.run_loop \
  --eval-set <path-to-trigger-eval.json> \
  --skill-path <path-to-skill> \
  --model <model-id-powering-this-session> \
  --max-iterations 5 \
  --verbose
```

Use the model ID from your system prompt (the one powering the current session) so the triggering test matches what the user actually experiences.

While it runs, periodically tail the output; give user updates.

## How the loop works

1. Splits eval set 60% train / 40% held-out test
2. Evaluates current description (each query 3× for reliable trigger rate)
3. Calls Claude to propose improvements based on failures
4. Re-evaluates new description on both train and test
5. Iterates up to 5 times
6. Selects `best_description` by **test score** (not train) to avoid overfitting
7. Opens HTML report, returns JSON

## Step 4: Apply

Take `best_description` from the output. Update SKILL.md frontmatter. Show user before/after and report scores.

## Why triggering has a floor

Claude only consults skills for tasks it can't easily handle on its own. Simple one-step queries like "read this PDF" may not trigger a skill even if description matches perfectly — Claude handles them directly.

**Complex, multi-step, or specialized queries reliably trigger skills when description matches.**

Eval queries should be substantive enough that Claude would actually benefit from consulting a skill. Simple queries like "read file X" are poor test cases.
