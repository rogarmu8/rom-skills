# rom-skills

Small AI agent skills for software development. They help agents **understand your repository, plan changes, implement them, and verify they actually work**.

Compatible with **Claude Code, Codex, Pi, and VS Code / GitHub Copilot**.

Skills are explicitly invoked by developers, never automatically.

## Skills

| Skill                   | Purpose                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `setup-agent-workspace` | Map the repository, document features, commands, conventions, and workflows.                  |
| `feature`               | Define requirements through guided questions and produce a spec. No code changes.             |
| `implement`             | Implement a spec test-first, one acceptance criterion at a time.                              |
| `patch`                 | Reproduce, fix, and check small changes or bugs.                                              |
| `explain`               | Explain code, diffs, or features in plain language. Read-only.                                |
| `review`                | Review changes for intent, correctness, and conventions. Read-only.                           |
| `verify`                | Prove specs, bugs, branches, or claims with tests and real-interface evidence. Fix failures.  |

### Workflow

```text
setup-agent-workspace
        │
        ├── feature → implement → verify   New features
        ├── patch → verify                 Bugs / small changes
        ├── explain                        Understand code
        └── review                         Review changes
```

## Installation

### Recommended: install in your project

Run from the repository root (requires Node.js 18+):

```bash
npx skills@latest add rogarmu8/rom-skills -a claude-code -a codex -a pi -a github-copilot
```

Remove any `-a` options you don't need. On Windows or environments without symlink support, add `--copy`.

This installs skills into `.agents/skills/`, links them into `.claude/skills/` for Claude Code, and creates `skills-lock.json`.

**Commit the installed skills and lock file** so your team shares the same version.

Update with:

```bash
npx skills@latest update -p
```

Review and commit the changes.

### Plugin: for yourself, in every repo

A plugin installs the skills for your user account and keeps them updated. Pick **one** route per agent: a project install plus a plugin in the same agent gives you every skill twice.

| Agent          | Install                                                                                                     |
| -------------- | ----------------------------------------------------------------------------------------------------------- |
| Claude Code    | `claude plugin marketplace add rogarmu8/rom-skills` then `claude plugin install rom-skills@rom-skills`       |
| Codex          | `codex plugin marketplace add rogarmu8/rom-skills` then `codex plugin add rom-skills@rom-skills`            |
| Copilot CLI    | `copilot plugin marketplace add rogarmu8/rom-skills` then `copilot plugin install rom-skills@rom-skills`     |
| VS Code        | **Chat: Install Plugin From Source**, then enter `https://github.com/rogarmu8/rom-skills`                    |
| Pi             | `pi install git:github.com/rogarmu8/rom-skills` (add `-l` to declare it in `.pi/settings.json`)             |

- **Claude Code:** add `--scope project` to both commands to offer the plugin to teammates through `.claude/settings.json`. Update with `claude plugin marketplace update rom-skills`.
- **Copilot:** for automatic updates, add this once to `~/.copilot/settings.json`:

  ```json
  {
    "extraKnownMarketplaces": {
      "rom-skills": { "source": { "source": "github", "repo": "rogarmu8/rom-skills" }, "autoUpdate": true }
    }
  }
  ```

### Manual installation

Without Node.js, clone this repository outside your project and copy every `skills/<name>/` directory into:

- `.agents/skills/` — Codex, Pi, Copilot
- `.claude/skills/` — Claude Code

Include all supporting files, commit them, and record the source version. To update, replace the installed directories with the new versions.

## Usage

**Run `setup-agent-workspace` if the workspace files are missing:** `AGENTS.md`, `.agents/WORKFLOW.md` or `.agents/features/README.md`. It maps the codebase, creates shared agent rules, and documents how to run and test the project. It asks one round of questions, each with a recommended answer. When those files exist, use them directly; updating skills does not require setup again. Run it again any time for an audit.

All other skills require those workspace files and stop if any are missing.

Invoke skills using your agent's syntax:

| Agent             | Example                         |
| ----------------- | ------------------------------- |
| Claude Code       | `/feature add CSV export`       |
| Codex             | `$feature add CSV export`       |
| Pi                | `/skill:feature add CSV export` |
| VS Code / Copilot | `/feature add CSV export`       |

As a Claude Code plugin, `/rom-skills:feature` also works if a name clashes.

### Common commands

