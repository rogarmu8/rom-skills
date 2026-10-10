---
name: feature
description: Interview me about a new feature or change until we share the same picture, update the glossary and feature file, and write a spec for implement. Writes no code.
disable-model-invocation: true
---

# Feature

Turn an idea into a spec that `implement` can build and `verify` can prove.

**Writes only:** the spec, `.agents/GLOSSARY.md`, `.agents/features/*.md`. Never app code, even if the change looks trivial.

## Before you start

- Read `AGENTS.md` and follow its rules. If `.agents/features/README.md` or the rom-skills block in `AGENTS.md` is missing, tell the user to run `setup-agent-workspace` first, and stop.
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

Before you're done, the answers must cover: who uses this and why, the main flow, edge cases and errors, and what's out of scope.

## Keep the docs current as you go

Write these as soon as something is settled; don't save them up for the end.

- **`GLOSSARY.md`:** add or fix the term (`**Term**: definition`, plus `_Avoid_: other words`). Terms only, never implementation details.
- **Feature file:** update `What`, and create the file if the feature is new. Add a line to `Decisions` only if the choice is hard to undo, would surprise a future reader, and was a real trade-off.

## Test seams

A seam is a public boundary where tests can watch behavior without reaching inside, such as an API endpoint, a page or a CLI command. Propose as few seams as possible, as high up as possible, and prefer ones that already exist. Give each one a line on what it catches and what it misses, then confirm them with the user.

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

## Decisions
- <choice>: <reason>

## Out of scope
- …

## Log
```

Each acceptance criterion must be something that could be **proven false** by watching the app, its output or its data. Include the edge cases from the interview. "Works well" or "is fast" isn't a criterion; "export of 10k orders finishes in under 5s" is.

## Finish

Show the spec's acceptance criteria and ask the user to confirm we share the same picture. Then say: "Spec saved to `.agents/local/specs/<slug>.md`. Run `implement <slug>`." Don't start implementing.
