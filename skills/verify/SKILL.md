---
name: verify
description: Prove a spec, bug report, branch or claim with the right tests and real-interface checks, save the evidence, and fix what fails. Pass a spec slug, a target or claim in quotes, or --all.
disable-model-invocation: true
---

# Verify

Prove it works with evidence a skeptical reviewer would accept. Match the evidence to the claim: a unit test can prove a calculation, a browser run can prove what a user sees, and neither proves anything it didn't run.

**Changes:** tests and verification scripts, `.agents/local/evidence/`, a spec's checkboxes and log, a feature file's `Verify` section, and app code only to fix a failure in scope. Commits only as "Commit permission" in WORKFLOW.md allows. Never push, merge, or open a PR or MR unless asked.

## Before you start

- Read `AGENTS.md` and `.agents/WORKFLOW.md` at the repo root (not the current folder, which may be a subproject) and follow their rules, especially "Safety" and "Verification scripts". If any of the root files `.agents/features/README.md`, `.agents/WORKFLOW.md` or `AGENTS.md` is missing, tell the user to run `setup-agent-workspace` first, and stop.
- Find how to run and test it: `.agents/features/README.md`, the feature files involved, the repo's docs, CI, and the tests and helpers that already exist. Use what's there.
- **Work out what to check:**
  - **A spec slug:** its acceptance criteria (see "Specs" in WORKFLOW.md). Set `Status: verifying`, and check that its `Branch:` is the one checked out. Its changes are as "Where the work starts" says; a parent spec without its own `Base:` uses its earliest part's. With no `Base:` at all, use the uncommitted changes and say so.
  - **A parent spec** (it has `## Parts`): every part's criteria plus the parent's end-to-end ones, all against the combined code. Don't start until every part is at least `verifying`.
  - **A bug report or claim:** restate it so it could be proven false: the starting state, the action, what you'll observe, and a threshold if it's measurable.
  - **A branch or diff:** compare it with its base, plus uncommitted changes if they belong to it. Work out the claims from what it's meant to do and what it touches. Ask if you can't tell what it's meant to do.
  - **`--all`:** see the last section.
- List what the changes could break, including every user of a changed contract or shared package. Write down the claims and this list before running anything.

## 1. Pick the evidence

Look at the tests that already exist first. For each claim, pick the least that really proves it:

| Claim | Evidence |
|---|---|
| Calculation, rule, data transform | Unit tests through a public interface, with the edge cases that matter |
| Parts working together | Integration tests across that boundary |
| Something in a browser | The repo's browser tests, or a script driving the running frontend |
| API | Real HTTP calls, with auth, response contents and errors |
| CLI | The real command: arguments, output, exit code, files it writes |
| Worker, mobile or desktop app, firmware, library | Real input and output: the UI driver the project has, a simulator, the device, or a small program using the public API |
| Performance | A realistic workload, a baseline, several runs, and what limits the result |

- Existing Playwright, Cypress or other tests count if they really run that behavior. Check their mocks, assertions and skipped cases first.
- A mocked response only proves the code handles that response, not that it works with the real service. Calling the API or an internal function doesn't prove the frontend works. Shortcuts are fine for setting up state.
- Don't copy existing tests into `.agents/scripts/`. Add missing automated checks to the project's test suite. Write a verification script only for a repeated check that tests and existing commands can't cover, following "Verification scripts" in WORKFLOW.md.
- Use the project's browser driver. If there's none, ask before adding Playwright. Never write your own.
- If a check needs a person (an OTP, a native OS dialog), give exact steps and what to look for. Carry on with the other checks, and leave that claim `INCONCLUSIVE` until they answer.

## 2. Get the environment ready

Set up only what your checks need. Unit tests don't need the app running.

- Get what has to be in place: the build, services, migrations or seed data, a login. Use the commands in `How to run`. Database and irreversible actions still need approval.
- Use the project's own way of loading credentials and saved logins; for new scripts, `.agents/local/.env`. Never print secrets or put them in evidence.
- If runs could get in each other's way, give yours its own port, browser profile and throwaway data. Don't drive an instance someone else is using, or reset their data.
- **Check it's ready before you use it:** the right build, the right URL or device, usable data, a valid login. Use a health check if the project has one. A port that answers isn't enough.
- After a surprising failure, check readiness again. If your instance is running but stuck, reset or restart it.
- Pick the evidence folder before you start: the repo's own if it has one, otherwise `.agents/local/evidence/<run>/`. Keep track of what you start, so you can clean it up.

