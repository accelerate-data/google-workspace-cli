# Vendor Google Workspace Skills Design

## Goal

Package the skills from `googleworkspace/cli/skills` as a normal Claude and Codex plugin source without vendoring the full upstream repository into this repo.

This repository remains the installable plugin boundary. The upstream Google Workspace CLI repository remains the source of truth for the skill bodies.

## Current State

The repository is a wrapper plugin source with:

- `.claude-plugin/plugin.json`
- `.codex-plugin/plugin.json`
- `skills/` copied from upstream `googleworkspace/cli/skills`
- `AGENTS.md`
- `CLAUDE.md`
- `repo-map.json`
- `.github/workflows/sync-upstream-skills.yml`

The repository should stay focused on packaging, sync, and plugin metadata. Model-based skill evaluation is out of scope for this package.

## Chosen Approach

Use this repository as a wrapper plugin source and add a sync workflow that sparse-checks out only the upstream `skills/` directory from `https://github.com/googleworkspace/cli`.

The workflow copies only upstream skill content into this repo:

1. Create a temporary sparse clone of `googleworkspace/cli`.
2. Configure sparse checkout for `skills`.
3. Replace local `skills/` with the upstream `skills/`.
4. Validate plugin manifests and confirm at least one `SKILL.md` exists.
5. Open a pull request containing only the skill sync delta.

Marketplace entries then point to this wrapper repo as a whole-repo plugin source.

## Why Not Point Directly At Upstream

Claude and Codex plugin installs expect the selected plugin root to contain the plugin manifests and the skill directory layout. The upstream Google Workspace CLI repo is a CLI repo that happens to include skills; it is not controlled as this plugin-source wrapper.

A marketplace entry for this wrapper repo keeps the install boundary stable while allowing upstream skills to be refreshed with a narrow sync operation.

## Alternatives Considered

### Manual Copy

Manually copying `skills/` from upstream is simple, but it is easy to miss changes and hard to audit. It also encourages one-off updates instead of a repeatable process.

### Git Submodule

A submodule avoids copying files, but it brings the full upstream repository relationship into plugin installs and adds operational friction for users and agents. It also does not make the plugin root contain only the desired skill content.

### Marketplace Sparse Install

A marketplace-level sparse install would avoid copying files into this repo, but it depends on plugin tooling supporting a stable subpath install contract and still requires manifests at the install root. This is not the preferred package boundary for this repo.

## Repository Changes

The implementation should make these repository changes:

- Rename manifest metadata from placeholder values to Google Workspace skill package values.
- Keep `skills/` synced from upstream Google Workspace skill content.
- Add `.github/workflows/sync-upstream-skills.yml`.
- Update `README.md`, `AGENTS.md`, `CLAUDE.md`, and `repo-map.json` to describe the wrapper plugin boundary and sync workflow.
- Keep model-evaluation instructions out of user-facing setup guidance unless a future change explicitly reintroduces that ownership.

## Sync Workflow

The sync workflow must run both on `workflow_dispatch` and on a weekly GitHub Actions schedule. It should not commit directly to `main`; it should open a pull request so upstream skill changes can be reviewed.

The core sync command is:

```bash
tmpdir="$(mktemp -d)"

git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/googleworkspace/cli.git \
  "$tmpdir/googleworkspace-cli"

cd "$tmpdir/googleworkspace-cli"
git sparse-checkout set skills

cd "$GITHUB_WORKSPACE"
rm -rf skills
cp -R "$tmpdir/googleworkspace-cli/skills" ./skills
```

The workflow should validate only packaging shape:

```bash
python3 -m json.tool .claude-plugin/plugin.json >/dev/null
python3 -m json.tool .codex-plugin/plugin.json >/dev/null
test -d skills
find skills -name SKILL.md -type f | grep -q .
```

No model-evaluation suite should be run or required by this sync workflow.

The weekly schedule should be encoded in the workflow itself:

```yaml
on:
  workflow_dispatch:
  schedule:
    - cron: "0 3 * * 1"
```

## Manifest Shape

Both manifests should describe the wrapper package, not the upstream CLI project itself.

The plugin name should be stable and package-oriented, for example `google-workspace-cli`. The descriptions should make clear that this package exposes Google Workspace CLI skills for Claude and Codex.

The repository URL should point to this wrapper repo. The skill path remains `./skills` or `./skills/` according to each manifest's existing convention.

## Documentation Shape

`README.md` should explain:

- This repo vendors only Google Workspace CLI skills, not the full CLI repository.
- Skills are refreshed from upstream by sparse checkout.
- Users still need the `gws` CLI installed and authenticated to use most skills.
- Marketplaces should point to this wrapper repo as the plugin source.

`AGENTS.md` and `repo-map.json` should identify this repo as a wrapper plugin source. They should not preserve placeholder package references.

## Validation

Validation for this change is packaging-only:

- JSON parse both manifests.
- Confirm `skills/` exists.
- Confirm at least one `SKILL.md` exists under `skills/`.
- Confirm docs no longer describe a placeholder skill as the shipped skill.

Model-based skill evaluation is intentionally out of scope.

## Risks

Upstream skill changes may introduce assumptions that fit the Google Workspace CLI repo but not a plugin-source wrapper. The pull-request sync workflow keeps those changes reviewable before they land.

Upstream may change the `skills/` structure. The validation step catches the highest-risk breakage by requiring `SKILL.md` files after sync.
