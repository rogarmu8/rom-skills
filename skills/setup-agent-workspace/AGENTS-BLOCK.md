<!-- rom-skills:start v0.1.0 -->
## Agent workspace (`.agents/`)

`.agents/` holds what a developer on this team knows that the code doesn't say. The code is the source of truth.

- `.agents/features/README.md`: start here. Repo map, how to run and test, repo-wide decisions.
- `.agents/features/<feature>.md`: one file per feature a user can do or see.
- `.agents/GLOSSARY.md`: what the domain words mean. Use these words in code and conversation.
- `.agents/scripts/`: rerunnable checks (start, login, reset, feature flows). Prefer them over manual steps.
- `.agents/local/`: gitignored. `specs/` (each spec is also its progress tracker), `auth/`, `evidence/`, `.env`.
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

### Safety
Ask first, showing the exact command, before:
- Any direct database access, reads included (`psql`, `sqlite3`, `redis-cli`, migrations, seeds, ORM scripts), and any script marked `touches: db`.
- Anything that can't be undone:
  - throwing away uncommitted work (`git reset --hard`, `git clean`, `git checkout -- <file>`, `git stash drop`)
  - deleting or overwriting untracked or gitignored files you didn't create (`.env`, local config, data)
  - force-pushing or deleting remote branches
  - stopping or restarting a process you didn't start, since it may hold work or in-memory data
  - effects outside the repo: deploys, emails or messages, payments, writes to remote or production services
  - scripts marked `touches: irreversible`

One approval covers one action. No need to ask for:
- using the app through its interface the way a user would
- editing tracked files (git can recover them)
- deleting files you created, or anything in `.agents/local/`

### Commits
Never commit, push or open a PR unless the user asks.

### Writing code
- Better, not faster. Put the change in the right place and fix the cause, not the symptom.
- Remove before adding. Reuse, extend or delete existing code before writing new code. Delete what your change makes obsolete.
- Change only what's needed. No drive-by refactors, renames or reformatting. If you notice a problem nearby, mention it instead of fixing it.
- Follow the patterns already in the code. Ask before adding a dependency.
- Simple over clever. No abstractions, options or future-proofing nobody asked for. Comments explain why, never what.
- If the clean fix needs a bigger refactor, ask before doing it.

### Writing tests
- The bar: would this test fail if someone broke the code in a realistic way? If not, don't write it.
- Test logic and edge cases through public interfaces: empty, zero, one, the maximum, invalid input, missing data, errors, permissions, the bug being fixed.
- Don't test:
  - trivial code or static markup
  - what the framework, a library or the type checker already guarantees
  - only that a mock was called
- Take expected values from the spec or a worked example, never recompute them the way the code does.
- Write a few focused tests per behavior. Name them after the behavior: "rejects export when the user has no orders".

### Verification scripts (`.agents/scripts/`)
- Drive the real interface the way its users do: a browser through the frontend for web, HTTP calls like a client for APIs, the real command for CLIs, a small example program for libraries.
- Use the repo's own tools. If a browser driver is needed and there isn't one, ask to add a standard one (Playwright) as a dev dependency. Never write your own driver.
- Exit 0 on pass, non-zero on fail.
- Save evidence to the `--out <dir>` you're given, defaulting to `.agents/local/evidence/<script>/`. Evidence means screenshots, responses, and console, network and server logs.
- Start with a header comment: what it checks, `needs:` (what must be running), `touches:` (`none`, `db` or `irreversible`).
- Read credentials from `.agents/local/.env`, and list the variable names in `.agents/scripts/.env.example`. Use test accounts only, and never hardcode secrets.
- Shortcuts are fine for setup, never for the thing being checked.
- When you're done, stop the servers and processes you started, unless the user wants them left running.

### Style
Be concise and use plain words. If you need a technical term, explain it in a few words the first time. No filler.
<!-- rom-skills:end -->
