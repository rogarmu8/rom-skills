---
name: verify
description: Prove a spec (or a single claim) works by using the real app the way its users do, running tests and scripts, checking logs, and fixing what fails. Pass a spec slug, a claim in quotes, or --all.
disable-model-invocation: true
---

# Verify

Prove it works with evidence a skeptical reviewer would accept. "It compiles", "the tests pass" and "it should work" are not proof of something a user sees.

**Changes:** `.agents/scripts/`, `.agents/local/evidence/`, the spec's checkboxes and log, the feature file's `Verify` section, and app code only to fix a failure. Commits only if the spec has `Commits: yes`.

## Before you start

- Read `AGENTS.md` and `.agents/WORKFLOW.md` at the repo root (not the current folder, which may be a subproject) and follow their rules, especially "Safety" and "Verification scripts". If the root's `.agents/features/README.md`, `.agents/WORKFLOW.md` or the rom-skills block in `AGENTS.md` is missing, tell the user to run `setup-agent-workspace` first, and stop. If the block's version (`<!-- rom-skills:start v… -->`) is older than 0.2, ignoring the last number, tell the user to re-run `setup-agent-workspace` to update the rules, and stop.
- **Work out what to check:**
  - **A slug:** the acceptance criteria in the spec (see "Specs" in WORKFLOW.md). Set `Status: verifying`. Its changes are as "Specs" in WORKFLOW.md says; a parent spec without its own `Base:` uses its earliest part's. With no `Base:` at all, use the uncommitted changes and say so. If the spec has a `Branch:`, check that it's the one checked out.
  - **A parent spec** (it has `## Parts`): every part's criteria plus the parent's end-to-end ones, all against the combined code. Don't start until every part is at least `verifying`.
  - **A claim:** restate it so it could be proven false, with a condition, what you'll observe, and a threshold if there is one.
  - **`--all`:** see the last section.
- Read `.agents/features/README.md` (how to run and test), the feature files involved, and their `Verify` sections.
- If something has to be running, start it with the command in `How to run`, or the script in `.agents/scripts/` if it needs one.

## 1. Regression first

Find every feature the changes touch (the spec's, or for a claim, this branch's and uncommitted ones). A change to a shared contract or package touches every feature of every area that uses it. Run the scripts and tests listed in those features' `Verify` sections, and the checks in "Before calling it done" in AGENTS.md (failures the spec's `Log` lists as already there don't count), so you catch "the new thing works, but the old thing broke".

## 2. Pick the evidence for each criterion

Use the first option that really proves it:

1. **An existing test already covers it:** run it.
2. **Internal logic** (a calculation, a rule, a data transform): the project's test suite is enough.
3. **Something a user sees or does:** it must be seen in the running app, through its real interface. Use the repo's e2e suite if it covers it. Otherwise use a script in `.agents/scripts/<feature>/`: run it if one exists, or write it if not, following "Verification scripts" in WORKFLOW.md. Only write scripts for what tests can't cover.
4. **Really can't be scripted** (an OTP, a native OS dialog): mark it `manual`, give the user exact steps and what to look for, and wait for their answer.

## 3. Use it like a real user

| Project | Use it through | Edge cases to try |
|---|---|---|
| Web | a real browser through the frontend: click, type, navigate, using the saved login | empty states, errors, failed or slow requests, permissions, reload |
| API | HTTP calls like a client would make | bad input, missing or wrong auth, limits, error codes |
| CLI | the real command, with real arguments | wrong flags, missing files, exit codes, stdin and pipes |
| Mobile or desktop app | an emulator or the real app, through a UI driver (the one the project has) | rotation or resize, offline, permissions denied, app killed and reopened |
| Worker or pipeline | a real input or message, then the output or side effect it produces | empty, malformed or duplicate input, retries, partial failure |
| Library | a tiny example program that uses only the public API | unusual inputs, error handling |
| Firmware | a simulator, or the real device (flashing needs approval), reading its serial or log output | bad or missing input, timeouts, reset or power loss mid-task, limits |
| Shared contract (protobuf, API spec) | the regenerated code on both sides: a real producer sends, a real consumer reads | missing and unknown fields, an older peer talking to a newer one |
| Anything else | whatever its users actually use | the failure modes its users would hit |

