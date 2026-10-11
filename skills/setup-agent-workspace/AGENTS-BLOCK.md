<!-- rom-skills:start v0.2.1 -->
## Agent workspace (`.agents/`)

`.agents/` holds what a developer on this team knows that the code doesn't say. The code is the source of truth. There is one, at the repo root (`git rev-parse --show-toplevel`), even when you're working in a subfolder of a monorepo.

- `.agents/features/README.md`: start here. Repo map, how to run and test, repo-wide decisions.
- `.agents/features/<feature>.md`: one file per feature a user can do or see.
- `.agents/GLOSSARY.md`: what the domain words mean. Use these words in code and conversation.
- `.agents/scripts/`: rerunnable checks and chores that take more than one command (feature flows, a browser login, starting several services), in a subfolder per area when there are several. Prefer them over manual steps.
- `.agents/local/`: gitignored. `specs/` (each spec is also its progress tracker; finished ones in `specs/done/`), `auth/`, `evidence/`, `.env`.
- `.agents/skills/`: installed agent skills, managed by their installer. Not project knowledge, so don't edit them.

### Keeping it true
- If a doc and the code disagree, the code wins. Fix the doc.
- Only write what the code can't tell you: why, where to start, how to run and test, gotchas, what words mean. If reading the code answers it quickly, don't write it.
- When you change a feature's entry points, behavior or how to test it, update its feature file in the same change.
- A feature file has four sections and fits on one screen:
  - `What`: what users get and why they want it, in 1–3 sentences. Leave rules and edge cases to the code.
  - `Code`: where to start reading (a file or two) and the folders involved, plus related features. No lists of functions or routes.
  - `Verify`: which scripts or tests prove it, and gotchas.
  - `Decisions`: `choice: reason`, only for choices that are hard to undo or would surprise someone.

