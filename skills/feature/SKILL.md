---
name: feature
description: Interview me about a new feature or change (including refactors, upgrades and migrations) until we share the same picture, update the glossary and feature file, and write a spec for implement. Writes no code.
disable-model-invocation: true
---

# Feature

Turn an idea into a spec that `implement` can build and `verify` can prove.

**Writes only:** the spec, `.agents/GLOSSARY.md`, `.agents/features/*.md`. Never app code, even if the change looks trivial.

## Before you start

- Read `AGENTS.md` at the repo root (not the current folder, which may be a subproject) and follow its rules. If the root's `.agents/features/README.md` or the rom-skills block in `AGENTS.md` is missing, tell the user to run `setup-agent-workspace` first, and stop.
- Read `.agents/features/README.md`, the feature files this touches, `.agents/GLOSSARY.md` and the code involved.

## Interview

Map the work as a tree of decisions, where each decision opens up the ones that depend on it. Ask in **rounds**: each round asks every question that can be answered now, meaning nothing still open blocks it. Then wait for the answers, work out what they unblock, and ask the next round.

Format each question like this, and word it so "yes" accepts your recommendation:

```
**Q1. <short title>**: <question, with options if there are any>
➡️ <your recommended answer>
```

- **Facts are your job; decisions are the user's.** Never ask something you could look up in the code, docs or tools, and check `.agents/` (feature files, repo map, glossary) first. Look it up yourself, using a sub-agent if your tool has them. Only the questions that depend on that answer wait for it.
- **Challenge the words.** If the user uses a term that conflicts with the glossary, or a vague term like "account", say so and propose the precise word.
- **Invent edge-case scenarios** that force precise answers: "A user exports while an order is being cancelled. Is it in the file?"
- **Check what the user says against the code.** If they don't match, point it out: "The code cancels whole orders, but you said partial cancels are possible. Which is right?"

Before you're done, the answers must cover: who uses this and why, the main flow, edge cases and errors, and what's out of scope. If it changes a database schema, a contract, a public API or something already deployed, also cover what must keep working, how existing data or clients migrate, and how to roll back.

## Keep the docs current as you go

Write these as soon as something is settled; don't save them up for the end.

- **`GLOSSARY.md`:** add or fix the term (`**Term**: definition`, plus `_Avoid_: other words`). Terms only, never implementation details.
- **Feature file:** update `What`. If the feature is new, create the file and add it to the list in `.agents/features/README.md`. Add a line to `Decisions` only if the choice is hard to undo, would surprise a future reader, and was a real trade-off.

## Test seams

A seam is a public boundary where tests can watch behavior without reaching inside, such as an API endpoint, a page or a CLI command. Propose as few seams as possible, as high up as possible, and prefer ones that already exist. Write each one in the spec with a line on what it catches and what it misses. Ask the user only when there's a real trade-off, in plain words: "A browser test catches more but takes a minute per run. OK?"

## Write the spec

Save it to `.agents/local/specs/<slug>.md`, where the slug is short kebab-case like `order-export`:

```md
# <Feature>: <change>
Status: draft
Feature file: .agents/features/<feature>.md

## Problem
What the user can't do today, from their point of view.

## Solution
What they will be able to do, from their point of view.

## Acceptance criteria
- [ ] 1. Given <situation>, when <action>, then <observable result>.

## Test seams
- <seam>: catches …, misses …

## Compatibility
(Delete if it changes no schema, contract, public API or deployed thing.) What must keep working (each one also a criterion above), the migration, how to roll back.

## Decisions
- <choice>: <reason>

## Out of scope
- …

## Log
```

Each acceptance criterion must be something that could be **proven false** by watching the app, its output or its data. Include the edge cases from the interview. "Works well" or "is fast" isn't a criterion; "export of 10k orders finishes in under 5s" is.

**Keeping behavior the same** (a refactor, an upgrade, a migration, performance work): `Problem` and `Solution` describe it for developers, and the criteria are the checks that must pass before and after, plus a measurable goal ("the old library is gone", "p95 under 200 ms").

**Too big for one spec?** If it has more than about 8 criteria, won't fit in one session, or has parts that could ship on their own, propose splitting it into **parts**, each small enough to build in one session. Write a **parent spec** for the whole feature with the same template, plus:

- `## Parts`: one line per part, `<slug>: <what it delivers>. Blocked by: <slugs> | none`. A part is blocked only by parts it truly can't start without. Parts with nothing blocking them can be built at the same time.
- `## Interface`: how the parts meet (the shared interface, message or data shape), agreed with the user.
- Acceptance criteria: only end-to-end ones (one or two) that pass only when all parts work together.

How to cut the parts:

- **Vertical first:** each part works end to end through every area it needs (a thin page, the API behind it, the device code), so it can be verified on its own. Split by area only when the parts meet at a contract.
- **Make the change easy first:** a shared contract, interface or refactor that the others need is its own first part, built as real code, and the others are blocked by it.
- **A wide mechanical change** (rename a column, change a shared type used everywhere) goes expand, migrate, contract: one part adds the new form next to the old one, then parts move the callers over in batches (each blocked by the expand), then a last part removes the old form (blocked by every batch). The checks stay green after each part.

Each part gets its own spec with `Part of: <parent slug>` under `Status`.

## Finish

Show the spec's acceptance criteria and ask the user to confirm we share the same picture. Then say: "Spec saved to `.agents/local/specs/<slug>.md`. Run `implement <slug>`." For a split feature, show the parent's criteria and parts, and say: "Run `implement <parent slug>` to build the parts, then `verify <parent slug>`." Don't start implementing.
