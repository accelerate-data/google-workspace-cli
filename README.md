# Google Workspace CLI Skills

This repository is a plugin-source wrapper for Google Workspace CLI skills used by Claude Code and Codex.

It vendors only upstream `skills/` content from [`googleworkspace/cli`](https://github.com/googleworkspace/cli). It does not vendor the full `googleworkspace/cli` repository, command implementation, release assets, or source tree.

Claude and Codex marketplaces can use this repository as a whole-repo plugin source. The root manifests are:

- `.claude-plugin/plugin.json`
- `.codex-plugin/plugin.json`

## Runtime Requirement

The packaged skills invoke Google Workspace CLI workflows. For live Google Workspace operations, users must install `gws` and authenticate it in their own environment before using these skills.

## Skill Refreshes

Upstream skill refreshes are handled by `.github/workflows/sync-upstream-skills.yml`.

The workflow performs a temporary sparse checkout of `googleworkspace/cli`, copies only `skills/` into this repository, validates the plugin shape, and opens a pull request with the refreshed skill content.

## Local Use

For direct local use without a marketplace, symlink individual skill directories from this repository into the matching agent skill directory:

```bash
mkdir -p ~/.claude/skills ~/.codex/skills

ln -s /absolute/path/to/google-workspace-cli/skills/<skill-name> \
  ~/.claude/skills/<skill-name>

ln -s /absolute/path/to/google-workspace-cli/skills/<skill-name> \
  ~/.codex/skills/<skill-name>
```

Keep the symlink name identical to the skill directory name.

## Validation

```bash
python3 -m json.tool .claude-plugin/plugin.json >/dev/null
python3 -m json.tool .codex-plugin/plugin.json >/dev/null
find skills -name SKILL.md -type f | grep -q .
```

## Maintenance Notes

- Keep upstream skill content under `skills/`.
- Keep packaging metadata in the root Claude and Codex manifests.
- Update `repo-map.json` when manifests, the sync workflow, docs, or the skill layout change.
- Use `.github/workflows/sync-upstream-skills.yml` for upstream refreshes instead of manually copying unrelated upstream files.
