# Changelog

## 0.2.3

- `implement` always asks once whether to commit after each criterion, but offers a new branch only when you're on a shared branch (the default, `main`, `master`, `develop`, release branches). On a feature branch it stays there, counting only the work since it started. It never commits on a shared branch, and asks before committing a file that already had someone else's uncommitted changes. The answer is recorded in the spec as `Commits:`, and `verify` follows it too, committing its fixes. Commits follow the repo's message style and never skip hooks. Re-run `setup-agent-workspace` to update the commit rule.
- README: the rules section leads with verification (proof over claims), and lists the rules added in 0.2.x.

## 0.2.2

- Skills check the version of the rules block in `AGENTS.md`. If it's older than the skill's minor version (0.2 here), they ask you to re-run `setup-agent-workspace`, so a skill never follows a rule the project doesn't have yet. Patch releases don't trigger it.
- `setup-agent-workspace` can update only the rules block, without a full audit, if that's all you want.
- The shared rules are split in two. The block in `AGENTS.md`, read in every session, is about half as long (about 800 words): rules for all work only. The rules only the skills need (specs, feature file format, verification scripts) moved to `.agents/WORKFLOW.md`, which setup copies and the skills read. Duplicates removed. Re-run `setup-agent-workspace` to get it; the skills ask you to if `WORKFLOW.md` is missing.

## 0.2.1

Rules that keep code quality up, and easier to follow for everyone.

- Never make a check pass by weakening it (deleting, skipping or loosening tests, turning off lint rules, ignore comments, swallowing errors). Ask instead.
- The "run the checks before you start" rule only applies to work from a spec, so plain sessions aren't slowed down.
- Three tries at the same failure, then stop and ask, in every skill and session (was only in `verify`).
- Secure by default: validate input at the edges, no queries, commands or HTML built by joining strings, no secrets in code or logs, keep existing auth checks.
- `implement <parent>` only resolves merge conflicts itself when both sides plainly stay whole; otherwise it shows the conflict and asks.
- `feature` writes the test seams into the spec and asks only when there's a real trade-off, in plain words.
- `review` handles large changes area by area and says what got only a light look.
- README: a "How to use" walkthrough.

## 0.2.0

Long features in parts, built in parallel, and a review skill. Ideas from Matt Pocock's `to-tickets`, `implement-spec` and `code-review`.

- New skill `review`: review someone else's branch, PR or range with no prior context. Finds the starting point itself (where the branch left the default branch, a PR, "since <commit or date>"), works out the goal from a spec, the PR or the commits, and reports Intent, Correctness and Standards separately, each finding with a level and `file:line`. Read-only; can run the checks in a temporary worktree.
- `implement` asks once per spec whether to work on its own branch and commit after each criterion. The spec records `Branch:` and `Base:`, and its changes are the branch's diff. Without a branch, it works as before.
- `implement <parent>` builds all parts on one branch: it works out which parts are unblocked, builds them one after another, or at the same time in their own worktrees with sub-agents if the tool has them, merges each into the parent's branch, then applies the parts' doc updates.
- Parts have `Blocked by:` instead of a build order, are sized to one session, and are cut vertically (end to end through every area) unless they meet at a contract. A shared contract or refactor goes first as its own part. Wide mechanical changes go expand, migrate, contract.
- Sub-agents building parts stop and report back when they need a decision; the coordinator asks the user. Resuming switches to the spec's branch. `verify` ends by saying the branch is ready to merge.
- Parts built at the same time don't edit feature files, the glossary or the repo map; they list `Docs to update:` for whoever merges them.
- `verify` before/after: a test written test-first counts as the "before" run. Otherwise the base runs in a temporary worktree outside the repo, with dependencies installed, removed afterwards.

## 0.1.3

Monorepo support, including mixed-language repos with firmware and shared contracts.

- One `.agents/` at the repo root. Every skill looks for it there, even when started in a subproject, and setup never creates one in a subfolder.
- Setup reads workspace and task-runner config (pnpm, turbo, nx, moon, pixi, Bazel, CMake…), records which areas use which, and writes `How to run` per area. Area scripts go in `.agents/scripts/<area>/`.
- Checks run for the areas you changed and the areas that depend on them, not the whole repo.
- New rule for shared contracts (protobuf, API specs, shared packages): regenerate code with the repo's command, update every consumer, never edit generated code.
- `verify` covers firmware (simulator or device, serial logs) and shared contracts (a real producer and consumer). Flashing a device needs approval.
- Works beyond web apps: `verify` covers mobile and desktop apps, workers and pipelines, with a catch-all row; logs mean whatever the interface has; `start` only when something has to run.
- Areas with no test setup: ask before adding one, and prove behavior with a verification script until then.
- Scripts only for repeated chores that aren't already one command. If the build system already starts or resets something, setup writes that command in `How to run` instead.
- Behavior-preserving work (refactors, upgrades, migrations, performance) gets specs whose criteria are checks that pass before and after, plus a measurable goal.
- Specs have a `Compatibility` section for changes to schemas, contracts, public APIs or anything deployed: what must keep working, the migration, rollback.
- New "Before calling it done" rule: run what CI runs (lint, format, types, build, affected tests) and update the project's own docs.
- Setup handles new or nearly empty repos: a repo map with `planned` areas, filled in as features appear.
- `feature` proposes splitting big features (more than about 8 criteria) into parts that can be built separately. A parent spec lists the parts, holds the agreed interface and adds end-to-end criteria; each part spec says `Part of:` it. `implement` builds one part against that interface, and `verify <parent>` checks every part's criteria plus the end-to-end ones together.
- `explain` can walk through how a feature or area works, not just a diff.
- A feature's user can be a person, a developer using a library, or another system.
- Specs record `Base:`, the commit the work started from. `verify`, `explain` and before/after checks use it to find the spec's changes, even after you commit. Files that already had uncommitted changes are logged and left out.
- `implement` and `patch` run the CI checks once before changing code and log what already fails. Only new failures block.
- One ticking rule for every skill: a check you ran must pass, and something a user sees needs the real interface. Finished specs move to `specs/done/`.
- The project's own test commands don't need database approval, even if they use a test database.
- When `verify` fixes a logic bug, it writes a failing test first.
- New feature files are added to the repo map's feature list.
- Setup reads the repo's existing agent rules, asks about conflicts with the block, and links to existing docs instead of copying them.

## 0.1.2

Fixes from the first run on a real project.

- New "Reporting" rule: check the real state after a blocked or failed command, and never present a blocked command as the user's decision.
- One browser driver package, preferring `@playwright/test` or the one the project already has.
- `feature` checks `.agents/` before asking the user for facts.
- `verify` re-runs regression checks, tests and the build after its own fixes.

## 0.1.1

- `setup-agent-workspace` creates `.agents/local/` even while it's empty, so users can put credentials there.
- README: a "Recommended tools" section (Node, git, Playwright, curl).

## 0.1.0

First version. Six user-run skills: `setup-agent-workspace`, `feature`, `implement`, `patch`, `explain`, `verify`.
