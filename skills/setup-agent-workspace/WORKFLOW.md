<!-- rom-skills workflow v0.2.3. Managed by setup-agent-workspace: edits here are overwritten when it updates. -->
# Workflow

Rules for specs and verification scripts, used by the rom-skills skills (`feature`, `implement`, `patch`, `verify`, `explain`, `review`). The rules for all work are in `AGENTS.md`.

## Feature files

One per feature, fitting on one screen, with four sections:

- `What`: what users get and why they want it, in 1–3 sentences. Leave rules and edge cases to the code.
- `Code`: where to start reading (a file or two) and the folders involved, plus related features. No lists of functions or routes.
- `Verify`: which scripts or tests prove it, and gotchas.
- `Decisions`: `choice: reason`, only for choices that are hard to undo or would surprise someone.

When you create one, add it to the list in `features/README.md`.

## Specs

Specs live in `.agents/local/specs/`. Each is also its own progress tracker. Look for a slug in `specs/`, then in `specs/done/`.

- **Where the work starts.** The skill that first changes code for a spec records it under `Status`, plus `Commits: yes` or `no` if it asked:
  - **On its own branch:** `Branch: <branch>` and `Base: <branch it was created from>`. The spec's changes are `git diff <base>...<branch>`, plus anything uncommitted while it's checked out.
  - **On a feature branch that already existed:** `Branch: <branch>` and `Base: <commit>` (`git rev-parse HEAD`), so earlier work on the branch isn't counted. The changes are `git diff <base>...<branch>`, plus anything uncommitted.
  - **Otherwise:** `Base: <commit>` (`git rev-parse HEAD`). The changes are everything since then, committed or not (`git diff <base>`). If there are already uncommitted changes when you set it, list those files in the `Log` as not part of this spec, and leave them out.
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
