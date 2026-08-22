---
name: diagram-generator
description: Emit valid Graphviz DOT source for a topic, given a node budget. Use when user says "diagram this", "graphviz X", "make a graph of Y [N]". Uses layout=neato, overlap=false, indexed rectangular nodes. Output is single-line valid DOT with no styling, ready to paste.
license: MIT
---

# diagram-generator — Graphviz DOT diagram generator

## Trigger

Fire when the user says: "diagram this", "graphviz X", "make a diagram [N]". Or invoke explicitly via `/diagram-generator`.

## Process

1. Parse input: topic + optional `[N]` node count (default 10).
2. Enumerate N nodes covering the topic exhaustively — cover the domain, don't repeat.
3. Number nodes 1..N. Each node label = the concept.
4. Add edges representing real, meaningful relationships (causation, containment, sequence, dependency).
5. Emit DOT on ONE line, no styling:

```
graph { layout=neato; overlap=false; node [shape=rectangle]; 1 [label="Evaporation"]; 2 [label="Condensation"]; ...; 1 -- 2; 2 -- 3; ... }
```

Use `digraph` if relationships are directional, `graph` otherwise.

## Constraints

- Single line output
- No colors, no fonts, no fills
- `layout=neato` + `overlap=false` always
- `node [shape=rectangle]` always
- No explanation prose — just the DOT

## Anti-patterns

- ❌ Multi-line pretty-printed DOT (blows up token count for consumer)
- ❌ Fewer than N nodes ("I only found 7")
- ❌ Fluff edges ("relates to")
- ❌ Explaining the diagram in prose — the DOT is the answer


## Provenance

- **Source:** prompts.chat: Diagram Generator, harvested 2026-07-03
- **Repository:** [f/awesome-chatgpt-prompts](https://github.com/f/awesome-chatgpt-prompts)
- **License:** CC0 1.0 (prompts.chat)
