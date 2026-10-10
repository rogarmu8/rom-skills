---
name: setup-agent-workspace
description: Set up or refresh this repo's .agents/ workspace (repo map, feature files, glossary, start/login/reset scripts) and the shared rules in AGENTS.md. Run once per repo; re-run to audit.
disable-model-invocation: true
---

# Setup agent workspace

Map the repo so every later session starts with the context a developer on the team already has. Re-running is an audit: keep what's right, fix what drifted, add what's missing. Never wipe.

**Writes only:** `.agents/`, the rom-skills block in `AGENTS.md`, one line in `CLAUDE.md`, one line in `.gitignore`. Never app code.

## 1. Scaffold

- Create `.agents/features/`, `.agents/scripts/` and `.agents/local/` if missing, even while they're still empty. The user will put files in `.agents/local/` themselves.
- Add `.agents/local/` to `.gitignore` if it isn't there.
- Put the contents of [AGENTS-BLOCK.md](AGENTS-BLOCK.md) in `AGENTS.md`, creating the file if needed:
  - **No block yet:** append it.
  - **Block exists, different version:** replace everything between the markers.
- Make sure `CLAUDE.md` contains the line `@AGENTS.md`, creating the file with just that line if needed. Claude Code reads `CLAUDE.md`, and other agents read `AGENTS.md`.
- Read the block and follow its rules from here on.

## 2. Survey

Read the README, the manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Makefile`, `docker-compose.yml`…), CI config, the folder tree, entry points, routes and existing tests. In a big repo, give each top-level area to a sub-agent if your tool has them.

Find out:
- **Areas:** the main parts of the repo and their type (web, API, CLI, library, worker).
- **How to run:** install, start, test (unit and e2e, plus the e2e framework if any), seed data.
- **Features:** things a user can do or see (log in, check out, export). Shared code like the database or logging is an area, not a feature. Aim for 5–20.
- **Decisions:** only ones you find evidence for (README, comments, config). Never invent one.

## 3. Write the docs

Follow "Keeping it true" in AGENTS.md: only write what the code can't say.

`.agents/features/README.md`:
```md
# Repo map
## Areas
- Web app (web): `apps/web/`, Next.js
- Database (shared): `packages/db/`, Prisma
## Features
- [Order export](order-export.md): download orders as CSV
## How to run
- Install: … / Start: … / Unit tests: … / E2E: … (framework) / Seed: …
## Decisions
- Postgres, not Mongo: reporting needs joins
```

`.agents/features/<feature>.md`, using the four sections from AGENTS.md. Fill `What` and `Code`. Set `Verify` to `TODO: filled on first verify`, unless step 4 gives it a script you've run. Fill `Decisions` with the ones you found, or leave it empty.
```md
# Order export
## What
Customers download their orders as CSV to import into their accounting tools.
## Code
- Start at: `src/api/export/router.ts` (UI: `src/web/orders/`)
- Related: [Orders](orders.md)
## Verify
TODO: filled on first verify
## Decisions
```

`.agents/GLOSSARY.md`: only the core domain terms, each with a 1–2 sentence definition. Where several words mean the same thing, pick one and list the rest:
```md
**Order**: A customer's purchase of one or more products.
_Avoid_: purchase, transaction
```

## 4. Common scripts

Work out which of these the repo needs: `start` (bring the app up and wait until it's healthy), `login` (if there's auth), `reset` (if there's a database or seed data). Only add others if a chore will clearly repeat.

1. **Ask only what you can't find:** which test account to use, whether there's a test-mode bypass for 2FA, and so on. Put the values in `.agents/local/.env` and the variable names in `.agents/scripts/.env.example`.
2. **Write each script** following the script rules in AGENTS.md, using the repo's own language and tools. If a browser driver like Playwright isn't installed yet, ask before adding it.
3. **Login that needs a person** (OAuth, 2FA, captcha): the script opens a visible browser, the user logs in once, and it saves the session to `.agents/local/auth/`. Later runs reuse that session.
4. **Run each script once.** A script that has never run doesn't count. `reset` touches the database, so ask first.

## 5. Confirm with the user

Show a short summary: areas, the feature list, scripts, and what you couldn't find. Then ask about anything open in a single round, each question with your recommended answer, worded so "yes" accepts it. Typical questions are about feature boundaries ("Are Orders and Order export one feature or two?") and unclear words ("Is a 'workspace' the same as a 'team'?"). Apply the answers.

## Re-running (audit)

- Fix `Code` paths that moved and features whose code is gone. Ask before deleting a feature file.
- Add new features and areas. Update `How to run` if commands changed.
- Run the scripts that don't touch the database, and report any that broke.
- End with a short list of what changed.
