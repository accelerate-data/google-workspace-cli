# Google Workspace CLI Skills Wrapper

This repository is a plugin-source wrapper for Google Workspace CLI skills used by Claude Code and Codex.

**Maintenance rule:** This file contains durable repository guidance, not volatile inventory. If a fact is easy to rediscover from the tree or will go stale when files move, keep it in `repo-map.json` instead.

## Instruction Hierarchy

Use this precedence when maintaining agent guidance:

1. `AGENTS.md` - canonical, cross-agent source of truth
2. Skill-local references under `skills/<skill>/references/`
3. `CLAUDE.md` - Claude-specific adapter and routing

For Codex, `AGENTS.md` is also the repo-local instruction surface. Do not add a separate Codex adapter file unless Codex introduces a real supported convention for one.

Adapter files must stay lightweight and should not duplicate canonical policy unless they add agent-specific behavior.

## Repository Purpose

This repository is a single plugin-source wrapper, not a marketplace repo and not a full vendor copy of `googleworkspace/cli`.

- Upstream skill content comes from `googleworkspace/cli/skills`.
- This repo vendors only upstream `skills/`.
- This repo owns packaging metadata, root plugin manifests, repository docs, and the upstream sync workflow.
- Root manifests: `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`.
- Sync workflow: `.github/workflows/sync-upstream-skills.yml`, which runs weekly via GitHub Actions and also supports manual `workflow_dispatch` runs.
- Packaging CI: `.github/workflows/version-bump-check.yml` enforces a `.claude-plugin/plugin.json` version bump on pull requests to `main`.

## Agent Startup Context

Read `repo-map.json` before any non-trivial task. It is the primary index for structure, commands, sync workflow, docs, and current validation commands.

## Maintenance Rules

| Artifact | Update when |
|---|---|
| `AGENTS.md` | A fact is durable, cross-cutting, and not obvious from the code tree |
| `repo-map.json` | Manifests, sync workflow, docs, validation commands, or skill layout change |
| `CLAUDE.md` | Claude-specific routing or adapter behavior changes |

Update stale guidance in the same change that introduces the structural change.

## Validation

For packaging-only or sync-only changes, validate the repository shape:

```bash
python3 -m json.tool .claude-plugin/plugin.json >/dev/null
python3 -m json.tool .codex-plugin/plugin.json >/dev/null
find skills -name SKILL.md -type f | grep -q .
```

There is no model-evaluation requirement for sync-only or packaging-only changes in this package.

The version-bump workflow is packaging CI, not a model-evaluation gate. Keep `.claude-plugin/plugin.json` version updates aligned with PRs that change packaged content or metadata.

## Skill Ownership

The skill bodies under `skills/` are vendored from `googleworkspace/cli/skills`.

- Do not add references that require files outside this plugin repo.
- Do not copy unrelated upstream `googleworkspace/cli` files into this repository.
- If wrapper-specific support material is needed, keep it outside vendored skill content unless the upstream source should also own it.

## Local Development Pattern

For direct local use without a marketplace, symlink individual skill directories from `skills/<skill-name>` into:

- `~/.claude/skills/<skill-name>`
- `~/.codex/skills/<skill-name>`

Keep the symlink name identical to the skill directory name.

## Git Hooks

This repo provides a repo-managed pre-commit hook in `.githooks/pre-commit`.

- Enable it with `git config core.hooksPath .githooks`.
- Keep it focused on durable repo policy, not machine-local tooling.

## Worktrees

Use sibling worktrees at `../worktrees/<branch-name>` relative to the repo root unless the user explicitly asks to work in the main checkout.

- Preserve the full branch name in the path, including prefixes such as `feature/`.
- After creating the worktree, run `./scripts/setup-worktree.sh ../worktrees/<branch-name>` from the main checkout.
- `scripts/setup-worktree.sh` derives paths relative to the repository and must stay portable across developers and machines.

## Conventions

- Keep vendored skill directories under `skills/`.
- Keep marketplace-specific registration outside this plugin-source repository.
- Keep wrapper docs clear that users must install and authenticate `gws` for live Google Workspace operations.
