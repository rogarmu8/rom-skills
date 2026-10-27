<!-- rom-skills workflow. Managed by setup-agent-workspace: edits here are overwritten when it updates. -->
# Workflow

Rules for specs and verification scripts, used by the rom-skills skills (`feature`, `implement`, `patch`, `verify`, `explain`, `review`). The rules for all work are in `AGENTS.md`.

## Feature files

One per feature, fitting on one screen, with four sections:

- `What`: what users get from the feature as a whole and why they want it, in 1–3 sentences. Keep existing capabilities and new ones at the same level of detail. Leave the latest change's details to its spec, and rules and edge cases to the code.
- `Code`: where to start reading (a file or two) and the folders involved, plus related features. No lists of functions or routes.
- `Verify`: which scripts or tests prove it, and gotchas.
- `Decisions`: `choice: reason`, only for choices that are hard to undo or would surprise someone.

When you create one, add it to the list in `features/README.md`.

## Specs

Specs live in `.agents/local/specs/`. Each is also its own progress tracker. Look for a slug in `specs/`, then in `specs/done/`.

- **Commit permission.** Every spec starts with `Commits: no`, and a missing field means no too. It becomes `yes` only when the user asks for commits on this spec, or says yes when `feature` asks for a feature it splits into parts. Don't offer commits otherwise. Write in the `Log` what the user agreed to. A parent's answer covers its parts and their verification; copy it into each part, and check the parent's current answer before committing, since the user can take it back. A one-off "commit this" covers that commit only.
- **Where the work starts.** Before changing code, record under `Status`: `Commits:`, `Base: <full commit SHA>` (`git rev-parse HEAD`), and `Branch: <branch>` if one is checked out. If you create a branch, also record `Base branch: <branch it came from>`, for information only. Never change `Base:` afterwards, even when resuming or switching branches.
  - **The spec's changes:** `git diff <base> <branch>`, plus uncommitted and untracked files while it's checked out. With no `Branch:`, `git diff <base>` plus untracked files. If there were already uncommitted changes when you set `Base:`, list those files (or hunks) in the `Log` and leave them out.
  - **Older specs whose `Base:` is a branch name:** find the starting commit in the `Log` or the git history and save its SHA. Never use the branch's current tip instead. If you can't find it, report before/after comparisons as `INCONCLUSIVE`.
- **Baseline.** Before changing code for a spec, run the checks from "Before calling it done" in `AGENTS.md` once, and note in the `Log` what already fails. Only failures your change caused block you. Mention the old ones in one line; don't fix them unless asked.
- **Ticking.** Tick a criterion only when a test or check you ran passes for it. Something a user sees needs a check through the real interface. Reading the code never counts: leave it unticked, with a `Log` line saying why.
- **Parts built at the same time** (each in its own worktree) don't edit feature files, `GLOSSARY.md` or the repo map, since those would conflict when merged. List the changes under `Docs to update:` in the part's `Log`; whoever merges the parts applies them.
- **Done.** When a spec reaches `Status: done`, move it to `specs/done/`.
- **No test setup in an area:** ask before adding one. Until then, prove behavior there with a verification script.

## Verification scripts (`.agents/scripts/`)

- Only for something that will be repeated and isn't already one command (a build-system task, a package script, a make target). If it is, put that command in `How to run` instead.
- Drive the real interface the way its users do: a browser for web, HTTP calls for APIs, the real command for CLIs, or whatever its users actually use. Shortcuts are fine for setting up state, never for the thing being checked.
- Use the repo's own tools and task runner, in the language of the area. A subfolder per area when there are several.
- Browser driver: one package for the repo, the one it already has if any. If there's none, ask to add Playwright as a dev dependency (`@playwright/test` in Node) in the web area or the e2e package. Never write your own driver.
- Exit 0 on pass, non-zero on fail.
- Start with a header comment: what it checks, `needs:` (what must be running), `touches:` (`none`, `db` or `irreversible`).
- Save evidence to the `--out <dir>` you're given, defaulting to `.agents/local/evidence/<script>/`: screenshots, responses, output files, and whatever logs the interface has.
- Read credentials from `.agents/local/.env`, and list the variable names in `.agents/scripts/.env.example`. Test accounts only; never hardcode secrets.
