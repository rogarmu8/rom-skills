# rom-skills

Small agent skills for software development. They give your agent the context a developer on the team already has, then help it spec, build and **prove** changes, using the app the way a real user would.

They work in **Claude Code, Codex, Pi and VS Code / Copilot**. Only you can run them, so your agent never starts one on its own.

## The skills

| Skill | Use it to |
|---|---|
| `setup-agent-workspace` | Map a repo once: a feature map, a glossary, how to run each part, scripts for chores that take more than one command, and shared rules. Run it again any time to audit. |
| `feature` | Get interviewed about a new feature or change (refactors, upgrades and migrations too) until it's clear, then get a spec. Writes no code. |
| `implement` | Build a spec test-first, one acceptance criterion at a time, asking first whether to commit after each criterion (and, on `main`, whether to create a branch). Pass a parent spec to build all its parts, in parallel if your tool has sub-agents. |
| `patch` | Make a small change or fix a bug end to end: reproduce it, propose a fix, build it and check it. |
| `explain` | Get a diff, a feature or an area explained block by block, in plain words. Read-only. |
| `review` | Review someone else's branch or PR with no prior context: does it do what it set out to do, is it correct, does it follow the repo's rules. Read-only. |
| `verify` | Prove a spec works: real browser, HTTP, CLI or test runs, plus logs, with a verdict per criterion. Fixes what fails. |

```
setup-agent-workspace (once)
        │
        ├─ feature → implement → explain → verify      new features
        ├─ patch   → (verify)                          small changes and bugs
        └─ review                                      someone else's branch or PR
```

## Install

### In a project (recommended)

Run this in the repo's root. It installs the skills for Claude Code, Codex, Pi and Copilot at once:

```bash
npx skills@latest add rogarmu8/rom-skills -a claude-code -a codex -a pi -a github-copilot
```

This puts the skills in `.agents/skills/`, which Codex, Pi and Copilot read, links them into `.claude/skills/` for Claude Code, and records the version in `skills-lock.json`. **Commit all three**, and everyone who clones the repo gets the same skills with nothing else to install.

To update: `npx skills@latest update -p`, then commit the changes.

### For yourself, in every repo (plugin)

A plugin installs the skills for your user account and keeps them updated. Pick **one** route per agent: a project install plus a plugin in the same agent gives you every skill twice.

<details>
<summary><strong>Claude Code</strong></summary>

```bash
claude plugin marketplace add rogarmu8/rom-skills
claude plugin install rom-skills@rom-skills
```

Add `--scope project` to both commands to declare the plugin in the repo's `.claude/settings.json` instead, so teammates are offered it.

To update: `claude plugin marketplace update rom-skills`.

</details>

<details>
<summary><strong>Codex</strong></summary>

```bash
codex plugin marketplace add rogarmu8/rom-skills
codex plugin add rom-skills@rom-skills
```

</details>

<details>
<summary><strong>GitHub Copilot</strong> (CLI and VS Code)</summary>

CLI:

```bash
copilot plugin marketplace add rogarmu8/rom-skills
copilot plugin install rom-skills@rom-skills
```

To get updates automatically, add this once to `~/.copilot/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "rom-skills": { "source": { "source": "github", "repo": "rogarmu8/rom-skills" }, "autoUpdate": true }
  }
}
```

VS Code: run **Chat: Install Plugin From Source** and enter `https://github.com/rogarmu8/rom-skills`.

</details>

<details>
<summary><strong>Pi</strong></summary>

```bash
pi install git:github.com/rogarmu8/rom-skills
```

Add `-l` to declare it in the project's `.pi/settings.json` instead.

</details>

## Recommended tools

The skills check things the way a real user would, so they work best when these are available:

