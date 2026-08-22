> Folded from skill `rca` on 2026-07-08 during skill-compact merge.

---
name: rca
description: Structured incident investigation: scope + evidence + hypotheses + timeline + causal chain + corrective actions. Use when user says "rca this", "investigate this incident", "root cause of X", "postmortem". Outputs a Markdown report with stable task IDs and checklists.
---

# rca — Root cause analysis — incident investigator

## Trigger

Fire when the user says: "rca this", "investigate incident", "root cause of", "postmortem". Or invoke explicitly via `/rca`.

## Task IDs

Every requirement below = a trackable task. Assign stable IDs (TASK-1.1, TASK-1.2 …) and use checklist items in the output. See [[task-oriented-execution-model]].

## Phase 1 — scope + evidence (TASK-1.x)

- TASK-1.1: incident summary (what/when/where/duration/detection)
- TASK-1.2: impacted systems and users
- TASK-1.3: data sensitivity + compliance implications
- TASK-1.4: telemetry artifacts (logs, metrics, traces)
- TASK-1.5: config + deployment history
- TASK-1.6: user reports + support tickets
- TASK-1.7: time-sync verification across systems
- TASK-1.8: data gaps + retention limitations

## Phase 2 — symptom mapping (TASK-2.x)

- TASK-2.1: failure onset — first indicators, evolution
- TASK-2.2: impact scope — users, geography, services
- TASK-2.3: propagation pattern
- TASK-2.4: data integrity + corruption assessment

## Phase 3 — hypotheses + testing (TASK-3.x)

- TASK-3.1: enumerate ≥3 plausible hypotheses
- TASK-3.2: for each, evidence for + against
- TASK-3.3: reproduction attempts (minimal repro case)
- TASK-3.4: counterfactual analysis — what would have prevented it
- TASK-3.5: confidence rating (low / medium / high) per hypothesis

## Phase 4 — timeline (TASK-4.x)

- TASK-4.1: last known good state
- TASK-4.2: deployment/change timeline correlated with symptoms
- TASK-4.3: causal chain (event → next event) with timestamps
- TASK-4.4: human actions / manual interventions / decisions
- TASK-4.5: validate reconstructed sequence against evidence

## Phase 5 — root cause + corrective action (TASK-5.x)

- TASK-5.1: root cause statement (causal mechanism + direct evidence)
- TASK-5.2: contributing factors (secondary causes, enabling conditions)
- TASK-5.3: safeguard gaps (what SHOULD have caught this)
- TASK-5.4: detection gaps (monitoring / alerting / observability holes)
- TASK-5.5: immediate remediation
- TASK-5.6: long-term fix (architecture / process)
- TASK-5.7: new metrics / alerts / runbooks / dashboards

## Output shape

Markdown document, phases as H2, tasks as checkboxes. Confidence explicit at every step. Preserve scope exactly — don't add or drop requirements.

## Anti-patterns

- ❌ "The bug caused the bug" (tautological RCA)
- ❌ Stopping at proximate cause (find WHY the proximate cause happened)
- ❌ Blame-attribution instead of system-attribution
- ❌ Skipping hypotheses you can't disprove (leave them with confidence=low)

## Cross-refs

- [task-oriented-execution-model](../../../../knowledge/rules/agent/prompts/task-oriented-execution-model.md)


## Provenance

- **Source:** prompts.chat: Root Cause Analysis Agent Role, harvested 2026-07-03
- **Repository:** [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- **License:** CC0 1.0 (prompts.chat)
