# TDD rationalizations — and why they don't hold

Reference for [`tdd/SKILL.md`](./SKILL.md). Only load if the agent (or user) is wavering on "skip TDD just this once."

| Rationalization | Why it fails |
|---|---|
| "I'll write tests after to verify it works" | Tests-after pass immediately. Passing immediately proves nothing: might test wrong thing, might test implementation not behavior, might miss edge cases you forgot, and **you never saw the test catch the bug**. |
| "I already manually tested all the edge cases" | Manual is ad-hoc. No record, can't re-run, easy to forget under pressure. "It worked when I tried it" ≠ comprehensive. |
| "Deleting X hours of work is wasteful" | Sunk-cost fallacy. Time is gone. Choice now: delete + rewrite with TDD (X more hours, high confidence) OR keep + add tests after (30 min, low confidence, likely bugs). Waste is keeping code you can't trust. |
| "TDD is dogmatic; being pragmatic means adapting" | TDD **is** pragmatic. Finds bugs before commit (faster than debugging after). Prevents regressions. Documents behavior. Enables refactoring. "Pragmatic" shortcuts = debugging in production = slower. |
| "Tests after achieve the same goals — spirit not ritual" | No. Tests-after answer *"what does this do?"* Tests-first answer *"what should this do?"* Reverse-engineered tests document your bugs, not your intent. |
| "This code is too simple to test" | Simple code you can't test is code someone else can't modify safely. If it's really that simple, the test is 3 lines. Write it. |
| "The framework/library is the code" | Then test the boundary. The seam where your code meets the framework is exactly what needs testing. |

## Source

- Kent Beck, *Test-Driven Development: By Example* (1999) — chapters 1-3
- [obra/superpowers TDD](https://github.com/obra/superpowers/blob/main/skills/test-driven-development/SKILL.md)
