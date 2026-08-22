---
name: codebase-design
description: Shared vocabulary for designing deep modules. Use when the user wants to design or improve a module's interface, find deepening opportunities, decide where a seam goes, make code more testable or AI-navigable, or when another skill needs the deep-module vocabulary.
license: MIT
---

# Codebase Design

Design **deep modules**: much behaviour behind small interface, at a clean seam, testable through that interface. Leverage for callers, locality for maintainers, testability for all.

## Glossary

Exact terms. No substitutes ("component"/"service"/"API"/"boundary").

- **Module** — thing with interface + implementation. Scale-agnostic: function, class, package, slice. Not: unit/component/service.
- **Interface** — everything caller must know: type signature + invariants, ordering, error modes, config, perf. Not: API/signature (too narrow).
- **Implementation** — code inside. Distinct from **Adapter**: small adapter can wrap large implementation (Postgres repo) or vice versa (in-memory fake). Use "adapter" when seam is topic.
- **Depth** — leverage per unit of interface learned. **Deep** = much behaviour, small interface. **Shallow** = interface ≈ implementation.
- **Seam** *(Feathers)* — place where behaviour alters without editing there; *location* of interface. Not: boundary (DDD-overloaded).
- **Adapter** — concrete thing satisfying interface at seam. *Role*, not substance.
- **Leverage** — caller payoff from depth: capability per interface unit. One impl pays back N call sites, M tests.
- **Locality** — maintainer payoff: change/bugs/knowledge/verification in one place. Fix once, fixed everywhere.

## Deep vs shallow

| Shape | Interface | Implementation | Verdict |
|---|---|---|---|
| **Deep** | Small — few methods, simple params | Thick — complex logic hidden | Prefer |
| **Shallow** | Large — many methods, complex params | Thin — pass-through | Avoid |

Interface design questions: fewer methods? simpler params? more complexity hidden?

## Principles

- **Depth is property of interface, not implementation.** Deep module internally composed of small mockable parts — not part of interface. Modules have **internal seams** (private, used by own tests) and **external seam** (interface).
- **Deletion test.** Delete the module. Complexity vanishes → pass-through. Complexity reappears across N callers → earning keep.
- **Interface is test surface.** Callers + tests cross same seam. Wanting to test *past* interface → wrong shape.
- **One adapter = hypothetical seam. Two = real seam.** No seam unless something varies across it.

## Designing for testability

1. **Accept dependencies, don't create them.** `processOrder(order, gateway)` beats `processOrder(order)` that news up `StripeGateway`.
2. **Return results, don't produce side effects.** `calculateDiscount(cart): Discount` beats `applyDiscount(cart): void` that mutates `cart.total`.
3. **Small surface area.** Fewer methods → fewer tests. Fewer params → simpler setup.

## Relationships

- **Module** has exactly one **Interface**.
- **Depth** = property of **Module**, measured against **Interface**.
- **Seam** = where **Interface** lives.
- **Adapter** sits at **Seam**, satisfies **Interface**.
- **Depth** → **Leverage** (callers) + **Locality** (maintainers).

## Rejected framings

- **Depth as impl-lines/interface-lines ratio** (Ousterhout): rewards padding impl. Use depth-as-leverage.
- **"Interface" as TS `interface` keyword or class public methods**: too narrow.
- **"Boundary"**: DDD-overloaded. Use **seam** or **interface**.

## Going deeper

- Deepening a cluster: [DEEPENING.md](DEEPENING.md) — dependency categories, seam discipline, replace-don't-layer testing.
- Alternative interfaces: [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md) — parallel sub-agents design multiple ways, compare depth/locality/seam.

## Cross-refs

- [`knowledge/rules/development/deep-modules-over-shallow.md`](../../../../knowledge/rules/development/deep-modules-over-shallow.md) — always-loaded rule (Ousterhout Ch. 4): deep modules, narrow interface, thick impl.

*Adapted from mattpocock/skills for oriz workspace 2026-07-08.*
