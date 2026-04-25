# Vendor Google Workspace Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Work directly on `main`; do not create a worktree for this task.

**Goal:** Maintain a Google Workspace CLI skills wrapper that syncs only `googleworkspace/cli/skills`.

**Architecture:** This repository is the plugin root for Claude and Codex. A GitHub Actions workflow performs a temporary sparse checkout of upstream `skills/`, replaces local `skills/`, validates packaging shape, and opens a pull request.

**Tech Stack:** Markdown, JSON plugin manifests, GitHub Actions, POSIX shell, Git sparse checkout.

---

## File Structure

- Modify `.claude-plugin/plugin.json` to use Google Workspace skills metadata.
- Modify `.codex-plugin/plugin.json` to use Google Workspace skills metadata.
- Keep local skill content aligned with upstream Google Workspace skills.
- Create `.github/workflows/sync-upstream-skills.yml` for sparse upstream sync.
- Modify `README.md` to describe wrapper installation and sync behavior.
- Modify `AGENTS.md` to keep durable Google Workspace wrapper guidance current.
- Modify `CLAUDE.md` only for Claude-specific adapter guidance.
- Modify `repo-map.json` to reflect actual package purpose, sync workflow, docs, and commands.
- Keep stale model-evaluation scaffolding out of this package. Do not wire model evaluation into this implementation.

## Task 1: Update Plugin Manifest Metadata

**Files:**

- Modify: `.claude-plugin/plugin.json`
- Modify: `.codex-plugin/plugin.json`

- [ ] **Step 1: Inspect current manifests**

Run:

```bash
python3 -m json.tool .claude-plugin/plugin.json >/dev/null
python3 -m json.tool .codex-plugin/plugin.json >/dev/null
```

Expected: both commands exit successfully.

- [ ] **Step 2: Update Claude manifest**

Set `.claude-plugin/plugin.json` to package-specific metadata:

```json
{
  "name": "google-workspace-cli",
  "description": "Google Workspace CLI skills for Claude Code.",
  "version": "0.1.0",
  "author": {
    "name": "Accelerate Data"
  },
  "repository": "https://github.com/accelerate-data/google-workspace-cli",
  "license": "Apache-2.0",
  "keywords": [
    "google-workspace",
    "gws",
    "skills",
    "claude-code"
  ],
  "skills": "./skills"
}
```

- [ ] **Step 3: Update Codex manifest**

Set `.codex-plugin/plugin.json` to package-specific metadata:

```json
{
  "name": "google-workspace-cli",
  "description": "Google Workspace CLI skills for Codex.",
  "author": {
    "name": "Accelerate Data"
  },
  "repository": "https://github.com/accelerate-data/google-workspace-cli",
  "license": "Apache-2.0",
  "keywords": [
    "google-workspace",
    "gws",
    "skills",
    "codex",
    "claude-code"
  ],
  "skills": "./skills/",
  "interface": {
    "displayName": "Google Workspace CLI",
    "shortDescription": "Google Workspace CLI skills for Codex.",
    "developerName": "Accelerate Data",
    "category": "Productivity",
    "capabilities": [],
    "screenshots": []
  }
}
```

- [ ] **Step 4: Validate manifests**

Run:

```bash
python3 -m json.tool .claude-plugin/plugin.json >/dev/null
python3 -m json.tool .codex-plugin/plugin.json >/dev/null
```

Expected: both commands exit successfully.

## Task 2: Add Upstream Sparse Sync Workflow

**Files:**

- Create: `.github/workflows/sync-upstream-skills.yml`

- [ ] **Step 1: Create sync workflow**

Create `.github/workflows/sync-upstream-skills.yml`. The workflow must support manual runs and a weekly GitHub Actions schedule:

```yaml
name: Sync upstream Google Workspace skills

on:
  workflow_dispatch:
  schedule:
    - cron: "0 3 * * 1"

permissions:
  contents: write
  pull-requests: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Sparse checkout upstream skills
        run: |
          tmpdir="$(mktemp -d)"
          git clone --depth 1 --filter=blob:none --sparse \
            https://github.com/googleworkspace/cli.git \
            "$tmpdir/googleworkspace-cli"

          cd "$tmpdir/googleworkspace-cli"
          git sparse-checkout set skills

          cd "$GITHUB_WORKSPACE"
          rm -rf skills
          cp -R "$tmpdir/googleworkspace-cli/skills" ./skills

      - name: Validate plugin shape
        run: |
          python3 -m json.tool .claude-plugin/plugin.json >/dev/null
          python3 -m json.tool .codex-plugin/plugin.json >/dev/null
          test -d skills
          find skills -name SKILL.md -type f | grep -q .

      - name: Open sync PR
        uses: peter-evans/create-pull-request@v6
        with:
          branch: chore/sync-google-workspace-skills
          title: Sync Google Workspace CLI skills
          commit-message: Sync Google Workspace CLI skills
          body: |
            Syncs `skills/` from `googleworkspace/cli` using sparse checkout.
```