## 3. Regression first, then each claim

Run the tests and scripts for everything the changes touch (the list from "Before you start") and the checks in "Before calling it done" in AGENTS.md. Failures the spec's `Log` lists as already there don't count, but never call a failure old without that record.

For each claim:

1. Run the check through the interface the claim is about. Try the edge cases that matter: empty states, bad input, errors, permissions, recovery.
2. Save what you did and what you got: the command and its output, screenshots, responses, downloaded files, exit codes, and the logs (for a browser, the console and failed network requests).
3. Check that it really happened: reload, open the downloaded file, call the list endpoint. Reading the database directly still needs approval.
4. **New errors mean it's not verified,** even if the result looks right. Mention old errors in one line.

## 4. Before and after

For a bug fix or a change in behavior, the check should fail before the change and pass after it. For a change meant to keep behavior the same, both runs must pass with the same results. Skip this for brand-new features.

- **A test written test-first** (by `implement` or `patch`) already failed before the change. A passing run now is enough for what it covers, but not for a different interface.
- **Anything else:** run the same check at the starting point: the spec's `Base:`, or the merge base for a branch. Use a temporary `git worktree` outside the repo, in the system temp folder. Run the install and codegen from `How to run` there, give it its own runtime state, and keep evidence outside it. Stop what you started and remove it with `git worktree remove`. If you can't run the old version, the comparison is `INCONCLUSIVE`.

## 5. Fix what fails

First, tell a real bug from a broken check. If the environment or your script is what failed, fix that and run again; it says nothing about the product.

For a real bug in scope: if it's in logic, first write a test that fails because of it, following "Writing tests" in AGENTS.md. Fix the cause following "Writing code", then re-run the claim, the regression checks and "Before calling it done", including after any dependency change. Never loosen a claim, a test or a setup step to get a pass. Ask if the fix needs a product or scope decision. Report problems outside the scope without fixing them.

## 6. Clean up and report

- Stop only what you started, remove throwaway data, and check the evidence is still there afterwards. Leave things running only if the user wants them.
- Give each claim exactly one verdict, based on exit codes and evidence, not your impression. Never soften a failure.
  - **`VERIFIED`:** the checks pass, with no new errors.
  - **`NOT VERIFIED`:** it fails, behaves differently from the claim, or causes new errors.
  - **`INCONCLUSIVE`:** you couldn't get valid evidence: no access, something missing, no baseline, no way to use the real interface, or a noisy measurement. Say what's missing, and offer to add it. A path you couldn't reach isn't verified by checking a different one.
- **Scope:** compare the changes with the spec or request, and flag anything outside it or behavior it doesn't mention.
- **Spec:** tick only `VERIFIED` criteria, and untick any the evidence now contradicts. Add one `Log` line per criterion with its verdict and evidence. Set `Status: done` and move it to `specs/done/` only when every criterion is verified; for a parent, on it and every part. If it has a `Branch:`, say it's ready to merge or open a PR. Don't do either yourself.
- **Feature file:** in `Verify`, point to the tests and scripts that proved it, what they need, and any gotchas.
- **Commits:** with `Commits: yes` (for a part, check the parent still has it), commit your fixes and these updates on the spec's branch, as `implement` does. Otherwise only if the user asks.

```
<claim 1>: VERIFIED
  evidence: scripts/order-export/csv.mjs exit 0; .agents/local/evidence/order-export/csv.png; no new console errors
<claim 2>: NOT VERIFIED → fixed (tooltip missing) → VERIFIED
Regression: 4 scripts, all pass
Scope: nothing outside the spec
```

## `--all`: full regression sweep

1. List every area's test suites and verification scripts, from the feature files, or from the repo's docs, CI and test config. Run checks only, not start, reset or publish scripts.
2. Before starting, list the checks that touch the database or can't be undone, and ask once for all of them. The project's own test commands don't need approval. Never skip a blocked check silently.
3. Same readiness, evidence and clean-up rules. Report pass/fail and missing coverage per feature. Don't fix anything in this mode; ask the user which failures to fix.
