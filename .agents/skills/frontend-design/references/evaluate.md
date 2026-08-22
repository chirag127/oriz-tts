# Evaluate & Fix Loop

**Mandatory.** After implementation completes, run an external design evaluation. Do NOT skip this step — even for variants, even if you think the design is perfect.

## Setup

**Determine the evaluator model.** Pick the most powerful model from a **different provider** than the one used for implementation.

## Evaluation Loop (max 3 rounds per design)

For each design (or variant), run this loop. For multiple variants, you may run evaluation loops in parallel.

For **attempt N** (starting at 1, up to 3):

**A. Spawn or resume the evaluator subagent:**

- **Round 1 (spawn new session):** Spawn subagent with the evaluator instruction file:
  - `{skill_dir}/evaluation.md`

  **Do NOT read this file yourself** — just pass it to the subagent.

  Prompt the subagent with:
  ```
  You are a Design Evaluator. Your role, criteria, and process are defined in the attached files — read and follow them precisely.

  Evaluate this design:
  - Brief: {brief_path}
  - HTML page: {html_path}
  - Write evaluation to: {temp_dir}/eval_{eval_id}_1.md
  - Attempt number: 1
  ```

  Where `{brief_path}` is `{temp_dir}/brief.md` for a single design, or `{temp_dir}/brief_variant_{N}.md` for the Nth variant. `{eval_id}` is a unique identifier for this design (e.g., `main` for a single design, or `variant_{N}` for variants) to avoid file collisions when running evaluations in parallel.

- **Rounds 2–3 (resume existing session):** Resume the same evaluator subagent session using the session ID from the previous response. Prompt:
  ```
  Fixes have been applied. Please re-evaluate:
  - The HTML page at {html_path} has been updated
  - Write evaluation to: {temp_dir}/eval_{eval_id}_{N}.md
  - Attempt number: {N}
  ```

**B. Check the verdict** from the evaluator subagent's response text (look for PASS / NEEDS REVISION / MAJOR REVISION). Do NOT read the evaluation file yourself.

**C. Act on the verdict:**

- **PASS** → Done with this design. Proceed to step 5 (Deliver).
- **NEEDS REVISION** or **MAJOR REVISION** → Continue to step D.
- If this was **round 3** and still not PASS → Stop the loop and proceed to step 5 with a note about remaining issues.

**D. Send fixes to the implementation subagent:**

Resume the implementation subagent (using its session ID from step 3) with:
```
An evaluator has reviewed your design and found issues. Read the evaluation and apply fixes:
- Evaluation file: {temp_dir}/eval_{eval_id}_{N}.md
- Address every priority fix listed in the evaluation.
- Report what you changed when done.
```

Wait for the implementation subagent to complete. Increment N and go back to step A.

## Important Rules

- **Never skip evaluation.** Even if you think the design is perfect, run the loop.
- **Never read evaluation files yourself.** The evaluator writes them, the implementer reads them. You only check the verdict from the evaluator's response text.
- **Track session IDs** — reuse the same evaluator session and the same implementer session across rounds.
- **The evaluator sees the page fresh each time** — it re-opens the browser and takes new screenshots on resume.

## Error Handling

- If an **implementation subagent fails** (crash, timeout, or error), retry once with the same brief. If it fails again, report the error to the user and stop.
- If an **evaluator subagent fails**, skip evaluation for that round and deliver the design with a note that evaluation could not be completed. Do not retry evaluation more than once.
- If a subagent **times out**, treat it as a failure and follow the rules above.
