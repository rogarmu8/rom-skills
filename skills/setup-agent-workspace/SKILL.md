---
name: setup-agent-workspace
description: Set up or refresh this repo's .agents/ workspace (repo map, feature files, glossary, scripts for repeated chores) and the shared rules in AGENTS.md. Run once per repo; re-run to audit.
disable-model-invocation: true
---

# Setup agent workspace

Map the repo so every later session starts with the context a developer on the team already has. Re-running is an audit: keep what's right, fix what drifted, add what's missing. Never wipe.

**Writes only:** `.agents/` (including a copy of [WORKFLOW.md](WORKFLOW.md)), the rom-skills block in `AGENTS.md`, one line in `CLAUDE.md`, one line in `.gitignore`. Never app code.

## 1. Scaffold

- Work at the repo root (`git rev-parse --show-toplevel`), even if you were started in a subfolder. A monorepo gets one `.agents/` for all its areas, never one per subfolder.
- Create `.agents/features/`, `.agents/scripts/` and `.agents/local/` if missing, even while they're still empty. The user will put files in `.agents/local/` themselves.
- Add `.agents/local/` to `.gitignore` if it isn't there.
- Create `.agents/PROJECT-RULES.md` if it's missing, with the heading `# Project rules` and the line `Project-specific rules live here.` It belongs to the project: never overwrite it.
- Read `.agents/PROJECT-RULES.md` and the rules the repo already has for agents (`AGENTS.md` and `CLAUDE.md` outside the block, `.github/copilot-instructions.md`, `.cursor/rules/`…). The project's rules win over the block. Note any conflict they don't settle, for step 5. Never edit them without asking.
- Put the contents of [AGENTS-BLOCK.md](AGENTS-BLOCK.md) in `AGENTS.md`, creating the file if needed:
  - **No block yet:** append it.
  - **Block exists, different contents:** replace it, markers included. Older blocks have a version in the start marker (`<!-- rom-skills:start v0.2.3 -->`); replace those too, never add a second block.
- Copy [WORKFLOW.md](WORKFLOW.md) to `.agents/WORKFLOW.md` if it's missing or different. It belongs to rom-skills; if the user edited it, show the changes that would be lost and ask first.
- Make sure `CLAUDE.md` contains the line `@AGENTS.md`, creating the file with just that line if needed. Claude Code reads `CLAUDE.md`, and other agents read `AGENTS.md`.
- Read the block and `.agents/WORKFLOW.md`, and follow their rules together with `.agents/PROJECT-RULES.md` from here on.

## 2. Survey

Read the README, the manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `Makefile`, `docker-compose.yml`…), workspace and task-runner config (`pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `.moon/`, `pixi.toml`, Bazel, CMake…), CI config, the folder tree, entry points, routes and existing tests. In a big repo, give each top-level area to a sub-agent if your tool has them.

Find out:
- **Areas:** the main parts of the repo and their type (web, API, CLI, library, worker or pipeline, mobile or desktop app, firmware, shared contract such as protobuf or OpenAPI), and which areas use which.
- **How to run:** install, start, test (unit and e2e, plus the e2e framework if any, or `no tests`), seed data, code generation. Per area, plus repo-wide commands from the task runner if there is one.
- **Features:** things a user can do or see (log in, check out, export). The user can be a person, a developer using a library, or another system calling a service. A feature can span areas (a web page, the API behind it, the device it talks to). Shared code like the database, logging or message definitions is an area, not a feature. Aim for 5–20 per app.
- **Decisions:** only ones you find evidence for (README, comments, config). Never invent one.
- **Existing docs** (README, CONTRIBUTING, `docs/`): link to them from the repo map instead of copying what they already say.

**New or nearly empty repo:** ask the user what the project is and which areas and tools they plan. Write the repo map from that (mark areas without code yet as `planned`), start the glossary from their words, and skip feature files and scripts. `feature`, `implement` and `verify` add them as features appear.

## 3. Write the docs

Follow "Keeping it true" in AGENTS.md: only write what the code can't say.

`.agents/features/README.md`:
```md
# Repo map
## Areas
- Web app (web): `apps/web/`, Next.js
- Database (shared): `packages/db/`, Prisma. Used by: web
## Features
- [Order export](order-export.md): download orders as CSV
## How to run
- Repo-wide: install … / affected tests … / codegen …
- Web: start … / unit tests … / E2E: … (framework) / seed …
## Decisions
- Postgres, not Mongo: reporting needs joins
```

`.agents/features/<feature>.md`, using the four sections in `.agents/WORKFLOW.md`. Fill `What` and `Code`. Set `Verify` to `TODO: filled on first verify`, unless step 4 gives it a script you've run. Fill `Decisions` with the ones you found, or leave it empty.
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

## 4. Repeated chores

Work out which chores later sessions will repeat: starting what has to be running and waiting until it's healthy, logging in if there's auth, resetting data if there's a database.

- **One command already does it** (a build-system task, a package script): write it in `How to run`. No script.
- **It takes several steps** (start the API and the web app and wait for both, a browser login that saves the session): write a script.
- **Several areas:** put each area's scripts in `.agents/scripts/<area>/`. Add a top-level start script only if features need several areas running together and the build system can't start them as one task.
- **Firmware:** starting means the simulator if there is one. Flashing a device needs approval each time.

1. **Ask only what you can't find:** which test account to use, whether there's a test-mode bypass for 2FA, and so on. Put the values in `.agents/local/.env` and the variable names in `.agents/scripts/.env.example`.
2. **Write each script** following "Verification scripts" in `.agents/WORKFLOW.md`, using the repo's own language and tools. If a browser driver like Playwright isn't installed yet, ask before adding it.
3. **Login that needs a person** (OAuth, 2FA, captcha): the script opens a visible browser, the user logs in once, and it saves the session to `.agents/local/auth/`. Later runs reuse that session.
4. **Run each script and command once.** One that has never run doesn't count. Resetting data touches the database, so ask first.

## 5. Confirm with the user

Show a short summary: areas, the feature list, commands and scripts, and what you couldn't find. Then ask about anything open in a single round, each question with your recommended answer, worded so "yes" accepts it. For each rule conflict, ask which rule wins and write the answer in `.agents/PROJECT-RULES.md`. Other typical questions are about feature boundaries ("Are Orders and Order export one feature or two?") and unclear words ("Is a 'workspace' the same as a 'team'?"). Apply the answers.

## Re-running (audit)

If the user only wants the rules updated, do step 1 and stop.

- Fix `Code` paths that moved and features whose code is gone. Ask before deleting a feature file.
- Add new features and areas. Update `How to run` if commands changed.
- Run the scripts and `How to run` commands that don't touch the database, and report any that broke.
- End with a short list of what changed.
