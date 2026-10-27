# rom-skills

Agent skills for software development that work in Claude Code, Codex, Pi and VS Code Copilot. Kept deliberately small.

## Layout

- `skills/<name>/SKILL.md`: the skill. `agents/openai.yaml` next to it keeps Codex from running it on its own.
- `skills/setup-agent-workspace/AGENTS-BLOCK.md`: the rules for all work, which `setup-agent-workspace` copies into each project's `AGENTS.md`. Every agent reads it in every session, so keep it short.
- `skills/setup-agent-workspace/WORKFLOW.md`: the rules only the skills need (specs, feature files, verification scripts), copied to `.agents/WORKFLOW.md`. Only the skills read it.
- `.claude-plugin/`: the plugin and marketplace manifests, used by Claude Code, Codex and Copilot.
- `package.json`: the Pi package manifest and the source of truth for the version.
- `scripts/sync-version.mjs`: copies the version into `plugin.json`.

## Rules for skills

- **Only the user runs them.** Every skill has `disable-model-invocation: true` and an `agents/openai.yaml` with `allow_implicit_invocation: false`.
- **Portable.** Don't name tools specific to one agent (`AskUserQuestion`, "the Skill tool"…). Sub-agents are always optional ("if your tool has them"). Skills don't call other skills; they tell the user which one to run next.
- **Shared rules live in one place, once.** If a rule applies in more than one skill, it goes in `WORKFLOW.md`, or in `AGENTS-BLOCK.md` if it also matters outside the skills, and skills point to it. The only thing repeated is the "Before you start" check, because it has to work before the block exists.
- **Each skill states what it may change**, near the top.
- **Helpers stay inside the skill.** A skill's scripts go directly in `skills/<name>/scripts/`, with no wrappers at the repo root. No test suites for the skills unless asked.
- **No version checks.** Skills ask for setup only when a workspace file is missing, never because the skills were updated. No version numbers in skills or workspace templates.
- **Short.** Keep each `SKILL.md` under about 150 lines, in one file. Cut something before adding a second file.
- **Plain words.** Same style rule as the block: concise, no jargon, no filler.

## Changing a skill

1. Edit it, then try it on a real repo. Load this folder directly: `claude --plugin-dir <this repo>`, or `pi install -l <this repo>` in a throwaway project.
2. Bump `version` in `package.json`, following "Versioning" below (semver: patch for wording fixes, minor for new behavior, major for anything that breaks existing `.agents/` workspaces).
3. Run `npm run version:sync` to copy it into `plugin.json`, then `npm run version:check`.
4. Add the changes to that version's entry in `CHANGELOG.md`.

## Versioning

- **At most one bump per push.** Compare `package.json` with the last pushed version on this branch (`git show origin/<branch>:package.json`). If it's already been bumped, keep that version and add to its changelog entry, even across tasks and sessions. If you can't tell, keep the current version.
- This doesn't allow a commit or push, and a push doesn't need a bump.

## Adding a skill

Add `skills/<name>/SKILL.md` and `agents/openai.yaml`, list it in `.claude-plugin/plugin.json`, and add it to the table in `README.md`.
