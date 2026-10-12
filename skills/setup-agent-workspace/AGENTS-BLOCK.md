<!-- rom-skills:start v0.2.3 -->
## Agent workspace (`.agents/`)

`.agents/` holds what a developer on this team knows that the code doesn't say. There is one, at the repo root (`git rev-parse --show-toplevel`), even when you work in a subfolder.

- `features/README.md`: start here. Repo map, how to run and test, repo-wide decisions.
- `features/<feature>.md`: one per feature a user can do or see (`What`, `Code`, `Verify`, `Decisions`).
- `GLOSSARY.md`: what the domain words mean. Use these words in code and conversation.
- `scripts/`: rerunnable checks and multi-step chores. Prefer them over manual steps.
- `WORKFLOW.md`: rules for specs and scripts, used by the rom-skills skills. Read it before writing a spec or a script.
- `local/`: gitignored. Specs, saved logins, evidence, `.env`.

### Keeping it true
- The code is the source of truth. If a doc disagrees, fix the doc.
- Only write what the code can't tell you: why, where to start, how to run and test, gotchas, what words mean.
- When you change a feature's entry points, behavior or how to test it, update its feature file in the same change.

### Safety
Ask first, showing the exact command, before:
- Any direct database access, reads included (`psql`, `sqlite3`, `redis-cli`, migrations, seeds, ORM scripts), and scripts marked `touches: db`. The project's own test commands from `How to run` don't count.
- Anything that can't be undone: throwing away uncommitted work (`git reset --hard`, `git clean`, `git checkout -- <file>`, `git stash drop`), deleting or overwriting files you didn't create that git can't restore (`.env`, local config, data), force-pushing or deleting remote branches, stopping a process you didn't start, effects outside the repo (deploys, messages, payments, remote or production writes, flashing a device), and scripts marked `touches: irreversible`.

One approval covers one action. No need to ask to use the app as a user would, edit tracked files, or delete files you created.

### Commits
Never commit, push or open a PR unless the user asks. The exception: once the user agrees at the start of a spec (`Commits: yes`), `implement` and `verify` commit, and merge a feature's parts, on its feature branch. Follow the repo's commit message style. Never skip hooks (`--no-verify`); if one fails, fix the cause. Never commit on a shared branch (the default, `main`, `master`, `develop`, release). Never push.

### Writing code
- Better, not faster. Put the change in the right place and fix the cause, not the symptom.
- Remove before adding. Reuse, extend or delete existing code first. Delete what your change makes obsolete.
- Change only what's needed. No drive-by refactors, renames or reformatting; mention problems nearby instead. If the clean fix needs a bigger refactor, ask.
- Follow the patterns already in the code. Ask before adding a dependency, including a test framework.
- Simple over clever. No abstractions, options or future-proofing nobody asked for. Comments explain why, never what.
- Secure by default. Validate input where it enters the system. Never build queries, shell commands or HTML by joining strings with input. Keep secrets out of code and logs, and keep existing auth checks.
- Shared contracts (schemas, API specs, shared packages): regenerate with the repo's command (never edit generated code), update every consumer in the same change, and keep deployed data, clients and devices working unless the spec says how they migrate.
- Stuck? If the same failure survives three attempts, stop, say what you tried, and ask.

### Writing tests
- The bar: would it fail if someone broke the code in a realistic way? If not, don't write it.
- Test behavior and edge cases through public interfaces: empty, zero, one, the maximum, invalid input, missing data, errors, permissions, the bug being fixed.
- Don't test trivial code, what the framework or type checker already guarantees, or only that a mock was called.
- Take expected values from the spec or a worked example, never recompute them the way the code does.
- A few focused tests per behavior, named after it: "rejects export when the user has no orders".

### Before calling it done
- Run what CI runs for every area you changed and every area that depends on it: tests, plus lint, format check, type check and build if the project has them. Use the build tool's way to find affected areas if it has one.
- Never make a check pass by weakening it: don't delete, skip or loosen tests, turn off lint rules, add ignore comments or `any`-style casts, or swallow errors. If the check seems wrong, say why and ask.
- Update the project's own docs (README, user or API docs, its changelog) if the change affects what they describe.
- Stop the servers and processes you started, unless the user wants them running.

### Reporting
Report what actually happened. If a command was blocked or failed, check the real state before saying what's done. Call a blocked command blocked; never present it as the user's decision.

### Style
Be concise and use plain words. Explain a technical term in a few words the first time. No filler.
<!-- rom-skills:end -->
