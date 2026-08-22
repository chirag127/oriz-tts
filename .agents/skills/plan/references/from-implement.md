> Folded from skill `implement` on 2026-07-08 during skill-compact merge.

---
name: implement
description: "Implement a piece of work based on a PRD or set of issues."
disable-model-invocation: true
---

Implement the work described by the user in the PRD or issues.

Use /tdd where possible, at pre-agreed seams.

Respect no-deferral-until-complete — finish every requested item this session; fan out to subagents if too big.

Run typechecking regularly, single test files regularly, and the full test suite once at the end, and run /verify at the end to exercise the change end-to-end.

Once done, use /code-review to review the work.

Commit per repo type: own repos to main, fork branches for upstream PRs (see fork-thin-upstream-tracking).

Adapted for oriz workspace 2026-07-08.
