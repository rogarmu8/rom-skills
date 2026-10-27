---
name: implement
description: Build a spec written by feature, test-first in small slices, keeping the spec updated as the progress tracker. Pass the spec slug; pass a parent spec to build all its parts.
disable-model-invocation: true
---

# Implement

Build what the spec says, one acceptance criterion at a time, with the smallest clean change that does it.

**Changes:** app code and tests, the project's own docs, the spec's status, checkboxes and log, and the feature file. Commits only with `Commits: yes` (see "Commit permission" in WORKFLOW.md). Branches only with the user's agreement.

## Before you start

- Read `AGENTS.md` and `.agents/WORKFLOW.md` at the repo root (not the current folder, which may be a subproject) and follow their rules, especially "Writing code", "Writing tests" and "Specs". If any of the root files `.agents/features/README.md`, `.agents/WORKFLOW.md` or `AGENTS.md` is missing, tell the user to run `setup-agent-workspace` first, and stop.
- Open the spec. If no slug was given, list the specs whose status isn't `done` and ask which one.
- **A parent spec** (it has `## Parts`): follow "Building the parts" below instead of the rest.
- Read the feature file, `.agents/GLOSSARY.md` and the code in the area. Use the glossary's words in names.
- **Part of a bigger feature** (`Part of:` under `Status`): read the parent spec, especially `Interface`, and the other parts' specs. Build only your part, against that interface, even if another part isn't built yet. If you find the interface doesn't work, stop and ask; don't change it on your own. Once agreed, update it in the parent spec.
- **Resuming:** if the spec has a `Branch:` that isn't checked out, switch to it first (ask if there are uncommitted changes). If the `Log` has `NOT VERIFIED` entries, fix those first. Otherwise start at the first unticked criterion.
- **Starting fresh** (no `Base:` yet): record `Commits:`, `Base:` and `Branch:` as "Where the work starts" in WORKFLOW.md says, then run the baseline checks.
- **Branches:**
  - **On a feature branch,** or one the user named: stay on it.
  - **On a shared branch** (the repo's default, `main`, `master`, `develop`, or one that looks shared like `release/*`, `staging`, `production`), or with no branch checked out: with `Commits: yes`, ask whether to create a branch for it, unless the user already said so. With `Commits: no`, stay where you are unless the user asks for a branch.
  - **Creating a branch** (here, or whenever the user asks for one): create it from the current branch, named the way the repo names its branches (`feature/<slug>` if others look like that), and switch to it.
  - If a file you need to change already has uncommitted changes that aren't yours, ask before your commits include it.
- Set `Status: implementing`.

## Build in vertical slices

For each acceptance criterion, in order:

1. **Red:** write one failing test at an agreed seam from the spec. Run it, and check it fails for the right reason. If the area has no test setup, see "No test setup" in WORKFLOW.md.
2. **Green:** write the minimum code that makes it pass. Nothing for future criteria.
3. Run that test and the nearby tests.
4. Tick the criterion in the spec, following "Specs" in WORKFLOW.md. With `Commits: yes`, commit: `<slug>: <criterion in a few words>`, or the repo's own message style if it has one.

Never write all the tests first. Each slice should teach you something for the next.

For a criterion that says behavior stays the same (a refactor, an upgrade), there's no red step: run the checks it names before the change and again after it.

If a criterion can only be seen in the running app (layout, a visual state) and has no sensible test at a seam, implement it, leave it unticked, and add a line to the `Log` saying `verify` needs to check it.

At the end, run everything in "Before calling it done" in AGENTS.md once.

## When the spec is wrong

If a criterion is impossible, contradicts the code, or misses a case you've found: stop. Explain the problem in one or two sentences, propose a change, and ask. Update the spec once the user decides. Never quietly build something different from the spec.

## Before you finish

1. **Re-read the spec's whole diff against it:**
   - Is every criterion covered?
   - Is anything from `Out of scope` in it?
   - Is there anything the spec didn't ask for?
2. **Cut:**
   - unused code and extra abstractions
   - stray changes (formatting, renames, drive-by fixes)
   - code the change made obsolete
   - tests that don't meet the test bar
3. **Update the docs:** the feature file (create it if it doesn't exist yet, and add it to the list in `.agents/features/README.md`) if entry points moved or you made a decision worth keeping, and the project's own docs per "Before calling it done". A part built at the same time as others lists these under `Docs to update:` instead (see "Specs").
4. **Update the spec:** set `Status: verifying`, and add a `Log` line (`implement: criteria 1–4 done, CI checks green`). With `Commits: yes`, commit what's left.
5. **Tell the user** in two or three lines what changed. Then say: "Run `verify <slug>`."

## Building the parts

For a parent spec, build its parts on one branch, so `verify <parent>` can check them together.

1. **Commits:** use the parent's `Commits:`. If an older parent spec has none, ask once as `feature` does, and record the answer. With `Commits: yes`, follow "Branches" above; parts built at the same time each get their own branch, merged into the feature's. With `Commits: no`, build the parts one after another, without commits.
2. Record `Base:` and `Branch:` on the parent spec (keep an existing `Base:` when resuming), and run the baseline checks once there.
3. **The frontier** is every part that isn't built yet (`Status` before `verifying`) and whose `Blocked by` parts are all built.
4. **Build the frontier:**
   - **Several parts, `Commits: yes`, and your tool has sub-agents:** give each part its own sub-agent, in its own `git worktree` outside the repo, on a branch `<part slug>` created from the parent's branch. Tell it: the absolute paths to its spec and the parent spec in this checkout's `.agents/local/specs/`, to run the install from `How to run` first, to follow this skill for its spec on that branch with `Commits: yes` (without asking), to run only its own areas' checks and never start the app, to follow "Parts built at the same time" in WORKFLOW.md, and, if it needs a decision (the spec or interface is wrong), to stop and report back instead of guessing. You ask the user and pass the answer on. If a part's worktree already exists from an earlier run, reuse it.
   - **Otherwise:** build each part yourself, one after another, following this skill from "Before you start": in the parent's checkout and with its `Commits:`, without asking again.
5. **When a part built in its own worktree is ready:** if the parent still has `Commits: yes`, merge its branch into the parent's branch and re-run the checks for the areas it touched. Resolve a conflict yourself only when both sides plainly stay whole (imports, lines next to each other). For anything else, and always in a shared contract or the `Interface`, stop, show the conflict and ask. Remove its worktree. Sequential parts already in the parent's checkout need no merge.
6. Repeat from step 3 until every part is built. Then apply every part's `Docs to update:` (with `Commits: yes`, commit them), set the parent to `Status: verifying`, and say: "Run `verify <parent slug>`."

Never push. Commit only with `Commits: yes`, on the spec's branch, and only the files you changed for it.
