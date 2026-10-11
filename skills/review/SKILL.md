---
name: review
description: Review a branch, PR or range someone else wrote, starting with no context. Checks whether it does what it set out to do, whether it's correct, and whether it follows this repo's rules, and reports each separately. Read-only. Pass a branch, a PR number, a commit range, "since <commit or date>", or nothing for the current branch.
disable-model-invocation: true
---

# Review

Review someone else's change the way a careful teammate would, starting from nothing but the code and its history.

**Read-only.** Never edit, commit, push or comment on a PR. The only thing you may create is a temporary worktree outside the repo, if the user wants the checks run.

## Before you start

- Read `AGENTS.md` at the repo root (not the current folder, which may be a subproject) and follow its rules. If the root's `.agents/features/README.md` or the rom-skills block in `AGENTS.md` is missing, say once that running `setup-agent-workspace` would make reviews better, then carry on.

## 1. Pin what to review

Work out the starting point, then the diff (`git diff <start>...<end>`) and the commits (`git log --oneline <start>..<end>`):

- **A branch:** from where it left the base branch to its tip. The base branch is the repo's default (`git symbolic-ref refs/remotes/origin/HEAD`, else `main` or `master`) unless the user names another.
- **A PR number:** use the forge's CLI if there is one (`gh pr view`, `gh pr diff`), including the description and linked issues. If there isn't one, ask for the branch name.
- **A range or a commit:** that.
- **"Since <commit, tag or date>":** from that point to the tip. For a date, use the last commit before it (`git rev-list -1 --before=<date> <branch>`).
- **Nothing:** the current branch against the base branch, plus uncommitted changes.

Fetch first if the branch is only on the remote. Check that the refs resolve and the diff isn't empty before going on. If the branch is far behind the base branch, say so in one line.

## 2. Find what it set out to do

Use every source you find:

1. A spec in `.agents/local/specs/` whose `Branch:` or slug matches.
2. The PR description and linked issues.
3. The commit messages.
4. Nothing found: infer the goal from the diff, and label it `inferred` in the output, so the user can correct it.

## 3. Understand it before judging it

Read the change following the flow, not the file order: start where the behavior begins (a route, a handler, a UI event, a command) and follow it inward. Also read:
- the code around the change: callers of changed functions, other users of a changed contract or shared package
- the feature files and `.agents/GLOSSARY.md` for the areas it touches

## 4. Review on three axes

Keep the axes separate: a change can do exactly what was asked and still break the repo's rules, or follow every rule and do the wrong thing. If your tool has sub-agents, run one per axis in parallel. Give each the diff command, the commit list and only what its axis needs.

**Intent:** does it do what it set out to do?
- What's missing or only half done?
- What's in it that wasn't asked for?
- Does it change behavior the goal doesn't mention?

**Correctness:** will it break?
- Edge cases: empty, zero, one, the maximum, invalid input, missing data, errors, permissions.
- Concurrency and ordering, retries, partial failure.
- Security: input reaching queries, commands or HTML, secrets, missing auth checks.
- Data and contracts: migrations, existing data, older clients or devices, every consumer of a changed contract updated.
- Tests: do they cover the new behavior at public interfaces, and would they fail if the code broke in a realistic way?

**Standards:** does it follow this repo's rules?
- The rules in `AGENTS.md` ("Writing code", "Writing tests"), plus `CONTRIBUTING.md`, coding-standards docs and anything else the repo documents about how to write code. Skip what the linter or formatter already enforces.
- Common problems, always judgement calls. The repo's own rules win where they disagree:
  - names that don't say what something is or does
  - the same logic in more than one place
  - abstractions, options or hooks nobody asked for
  - one logical change spread across many unrelated files
  - a function that mostly works on another module's data
  - the same few values always passed together (a missing type)
  - a string or number standing in for a domain concept
  - a wrapper that only passes calls through

## 5. Every finding needs evidence

- Give each one a level:
  - `blocker`: wrong behavior, data loss, a security hole, or a broken consumer
  - `should fix`: a real problem that won't break anything today
  - `consider`: a judgement call
- Point to `file:line`. For a bug, describe a concrete case: input or state, then the wrong result.
- Suggest the fix in one line.
- If you're not sure, write it as a `question:`, not a finding. Don't pad the list: no findings is a valid result.

## 6. Run the checks (optional)

Offer once: "Run the checks on this branch?" On yes, create a `git worktree` of the branch outside the repo, in the system temp folder. Run the install from `How to run`, then the checks in "Before calling it done" for the areas it touches. Remove the worktree when done. Database and other approvals in AGENTS.md still apply.

## Output

```md
**Goal** (from: spec | PR | commits | inferred): <one or two sentences>
**Reviewed:** `<start>...<end>`, N commits, N files

## Intent
- blocker: `src/export.ts:42` exports cancelled orders, but the PR says they're excluded. Fix: filter on status before writing.
## Correctness
- should fix: `api/orders.py:88` an empty date range returns 500 (`?from=&to=`). Fix: validate and return 400.
## Standards
- consider: `utils/format.ts:10` duplicates `formatMoney` in `lib/money.ts`.

Checks: not run | all pass | <what failed>
Summary: Intent 1 blocker · Correctness 1 should fix · Standards 1 consider
```

Don't merge or re-rank findings across axes. End by offering to explain any part (`explain <branch>`) or go deeper on a finding.
