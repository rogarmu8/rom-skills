---
name: implement
description: Build a spec written by feature, test-first in small slices, keeping the spec updated as the progress tracker. Pass the spec slug.
disable-model-invocation: true
---

# Implement

Build what the spec says, one acceptance criterion at a time, with the smallest clean change that does it.

**Changes:** app code and tests, the spec's status, checkboxes and log, and the feature file.

## Before you start

- Read `AGENTS.md` and follow its rules, especially "Writing code" and "Writing tests". If `.agents/features/README.md` or the rom-skills block in `AGENTS.md` is missing, tell the user to run `setup-agent-workspace` first, and stop.
- Open `.agents/local/specs/<slug>.md`. If no slug was given, list the specs whose status isn't `done` and ask which one.
- Read the feature file, `.agents/GLOSSARY.md` and the code in the area. Use the glossary's words in names.
- **Resuming:** if the `Log` has `NOT VERIFIED` entries, fix those first. Otherwise start at the first unticked criterion.
- Set `Status: implementing`.

## Build in vertical slices

For each acceptance criterion, in order:

1. **Red:** write one failing test at an agreed seam from the spec. Run it, and check it fails for the right reason.
2. **Green:** write the minimum code that makes it pass. Nothing for future criteria.
3. Run that test and the nearby tests, plus the type checker if the project has one.
4. Tick the criterion in the spec. Only tick a criterion when a test or check you ran passes. "Checked by reading the code" doesn't count: leave it unticked, with a `Log` line explaining why.

Never write all the tests first. Each slice should teach you something for the next.

If a criterion can only be seen in the running app (layout, a visual state) and has no sensible test at a seam, implement it, leave it unticked, and add a line to the `Log` saying `verify` needs to check it.

Run the full test suite once at the end.

## When the spec is wrong

If a criterion is impossible, contradicts the code, or misses a case you've found: stop. Explain the problem in one or two sentences, propose a change, and ask. Update the spec once the user decides. Never quietly build something different from the spec.

## Before you finish

1. **Re-read the whole diff against the spec:**
   - Is every criterion covered?
   - Is anything from `Out of scope` in it?
   - Is there anything the spec didn't ask for?
2. **Cut:**
   - unused code and extra abstractions
   - stray changes (formatting, renames, drive-by fixes)
   - code the change made obsolete
   - tests that don't meet the test bar
3. **Update the feature file** if entry points moved, or you made a decision worth keeping.
4. **Update the spec:** set `Status: verifying`, and add a `Log` line (`implement: criteria 1–4 done, full suite green`).
5. **Tell the user** in two or three lines what changed. Then say: "Run `verify <slug>`."

Don't commit unless the user asks.