### Specs (`.agents/local/specs/`)
- Look for a slug in `specs/`, then in `specs/done/`.
- **A spec's changes.** The skill that first changes code for a spec records where the work starts, under `Status`:
  - **On its own branch:** `Branch: <branch>` and `Base: <branch it was created from>`. The changes are `git diff <base>...<branch>`, plus anything uncommitted while it's checked out.
  - **Otherwise:** `Base: <commit>` (`git rev-parse HEAD`). The changes are everything since then, committed or not (`git diff <base>`). If there are already uncommitted changes when you set it (another spec's work, for example), list those files in the `Log` as not part of this spec, and leave them out of its changes.
- **Parts built at the same time** (each in its own worktree) don't edit feature files, `GLOSSARY.md` or the repo map, since those would conflict when merged. List the changes under `Docs to update:` in the part's `Log`; whoever merges the parts applies them.
- Tick a criterion only when a test or check you ran passes for it. Something a user sees needs a check through the real interface. Reading the code never counts: leave it unticked, with a `Log` line saying why.
- When a spec reaches `Status: done`, move it to `specs/done/`.

### Safety
Ask first, showing the exact command, before:
- Any direct database access, reads included (`psql`, `sqlite3`, `redis-cli`, migrations, seeds, ORM scripts), and any script marked `touches: db`. The project's own test commands from `How to run` don't count, even if they use a test database.
- Anything that can't be undone:
  - throwing away uncommitted work (`git reset --hard`, `git clean`, `git checkout -- <file>`, `git stash drop`)
  - deleting or overwriting untracked or gitignored files you didn't create (`.env`, local config, data)
  - force-pushing or deleting remote branches
  - stopping or restarting a process you didn't start, since it may hold work or in-memory data
  - effects outside the repo: deploys, emails or messages, payments, writes to remote or production services, flashing or configuring a physical device
  - scripts marked `touches: irreversible`

One approval covers one action. No need to ask for:
- using the app through its interface the way a user would
- editing tracked files (git can recover them)
- deleting files you created, or anything in `.agents/local/`

### Commits
Never commit, push or open a PR unless the user asks. When the user agrees to `implement` working on a branch, that covers committing to that branch (and its parts' branches) and merging parts into it, for that spec only. Never push.

### Writing code
- Better, not faster. Put the change in the right place and fix the cause, not the symptom.
- Remove before adding. Reuse, extend or delete existing code before writing new code. Delete what your change makes obsolete.
- Change only what's needed. No drive-by refactors, renames or reformatting. If you notice a problem nearby, mention it instead of fixing it.
- Follow the patterns already in the code. Ask before adding a dependency.
- Simple over clever. No abstractions, options or future-proofing nobody asked for. Comments explain why, never what.
- If the clean fix needs a bigger refactor, ask before doing it.
- Secure by default. Validate input where it enters the system. Never build queries, shell commands or HTML by joining strings with input. Keep secrets out of code and logs, and keep the auth and permission checks that are there.
- Stuck? If the same failure survives three attempts, stop: say what you tried and what you think is wrong, and ask.
- Shared contracts (schemas, API specs, shared packages) have consumers elsewhere. When you change one, regenerate code with the repo's own command (never edit generated code by hand), update every consumer in the same change, and keep what's already deployed working (data, clients, devices) unless the spec says how it migrates.

### Writing tests
- The bar: would this test fail if someone broke the code in a realistic way? If not, don't write it.
- Test logic and edge cases through public interfaces: empty, zero, one, the maximum, invalid input, missing data, errors, permissions, the bug being fixed.
- Don't test:
  - trivial code or static markup
  - what the framework, a library or the type checker already guarantees
  - only that a mock was called
- Take expected values from the spec or a worked example, never recompute them the way the code does.
- Write a few focused tests per behavior. Name them after the behavior: "rejects export when the user has no orders".
- If an area has no test setup, ask before adding one (it's a new dependency). Until it has one, prove behavior there with a verification script.

### Before calling it done
- Run what CI runs, for every area you changed and every area that depends on it: tests, plus the linter, format check, type checker and build if the project has them. Use the build tool's own way to find affected areas if it has one. Run the whole repo only when asked.
- When working from a spec, run these checks once before you change any code too, and note in the spec's `Log` what already fails. Only failures your change caused block you. Mention the old ones in one line; don't fix them unless asked.
- Never make a check pass by weakening it: don't delete, skip or loosen tests, turn off lint rules, add ignore comments or `any`-style casts, or catch and ignore errors. If you think the check itself is wrong, say why and ask.
- If the change affects something the project's own docs describe (README, user or API docs, a changelog it keeps), update them in the same change.

### Verification scripts (`.agents/scripts/`)
- Only write a script for something that will be repeated and isn't already a single command (a build-system task, a package script, a make target). If it is, put that command in `How to run` instead of wrapping it.
- Drive the real interface the way its users do: a browser for web, HTTP calls for APIs, the real command for CLIs, or whatever its users actually use.
- Use the repo's own tools and task runner, in the language of the area being checked. If a browser driver is needed and there isn't one, ask to add Playwright as a dev dependency (`@playwright/test` in Node projects), in the web area or the repo's e2e package, not in every package. Keep to one driver package, the one the project already has if any. Never write your own driver.
- Exit 0 on pass, non-zero on fail.
- Save evidence to the `--out <dir>` you're given, defaulting to `.agents/local/evidence/<script>/`. Evidence means screenshots, responses, output files, and whatever logs the interface has.
- Start with a header comment: what it checks, `needs:` (what must be running), `touches:` (`none`, `db` or `irreversible`).
- Read credentials from `.agents/local/.env`, and list the variable names in `.agents/scripts/.env.example`. Use test accounts only, and never hardcode secrets.
- Shortcuts are fine for setup, never for the thing being checked.
- When you're done, stop the servers and processes you started, unless the user wants them left running.

### Reporting
Report what actually happened, not what you meant to do. If a command was blocked or failed, check the real state (files, packages, processes) before saying what's done. Call a blocked command blocked; never present it as the user's decision.

### Style
Be concise and use plain words. If you need a technical term, explain it in a few words the first time. No filler.
<!-- rom-skills:end -->
