# Changelog

## 0.1.2

Fixes from the first run on a real project.

- New "Reporting" rule: check the real state after a blocked or failed command, and never present a blocked command as the user's decision.
- One browser driver package, preferring `@playwright/test` or the one the project already has.
- `feature` checks `.agents/` before asking the user for facts.
- `verify` re-runs regression checks, tests and the build after its own fixes.

## 0.1.1

- `setup-agent-workspace` creates `.agents/local/` even while it's empty, so users can put credentials there.
- README: a "Recommended tools" section (Node, git, Playwright, curl).

## 0.1.0

First version. Six user-run skills: `setup-agent-workspace`, `feature`, `implement`, `patch`, `explain`, `verify`.