```text
/feature add CSV export                 # Define a feature
/implement csv-export                   # Implement its spec
/verify csv-export                      # Verify acceptance criteria
/verify "export keeps the date filter"  # Verify a claim
/verify --all                           # Run a full regression sweep
/patch export ignores date filter       # Fix a bug
/explain csv-export                     # Explain the implementation
/review feature/csv-export              # Review a branch
/review 123                             # Review a PR/MR
/review since v2.1                      # Review everything since a tag, commit or date
```

`explain` and `review` ask what to look at when no target is given.

Specs live in `.agents/local/specs/`, gitignored and private to you. Each spec tracks its own progress, so you can stop at any time and resume in a new session with the same command.

### Large features

Features with roughly 8+ acceptance criteria, or too long for one session, can be split into dependent specs under a parent spec.

`implement <parent>` builds the parts one after another, or in parallel worktrees if you enabled commits and the agent supports sub-agents. `verify <parent>` checks all parts together, plus one or two end-to-end checks.

Commits are **disabled by default**. Large features explicitly ask whether to enable them.

## Verification

**A change isn't done because the agent says so. It's done when checks prove it works.**

All skills follow these principles:

- **Test-first:** reproduce bugs and write failing tests before fixing them.
- **Real-world verification:** exercise the actual browser, HTTP API, or CLI, not just unit tests.
- **Evidence-based:** every acceptance criterion requires a passing check. Reading the code never counts.
- **No shortcuts:** never skip tests, suppress errors, or weaken checks to force a pass.
- **Baseline awareness:** distinguish existing failures from newly introduced ones.
- **CI-ready:** lint, format, type checks, builds, and tests for every affected area.
- **Honest results:** report `VERIFIED`, `NOT VERIFIED`, or `INCONCLUSIVE` with evidence.

`verify` chooses evidence for each claim: unit tests for logic, integration or functional tests for boundaries, and real-interface checks for UI, API, CLI, mobile, firmware, or library behavior. It reuses existing tests, including Playwright browser tests, without duplicating them in verification scripts. API-only checks prove API behavior; mocked responses prove handling of those responses, not integration with the real service.

For browser verification, reuse the project's browser driver. When none exists, **Playwright** is recommended (`npm init playwright@latest`); adding it requires approval. Without browser automation, UI verification may remain `INCONCLUSIVE`.

Verification checks environment readiness, isolates state where needed, and cleans up its processes and temporary data while preserving evidence. Evidence follows the repository's convention, defaulting to `.agents/local/evidence/`. Existing specs and feature docs are updated when present.

## Repository structure

```text
AGENTS.md                  # Shared agent rules (a marked block; the rest is yours)
CLAUDE.md                  # References AGENTS.md
.agents/
├── skills/                # Installed skills
├── WORKFLOW.md            # Skill-specific workflow rules (managed by setup)
├── PROJECT-RULES.md       # Your project's rules and overrides
├── GLOSSARY.md            # Domain terminology
├── features/
│   ├── README.md          # Repository map and commands
│   └── <feature>.md       # Feature context and verification
├── scripts/               # Reusable checks and workflows
└── local/                 # Gitignored specs, sessions, evidence
    └── specs/
```

The code remains the source of truth. Repository documentation records context, decisions, and workflows that cannot be inferred directly from code. When the docs and the code disagree, the agent fixes the docs.

Setup creates `.agents/PROJECT-RULES.md` with a simple placeholder. Put your team's own rules and overrides there and commit it with the workspace. Agents read it through `AGENTS.md`, its rules win over the skills' defaults, and setup never overwrites it.

**Monorepos** get one `.agents/` at the root, even when the agent runs in a subproject. Features can span areas, checks run only for the areas a change affects, and changes to shared contracts like protobuf are checked on both sides.

## Safety and permissions

- **No commits by default.** Only what you ask for, and never on `main`, `master`, `develop` or release branches.
- **No pushes.** Developers remain responsible for merging and opening PRs/MRs.
- **No destructive actions without approval.** This includes deployments, direct database access, flashing devices, deleting unrelated files, and other irreversible operations.
- **No unnecessary dependencies.** Ask before adding new ones.
- **Follow existing patterns.** Prefer simple, focused, secure changes that address root causes.
- **Stop after three failed attempts** at the same problem and ask for guidance.

## Maintaining the skills

This repository uses versioned releases and a changelog.

```bash
npm run version:sync
npm run version:check
```

See `AGENTS.md` for contribution and release conventions.

## Credits

Built on ideas from [Matt Pocock's skills](https://github.com/mattpocock/skills) (grilling, the domain glossary, test-first implementation, tickets as a task graph, two-axis code review) and [poteto](https://github.com/poteto) (verification with evidence, feature maps, scripting repeated checks).