- [ ] **Step 2: Validate workflow YAML is present**

Run:

```bash
test -f .github/workflows/sync-upstream-skills.yml
rg -n "git sparse-checkout set skills|create-pull-request|find skills -name SKILL.md" .github/workflows/sync-upstream-skills.yml
```

Expected: `rg` prints the sparse checkout, PR creation, and skill validation lines.

## Task 3: Sync Upstream Skills Locally

**Files:**

- Delete: stale local skill placeholders if they are still present
- Create/modify: `skills/**`

- [ ] **Step 1: Run the sparse sync locally**

Run:

```bash
tmpdir="$(mktemp -d)"
git clone --depth 1 --filter=blob:none --sparse \
  https://github.com/googleworkspace/cli.git \
  "$tmpdir/googleworkspace-cli"
cd "$tmpdir/googleworkspace-cli"
git sparse-checkout set skills
cd /Users/hbanerjee/src/google-workspace-cli
rm -rf skills
cp -R "$tmpdir/googleworkspace-cli/skills" ./skills
```

Expected: `skills/` is replaced with upstream Google Workspace skill directories.

- [ ] **Step 2: Confirm skill files exist**

Run:

```bash
find skills -name SKILL.md -type f | sort | head
test "$(find skills -name SKILL.md -type f | wc -l | tr -d ' ')" -gt 0
```

Expected: the first command prints upstream `SKILL.md` paths and the second command exits successfully.

## Task 4: Update Repository Documentation

**Files:**

- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `CLAUDE.md`
- Modify: `repo-map.json`

- [ ] **Step 1: Update README**

Update `README.md` so it says this repo:

- is a plugin-source wrapper for Google Workspace CLI skills
- vendors only upstream `skills/`
- does not vendor the full `googleworkspace/cli` repo
- requires users to install and authenticate `gws` for live Google Workspace operations
- uses `.github/workflows/sync-upstream-skills.yml` for refreshes
- can be used by Claude and Codex marketplaces as a whole-repo plugin source

- [ ] **Step 2: Update AGENTS.md**

Keep `AGENTS.md` aligned with durable guidance:

- repository purpose is Google Workspace CLI skills wrapper
- upstream skill content comes from `googleworkspace/cli/skills`
- this repo owns packaging metadata and sync workflow
- no eval requirement for sync-only or packaging-only changes
- update `repo-map.json` when manifests, sync workflow, docs, or skill layout change

- [ ] **Step 3: Update CLAUDE.md**

Keep only Claude-specific notes needed for this repo, especially that canonical guidance lives in `AGENTS.md`.

- [ ] **Step 4: Update repo-map.json**

Update `repo-map.json` so it no longer says stale placeholder package or skill names. Include:

- repo root: `google-workspace-cli`
- purpose: Google Workspace CLI skills wrapper
- key docs: `docs/design/vendor-google-workspace-skills.md` and `docs/plan/vendor-google-workspace-skills.md`
- sync workflow: `.github/workflows/sync-upstream-skills.yml`
- validation commands: JSON manifest checks and `find skills -name SKILL.md`

Do not add model-evaluation commands as required validation for this package.

## Task 5: Packaging Validation

**Files:**

- Read: `.claude-plugin/plugin.json`
- Read: `.codex-plugin/plugin.json`
- Read: `skills/**/SKILL.md`
- Read: `README.md`
- Read: `AGENTS.md`
- Read: `repo-map.json`

- [ ] **Step 1: Validate manifests and skill presence**

Run:

```bash
python3 -m json.tool .claude-plugin/plugin.json >/dev/null
python3 -m json.tool .codex-plugin/plugin.json >/dev/null
test -d skills
find skills -name SKILL.md -type f | grep -q .
```

Expected: all commands exit successfully.

- [ ] **Step 2: Check for stale placeholder references**

Run:

```bash
rg -n "deprecated placeholder|sample skill placeholder" README.md AGENTS.md CLAUDE.md repo-map.json .claude-plugin .codex-plugin
```

Expected: no matches.

- [ ] **Step 3: Check model evaluation is not required by docs**

Run:

```bash
rg -n "model-evaluation command|required model evaluation" README.md AGENTS.md repo-map.json
```

Expected: no matches that describe evals as required validation for this package.

- [ ] **Step 4: Review git diff**

Run:

```bash
git status --short
git diff -- README.md AGENTS.md CLAUDE.md repo-map.json .claude-plugin/plugin.json .codex-plugin/plugin.json .github/workflows/sync-upstream-skills.yml
```

Expected: the diff shows only wrapper packaging, sparse sync, documentation, and upstream skill vendoring changes.
