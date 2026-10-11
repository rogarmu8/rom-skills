# rom-skills

Agent skills for software development that work in Claude Code, Codex, Pi and VS Code Copilot. Kept deliberately small.

## Layout

- `skills/<name>/SKILL.md`: the skill. `agents/openai.yaml` next to it keeps Codex from running it on its own.
- `skills/setup-agent-workspace/AGENTS-BLOCK.md`: the rules for all work, which `setup-agent-workspace` copies into each project's `AGENTS.md`. Every agent reads it in every session, so keep it short.
- `skills/setup-agent-workspace/WORKFLOW.md`: the rules only the skills need (specs, feature files, verification scripts), copied to `.agents/WORKFLOW.md`. Only the skills read it.
- `.claude-plugin/`: the plugin and marketplace manifests, used by Claude Code, Codex and Copilot.
- `package.json`: the Pi package manifest and the source of truth for the version.
- `scripts/sync-version.mjs`: copies the version everywhere else.

## Rules for skills

- **Only the user runs them.** Every skill has `disable-model-invocation: true` and an `agents/openai.yaml` with `allow_implicit_invocation: false`.
- **Portable.** Don't name tools specific to one agent (`AskUserQuestion`, "the Skill tool"…). Sub-agents are always optional ("if your tool has them"). Skills don't call other skills; they tell the user which one to run next.
- **Shared rules live in one place, once.** If a rule applies in more than one skill, it goes in `WORKFLOW.md`, or in `AGENTS-BLOCK.md` if it also matters outside the skills, and skills point to it. The only thing repeated is the "Before you start" check, because it has to work before the block exists.
- **Each skill states what it may change**, near the top.
- **Short.** Keep each `SKILL.md` under about 120 lines, in one file. Cut something before adding a second file.
- **Plain words.** Same style rule as the block: concise, no jargon, no filler.

## Changing a skill

1. Edit it, then try it on a real repo. Load this folder directly: `claude --plugin-dir <this repo>`, or `pi install -l <this repo>` in a throwaway project.
2. Bump `version` in `package.json` (semver: patch for wording fixes, minor for new behavior, major for anything that breaks existing `.agents/` workspaces).
3. Run `npm run version:sync`. This updates `plugin.json`, the version markers in `AGENTS-BLOCK.md` and `WORKFLOW.md`, and the minimum block version the skills check for (major.minor only), so re-running setup upgrades projects.
4. Add an entry to `CHANGELOG.md`.

## Adding a skill

Add `skills/<name>/SKILL.md` and `agents/openai.yaml`, list it in `.claude-plugin/plugin.json`, and add it to the table in `README.md`.