| Tool | Needed for | Install |
|---|---|---|
| **Node.js 18+** | the `npx skills` install | [nodejs.org](https://nodejs.org) |
| **git** | diffs, before/after checks | usually already installed |
| **Playwright** | driving a real browser for web apps: login, clicks, screenshots, console and network logs | `npm init playwright@latest` (asks a few questions, then adds Playwright, its browsers, a config and an example test). Python: `pip install playwright && playwright install chromium` |
| **curl** | calling APIs the way a client would | usually already installed |

You don't have to install Playwright up front. `setup-agent-workspace` notices when a web app needs it and asks before adding it as a dev dependency. Without it, `verify` can't use the frontend and will report `INCONCLUSIVE` for anything a user sees.

## Use

In each repo, run `setup-agent-workspace` first. The other skills check for it and will ask you to run it.

| Agent | How to run a skill |
|---|---|
| Claude Code | `/setup-agent-workspace` (as a plugin, `/rom-skills:setup-agent-workspace` also works if a name clashes) |
| Pi | `/skill:setup-agent-workspace` |
| VS Code / Copilot | `/setup-agent-workspace` |
| Codex | `$setup-agent-workspace`, or pick it from `/skills` |

Pass the rest as arguments: `/feature let users export orders as CSV`, `/implement order-export`, `/patch the export button ignores the date filter`, `/verify order-export`, `/verify --all`, `/review feature/csv-export`, `/review 123`, `/review since v2.1`.

## How to use

**Once per repo:** `setup-agent-workspace`. It maps the repo, writes the shared rules into `AGENTS.md` and `.agents/WORKFLOW.md`, and asks you one round of questions. Run it again any time to bring the docs back in line with the code, or after updating the skills to update the rules.

**A small change or a bug:** `patch <what's wrong or what you want>`. It reproduces the bug, writes a short spec, proposes a fix and waits for your go. Then it writes a failing test, fixes the cause, runs the checks and tries it through the real app. If the work turns out bigger, it sends you to `feature`.

**A new feature, refactor, upgrade or migration:**

1. `feature <idea>`: it interviews you in rounds (each question comes with its recommended answer, so "yes" is often enough) and writes a spec. No code yet.
2. `implement <slug>`: it asks once whether to commit after each criterion. On a feature branch it stays there; on `main`, `master` or `develop` it also offers to create a branch, and never commits there. Then it builds one criterion at a time, test first.
3. `explain <slug>` (optional): what changed, in plain words.
4. `verify <slug>`: it proves each criterion through the real app, checks the logs, fixes what fails, and marks the spec `done`.

**A big feature** (more than about 8 criteria, or too long for one session): `feature` splits it into parts under a parent spec, each part saying which others it waits for. Then `implement <parent>` builds all of them on one branch, several at once if your agent has sub-agents, and `verify <parent>` checks them together, including one or two end-to-end checks.

**Someone else's work:** `review <branch, PR number, or "since <commit or date>">`. It finds where the work started and what it was meant to do, then reports what it found under three headings: does it do what it set out to do, will it break, and does it follow the repo's rules.

**Good to know:**

- Specs live in `.agents/local/specs/`, gitignored and private to you. Each spec's `Log` tracks progress, so you can stop at any time and pick up in a new session with the same command.
- Nothing is ever pushed. `implement` and `verify` commit only if you agreed at the start, only on a feature branch (never `main`, `master` or `develop`), in the repo's commit style and without skipping hooks.
- Your agent asks before touching a database directly, flashing a device, or anything that can't be undone.

## What it adds to your repo

```
AGENTS.md                 # shared rules for every agent (a marked block; the rest of the file is yours)
CLAUDE.md                 # contains "@AGENTS.md" so Claude Code reads the same rules
.agents/
├── skills/               # the skills themselves, if installed in the project
├── GLOSSARY.md           # what your domain words mean
├── WORKFLOW.md           # rules for specs and scripts, read only by the skills (managed by setup)
├── features/
│   ├── README.md         # repo map, how to run and test, repo-wide decisions
│   └── <feature>.md      # why it exists, where the code starts, how to verify it, decisions
├── scripts/              # rerunnable checks and multi-step chores (feature flows, login)
└── local/                # gitignored: specs (also progress trackers), auth sessions, evidence, .env
```

**Monorepos** get one `.agents/` at the root, even when the agent runs in a subproject. Features can span areas (a web page, the backend behind it, the firmware it talks to), the repo map lists how to run each area, tests run only for the areas a change affects, and changes to shared contracts like protobuf get checked on both sides.

**The code stays the source of truth.** `.agents/` only holds what the code can't tell you: why, where to start, how to run and test, gotchas, and what words mean. When the docs and the code disagree, the agent fixes the docs.

## The rules your agent follows

The rules are built around one idea: **an agent saying it's done proves nothing; a check that ran does.** Agents often call work finished because the code looks right or compiles. Here, every claim needs evidence: a test run, a script that used the app, a log, a screenshot. Without it, the claim stays open.

`setup-agent-workspace` writes the rules for all work into `AGENTS.md`, so they apply in every session, even without a skill. The rules only the skills need (specs, feature files, verification scripts) go in `.agents/WORKFLOW.md`.

**Verification first**

- **Proof, not reading:** a criterion is ticked only when a test or check that ran passes for it. Reading the code never counts.
- **Through the real interface:** something a user sees is checked the way they use it, in a real browser, over HTTP or with the real command, along with the browser console, network and server logs. Passing tests and a clean compile aren't enough.
- **Before and after:** a bug fix is shown failing before the change and passing after it. A failing test comes first, then the fix.
- **Only new failures count:** checks that already failed before the work started are noted at the start, so the agent neither hides them nor blames itself for them.
- **No cheating:** it never makes a check pass by deleting, skipping or loosening tests, turning off lint rules or swallowing errors. If a check seems wrong, it says why and asks.
- **Honest reports:** it reports what actually happened. A blocked or failed command is called blocked or failed, and `verify` answers `VERIFIED`, `NOT VERIFIED` or `INCONCLUSIVE` per criterion, with evidence saved to `.agents/local/evidence/`.

**Everything else**

- **Done means CI would pass:** lint, format, types, build and the tests for every affected area, plus the project's own docs updated.
- **Better code, not faster:** fix the cause, remove before adding, change only what's needed, follow existing patterns, keep it simple and secure, no new dependencies without asking. After three failed attempts at the same thing, it stops and asks.
- **Fewer, better tests:** test behavior and edge cases through public interfaces, never trivial code. Each test must fail if the code broke in a realistic way.
- **No commits** unless you ask, and never a push. The exception is `implement`, which asks once at the start whether to commit after each criterion. On a feature branch it stays there; on `main`, `master` or `develop` it also offers to create a branch, and never commits there. `verify` commits its fixes the same way. Merging and opening the PR stay yours.
- **Safety:** it asks before any direct database access, and before anything that can't be undone (throwing away uncommitted work, deleting files it didn't create, force-pushing, deploys, real emails or payments, flashing a device). Editing tracked files is fine, because git can bring them back.

## Credits

Built on ideas from [Matt Pocock's skills](https://github.com/mattpocock/skills) (grilling, the domain glossary, test-first implementation, tickets as a task graph, two-axis code review) and [poteto](https://github.com/poteto) (verification with evidence, feature maps, scripting repeated checks).
