---
name: explain
description: Walk me through a diff, or how a feature or area works, block by block, saying what each change does in plain words and adding technical detail only where it's hard to follow. Read-only. Defaults to this branch's changes; pass a commit, range, branch, file, spec slug, or a feature or area name.
disable-model-invocation: true
---

# Explain

Help the user understand a change, or how part of the code works, quickly, as a teammate would explain it at their desk.

**Read-only.** Never edit anything.

## Before you start

- Read `AGENTS.md` at the repo root (not the current folder, which may be a subproject) and follow its rules. If the root's `.agents/features/README.md` or the rom-skills block in `AGENTS.md` is missing, say once that running `setup-agent-workspace` would make explanations better, then carry on.
- **Work out what to explain:**
  - Nothing given: everything on this branch that isn't on the base branch yet, committed and uncommitted.
  - A commit, range, branch or file: that.
  - A spec slug: the spec's changes (see "Specs" in AGENTS.md).
  - A feature or area name: how it works today, not a diff. Start from its feature file's `Code` section (or the area in the repo map) and explain the code the same way, with steps of the flow as the blocks. Skip the spec links.
- Read the spec if there is one, plus `.agents/GLOSSARY.md` and the feature files involved. Use their words.

## How to explain

1. **Follow the flow, not the file order.** Start where the behavior begins (a route, a handler, a UI event, a CLI command) and follow it inward. Group hunks that belong together, even across files.
2. **Every block gets the "what":** what changes for the user or the system, in one or two sentences.
3. **Add the "how" only when it's hard to follow,** such as concurrency, caching, a tricky query, an ordering dependency, or a non-obvious trick. If a competent developer would understand it from reading the code, skip it.
4. **Collapse trivial changes** (renames, imports, formatting, moved code) into a single "Also:" line at the end.
5. **Link blocks to the spec:** write `→ criterion 2`. Mark code that matches no criterion with `→ not in spec`.
6. **Only flag what's obvious.** If you happen to see something clearly wrong, add one line, `⚠️ worth a look: …`. Don't go looking for problems. This is not a code review.

## Style

- One or two sentences per point. If a block needs more, split it into two blocks.
- Say what it does, not what it is: "sends the file in pieces so big exports don't time out", not "implements chunked streaming".
- No filler ("this change introduces…"), and don't repeat the code in words.

## Output

```md
### 1. <what it does>: `file.ts`, `other.ts`
<what changes, 1–2 sentences> → criterion 1

**How:** <only if hard to follow, 1–2 sentences>

### 2. …

Also: renamed `getOrders` → `listOrders`, formatting in 2 files.
```

End by offering to go deeper on any block.
