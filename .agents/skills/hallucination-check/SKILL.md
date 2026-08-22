---
name: hallucination-check
description: Audit a prompt for structural openings that invite hallucinated / fabricated / over-assumed model output. Returns findings + minimal-patch mitigation text. Use when user says "check this prompt for hallucination risk", "audit prompt for weaknesses".
---

# hallucination-check — Hallucination-vulnerability prompt auditor

## Trigger

Fire when the user says: "check my prompt", "audit prompt for hallucination", "prompt weaknesses". Or invoke explicitly via `/hallucination-check`.

## Structural weakness catalogue

Scan the input prompt for each pattern below. Report every hit with a minimal mitigation line.

| Weakness | Sample trigger | Mitigation |
|---|---|---|
| **Unbounded specificity** | "give me all X" | Cap: "up to N, most-recent first" |
| **Unverifiable facts** | "list latest research on X" | Require: "cite source URLs; if none available, say so" |
| **Assumed knowledge** | "explain the recent update" | Constrain: "assume no context; describe the update in full" |
| **Persona over-reach** | "as a doctor, prescribe X" | Guard: "you are NOT a licensed practitioner; recommend consulting one" |
| **Missing refusal path** | no "if you don't know" instruction | Add: "if uncertain, respond 'unknown' rather than guess" |
| **Open-ended time reference** | "recent", "latest", "modern" | Anchor: "as of <date>, per source X" |
| **Implicit numeric claims** | "usually", "most", "many" | Require: "cite the specific fraction or say 'unknown fraction'" |
| **False dichotomy** | "X or Y — which?" | Broaden: "X, Y, or other (specify)" |
| **Chained inference** | "given X, derive Y, then Z" | Split: verify each step separately |

## Output format

```
Prompt: <input>
Findings:
  1. <weakness type> — <exact quote from prompt> — <minimal-patch mitigation>
  2. ...
Patched prompt: <rewritten with mitigations inline>
Residual risk: <what still can't be prevented>
```

## Constraints

- Do NOT expand scope of the original prompt
- Do NOT invent constraints the user didn't imply
- MITIGATION text minimal (≤15 words per fix)
- If prompt is already tight, say so — don't fabricate weaknesses


## Provenance

- **Source:** prompts.chat: Hallucination Vulnerability Prompt Checker (Scott M v1.6), harvested 2026-07-03
- **Repository:** [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- **License:** CC0 1.0 (prompts.chat)
