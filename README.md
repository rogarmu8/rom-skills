# rom-skills

Small agent skills for software development. They give your agent the context a developer on the team already has, then help it spec, build and **prove** changes, using the app the way a real user would.

They work in **Claude Code, Codex, Pi and VS Code / Copilot**. Only you can run them, so your agent never starts one on its own.

## The skills

| Skill | Use it to |
|---|---|
| `setup-agent-workspace` | Map a repo once: a feature map, a glossary, start/login/reset scripts and shared rules. Run it again any time to audit. |
| `feature` | Get interviewed about a new feature until it's clear, then get a spec. Writes no code. |
| `implement` | Build a spec test-first, one acceptance criterion at a time. |
| `patch` | Make a small change or fix a bug end to end: reproduce it, propose a fix, build it and check it. |
| `explain` | Get a diff explained block by block, in plain words. Read-only. |
| `verify` | Prove a spec works: real browser, HTTP, CLI or test runs, plus logs, with a verdict per criterion. Fixes what fails. |

```
setup-agent-workspace (once)
        │
        ├─ feature → implement → explain → verify      new features
        └─ patch   → (verify)                          small changes and bugs
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

## Use

In each repo, run `setup-agent-workspace` first. The other skills check for it and will ask you to run it.

| Agent | How to run a skill |
|---|---|
| Claude Code | `/setup-agent-workspace` (as a plugin, `/rom-skills:setup-agent-workspace` also works if a name clashes) |
| Pi | `/skill:setup-agent-workspace` |
| VS Code / Copilot | `/setup-agent-workspace` |
| Codex | `$setup-agent-workspace`, or pick it from `/skills` |

Pass the rest as arguments: `/feature let users export orders as CSV`, `/implement order-export`, `/patch the export button ignores the date filter`, `/verify order-export`, `/verify --all`.

## What it adds to your repo

```
AGENTS.md                 # shared rules for every agent (a marked block; the rest of the file is yours)
CLAUDE.md                 # contains "@AGENTS.md" so Claude Code reads the same rules
.agents/
├── skills/               # the skills themselves, if installed in the project
├── GLOSSARY.md           # what your domain words mean
├── features/
│   ├── README.md         # repo map, how to run and test, repo-wide decisions
│   └── <feature>.md      # why it exists, where the code starts, how to verify it, decisions
├── scripts/              # rerunnable checks: start, login, reset, feature flows
└── local/                # gitignored: specs (also progress trackers), auth sessions, evidence, .env
```

**The code stays the source of truth.** `.agents/` only holds what the code can't tell you: why, where to start, how to run and test, gotchas, and what words mean. When the docs and the code disagree, the agent fixes the docs.

## The rules your agent follows

`setup-agent-workspace` writes these into `AGENTS.md`, so they apply in every session, even without a skill:

- **Safety:** it asks before any direct database access, and before anything that can't be undone (throwing away uncommitted work, deleting files it didn't create, force-pushing, deploys, real emails or payments). Editing tracked files is fine, because git can bring them back.
- **No commits** unless you ask.
- **Better code, not faster:** fix the cause, remove before adding, change only what's needed, follow existing patterns, no new dependencies without asking.
- **Fewer, better tests:** test logic and edge cases, never trivial code. Each test must fail if the code broke in a realistic way.
- **Real proof:** passing tests and a clean compile don't prove something a user sees. `verify` uses the app through its real interface and checks the browser console, the network and the server logs.

## Credits

Built on ideas from [Matt Pocock's skills](https://github.com/mattpocock/skills) (grilling, the domain glossary, test-first implementation) and [poteto](https://github.com/poteto) (verification with evidence, feature maps, scripting repeated checks).