- **Check what the user gets:** the text on screen, the file, the response, the output.
- **Then check that it actually happened:** reload and see it's still there, open the downloaded file, call the list endpoint. Reading the database directly still needs approval.
- **No shortcuts through the code** as proof. Calling internal functions, or the API directly instead of the frontend, doesn't prove the frontend works. Shortcuts are fine for setting up state.

## 4. Check the logs

While each flow runs, record every log the interface has: the browser console and network (failed or unfinished requests) for web, stdout, stderr and the exit code for commands, and server, worker, app or device output. Save them to the evidence folder.

**New errors mean the criterion is not verified,** even if the result looks right. "New" means compared with the baseline. Mention errors that were already there in one line, but don't let them block.

## 5. Before and after

For a bug fix or a change in behavior, the check should fail before the change and pass after it. For a change meant to keep behavior the same, both runs must pass with the same results. Skip this for brand-new features, where "before" just fails.

- **A test written test-first** (by `implement` or `patch`) already failed before the change. A passing run now is enough.
- **Anything else** (a script, a behavior-preserving check): run it on the spec's starting point too (the `Base:` commit, or `git merge-base <base> <branch>` for a branch). Create a temporary `git worktree` of the base outside the repo, in the system temp folder, so the repo's tools don't pick up a second copy. Run the install (and codegen) from `How to run` there first, and remove the worktree with `git worktree remove` when done.

## 6. Verdict

Give each criterion exactly one verdict, based on exit codes and evidence, not your impression. Never soften a failure.

- **`VERIFIED`:** passes, with no new errors.
- **`NOT VERIFIED`:** fails, behaves differently from the criterion, or causes new errors.
- **`INCONCLUSIVE`:** you couldn't get a valid measurement (the environment broke, the signal was noisy, there was no baseline), or you couldn't use the real interface (for example, there's no browser driver). Say what's missing, and offer to add it.

## 7. Fix what fails

If a criterion is `NOT VERIFIED`: find the cause. If it's in logic, first write a test that fails because of it, following "Writing tests" in AGENTS.md. Fix it following "Writing code", then verify it again. After any change you make, including to dependencies, re-run what it could affect: the criterion, the regression checks and "Before calling it done" in AGENTS.md. Ask the user only if the fix needs a decision (the spec is unclear or wrong, or it's a product choice), or if you're stuck (see "Writing code").

## 8. Scope check

Read the spec's changes against it. Flag anything that touches `Out of scope`, or changes behavior the spec doesn't mention.

## 9. Write back

- **Spec:** tick each `VERIFIED` criterion. Add one `Log` line per criterion with its verdict and evidence, like `verify: 2 NOT VERIFIED → tooltip missing → fixed → VERIFIED (scripts/order-export/empty.mjs)`. Set `Status: done` when everything is verified; for a parent spec, on it and every part. Then move them to `specs/done/`. If the spec has a `Branch:`, tell the user it's ready to merge or open a PR. Don't do either yourself.
- **Feature file:** in `Verify`, point to the scripts and tests that prove it, and add any gotchas you ran into.
- **Commits:** if the spec has `Commits: yes`, commit your fixes and these updates on its branch, as `implement` does.

## Output

```
<criterion 1>: VERIFIED
  evidence: scripts/order-export/csv.mjs exit 0; .agents/local/evidence/order-export/csv.png; no new console errors
<criterion 2>: NOT VERIFIED → fixed (tooltip missing) → VERIFIED
Regression: 4 scripts, all pass
Scope: nothing outside the spec
```

## `--all`: full regression sweep

1. Run every script in `.agents/scripts/` and every area's test suites, going through the features in the order of `.agents/features/README.md`.
2. Before starting, list the scripts marked `touches: db` or `touches: irreversible` and ask once for all of them.
3. Report pass/fail per feature. Don't fix anything in this mode. Ask the user which failures to fix.
