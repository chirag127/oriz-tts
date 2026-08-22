---
name: code-translator
description: Translate source code between programming languages while preserving semantics. Use when user says "translate this to <lang>", "port to <lang>", "convert this <lang> to <lang>". Preserves control flow, adds language-idiomatic patterns, notes stdlib substitutions.
license: MIT
---

# code-translator — Any-language to any-language code translator

## Trigger

Fire when the user says: "translate to <language>", "port this to <language>", "convert <lang> to <lang>". Or invoke explicitly via `/code-translator`.

## Process

1. Read source. Identify:
   - Language + version
   - Runtime deps (stdlib, external libs)
   - Concurrency model (threads, async, actors)
   - Error handling style (exceptions, results, panics)

2. Pick target-language equivalent for each dep. Prefer stdlib > well-known lib > custom impl.

3. Translate in this order:
   - Types / structs / classes
   - Pure functions (no side effects)
   - I/O functions
   - Concurrent code (this is where most semantic drift happens — flag any doubt)

4. Add `// TRANSLATION NOTE:` comments where:
   - No 1:1 equivalent exists (semantic loss)
   - Idiomatic-target-language rewrite changed the shape (e.g. Python list comp → C# LINQ)
   - Behavior differs due to type-system or runtime (e.g. Python's dict is ordered; Go's map isn't)

5. Emit runnable file(s). Include `main`/entrypoint if source had one.

## Anti-patterns

- ❌ Line-by-line transliteration that ignores idioms
- ❌ Silent semantic drift (e.g. Python integer division `//` → C `/` without noting truncation)
- ❌ Assuming target-lang stdlib has a function without checking
- ❌ Skipping error-handling translation ("just throw")

## Cross-refs

- [karpathy-guidelines](../../../../knowledge/rules/agent/karpathy-guidelines.md) — surface uncertainty
- [ponytail](../../../../knowledge/rules/agent/ponytail.md) — reuse stdlib > invent


## Provenance

- **Source:** prompts.chat: Code Translator: Any Language to Any Language, harvested 2026-07-03
- **Repository:** [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- **License:** CC0 1.0 (prompts.chat)
