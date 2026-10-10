---
name: verify
description: Prove a spec (or a single claim) works by using the real app the way its users do, running tests and scripts, checking logs, and fixing what fails. Pass a spec slug, a claim in quotes, or --all.
disable-model-invocation: true
---

# Verify

Prove it works with evidence a skeptical reviewer would accept. "It compiles", "the tests pass" and "it should work" are not proof of something a user sees.

**Changes:** `.agents/scripts/`, `.agents/local/evidence/`, the spec's checkboxes and log, the feature file's `Verify` section, and app code only to fix a failure.

## Before you start

- Read `AGENTS.md` and follow its rules, especially "Safety" and "Verification scripts". If `.agents/features/README.md` or the rom-skills block in `AGENTS.md` is missing, tell the user to run `setup-agent-workspace` first, and stop.
- **Work out what to check:**
  - **A slug:** the acceptance criteria in `.agents/local/specs/<slug>.md`. Set `Status: verifying`.
  - **A claim:** restate it so it could be proven false, with a condition, what you'll observe, and a threshold if there is one.
  - **`--all`:** see the last section.
- Read `.agents/features/README.md` (how to run and test), the feature files involved, and their `Verify` sections.
- Start the app with `.agents/scripts/start*` or the commands in `How to run`.

## 1. Regression first

Find every feature the diff touches. Run the scripts and tests listed in those features' `Verify` sections, so you catch "the new thing works, but the old thing broke".

## 2. Pick the evidence for each criterion

Use the first option that really proves it:

1. **An existing test already covers it:** run it.
2. **Internal logic** (a calculation, a rule, a data transform): the project's test suite is enough.
3. **Something a user sees or does:** it must be seen in the running app, through its real interface. Use the repo's e2e suite if it covers it. Otherwise use a script in `.agents/scripts/<feature>/`: run it if one exists, or write it if not, following the script rules in AGENTS.md.
4. **Really can't be scripted** (an OTP, a native OS dialog): mark it `manual`, give the user exact steps and what to look for, and wait for their answer.

Only write scripts for what tests can't cover. Don't duplicate a test that already exists.

## 3. Use it like a real user

| Project | Use it through | Edge cases to try |
|---|---|---|
| Web | a real browser through the frontend: click, type, navigate, using the saved login | empty states, errors, failed or slow requests, permissions, reload |
| API | HTTP calls like a client would make | bad input, missing or wrong auth, limits, error codes |
| CLI | the real command, with real arguments | wrong flags, missing files, exit codes, stdin and pipes |
| Library | a tiny example program that uses only the public API | unusual inputs, error handling |

- **Check what the user gets:** the text on screen, the file, the response, the output.
- **Then check that it actually happened:** reload and see it's still there, open the downloaded file, call the list endpoint. Reading the database directly still needs approval.
- **No shortcuts through the code** as proof. Calling internal functions, or the API directly instead of the frontend, doesn't prove the frontend works. Shortcuts are fine for setting up state.

## 4. Check the logs

While each flow runs, record the browser console (errors, warnings, uncaught exceptions), the network (failed requests, requests that never finish) and the server output. Save them to the evidence folder.

**New errors mean the criterion is not verified,** even if the screen looks right. "New" means compared with the baseline. Mention errors that were already there in one line, but don't let them block.

## 5. Before and after

For a bug fix or a change in behavior, run the same check on the base commit (a temporary `git worktree` under `.agents/local/`) and on the change. It should fail before and pass after. Skip this for brand-new features, where "before" just fails.

## 6. Verdict

Give each criterion exactly one verdict, based on exit codes and evidence, not your impression:

- **`VERIFIED`:** passes, with no new errors.
- **`NOT VERIFIED`:** fails, behaves differently from the criterion, or causes new errors.
- **`INCONCLUSIVE`:** you couldn't get a valid measurement (the environment broke, the signal was noisy, there was no baseline), or you couldn't use the real interface (for example, there's no browser driver). Say what's missing, and offer to add it.

Never soften a failure.

## 7. Fix what fails

If a criterion is `NOT VERIFIED`: find the cause, fix it following "Writing code" in AGENTS.md, then verify it again. Ask the user only if the fix needs a decision (the spec is unclear or wrong, or it's a product choice), or if it still fails after three attempts.

## 8. Scope check

Read the diff against the spec. Flag anything that touches `Out of scope`, or changes behavior the spec doesn't mention.

## 9. Write back

- **Spec:** tick each `VERIFIED` criterion. Add one `Log` line per criterion with its verdict and evidence, like `verify: 2 NOT VERIFIED → tooltip missing → fixed → VERIFIED (scripts/order-export/empty.mjs)`. Set `Status: done` when everything is verified.
- **Feature file:** in `Verify`, point to the scripts and tests that prove it, and add any gotchas you ran into.

## Output

```
<criterion 1>: VERIFIED
  evidence: scripts/order-export/csv.mjs exit 0; .agents/local/evidence/order-export/csv.png; no new console errors
<criterion 2>: NOT VERIFIED → fixed (tooltip missing) → VERIFIED
Regression: 4 scripts, all pass
Scope: nothing outside the spec
```

## `--all`: full regression sweep

1. Run every script in `.agents/scripts/` and the project's test suites, going through the features in the order of `.agents/features/README.md`.
2. Before starting, list the scripts marked `touches: db` or `touches: irreversible` and ask once for all of them.
3. Report pass/fail per feature. Don't fix anything in this mode. Ask the user which failures to fix.
