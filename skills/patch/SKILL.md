---
name: patch
description: Small changes, tweaks and bug fixes, end to end. Understands the problem (and reproduces it if it's a bug), writes a short spec, proposes the fix, then builds and checks it once you say go.
disable-model-invocation: true
---

# Patch

A short version of `feature` + `implement` for small work: a bug fix, a tweak, a copy change, a small addition.

**Changes:** app code and tests (only after the user says go), the patch spec, and the feature file.

## Before you start

- Read `AGENTS.md` and follow its rules, especially "Writing code" and "Writing tests". If `.agents/features/README.md` or the rom-skills block in `AGENTS.md` is missing, tell the user to run `setup-agent-workspace` first, and stop.
- Use `.agents/features/README.md` to find the feature involved, then read its feature file and the code.

## 1. Understand

- **A bug:** reproduce it yourself first, through the real interface (browser, HTTP call, CLI command) and the logs. Find the **cause**, not just where it shows up. If you can't reproduce it, say what you tried.
- **A change:** find where it belongs, and check what else uses that code.
- **Ask only what you can't find out,** such as the expected behavior or which users are affected. Often that's nothing. Put each question with your recommended answer, worded so "yes" accepts it.

**Too big for a patch?** If it needs real design decisions, touches several features, or keeps growing, stop and say: "This is bigger than a patch. Run `feature`."

## 2. Write a short spec

Save it to `.agents/local/specs/patch-<slug>.md`:

```md
# Patch: <short title>
Status: draft
Feature file: .agents/features/<feature>.md
Goal: <what should be true after this>
Repro: <steps → what happens instead>   (bugs only)
Cause: <one line>                       (bugs only)

## Criteria
- [ ] 1. <observable result>
- [ ] 2. <what must stay the same>

## Log
```

## 3. Propose, then wait

In two or three lines, say what's wrong (or what's needed), what you'll change, and how you'll check it. Ask "Go ahead?" and don't touch app code until the user says yes.

## 4. Build and check

1. Set `Status: implementing`.
2. **Failing test first** when there's logic or a bug: one test, at the public interface, that fails because of the problem. Trivial changes (copy, styling, config values) get no test.
3. Make the smallest clean change that fixes the cause.
4. Run the new test, the tests nearby, and the type checker.
5. **Check it like a user would:** repeat the reproduction, or the new behavior, through the real interface. Look at the logs too (browser console, network, server output), and confirm there are no new errors. Use `.agents/scripts/` if a script covers it.
   - Running a piece of the code on its own isn't using the real interface. If you can't drive it (for example, there's no browser driver), say so plainly, write down what you checked instead, and offer to add what's missing.
6. Re-read the diff and cut anything not needed.
7. Tick only the criteria you actually checked through the real interface, and leave the rest unticked. Set `Status: done` only if every criterion is ticked. Add a `Log` line describing what you checked and how.
8. If you learned something the code doesn't show, like a gotcha or how to test this, add it to the feature file.

## Finish

Tell the user in two or three lines what changed and how you checked it. For a deeper check (regression scripts, a before/after run), suggest `verify patch-<slug>`. Don't commit unless the user asks.
