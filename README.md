# Your Plugin Name

> **Template repo** — rename this, update the manifests, replace the example skill, and go.

Plugin repository for [describe what this plugin does] skills used by Claude Code and Codex.

This repository is a single plugin source repo, not a marketplace repo.

- Claude and Codex marketplaces should point to this repo as the plugin source.
- The canonical skill content lives in [`skills/`](./skills).

## Getting Started

1. **Rename** — update `name`, `description`, `repository` in `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`.
2. **Replace the example skill** — edit or replace `skills/example-skill/` with your first real skill.
3. **Update evals** — rename `tests/evals/packages/example-skill/` to match, update the prompt and assertions.
4. **Update `skill-eval-coverage-baseline.json`** — list any skills that intentionally have no eval package yet.
5. **Update `AGENTS.md`** — update the Skills section to list your real skills.
6. **Update `repo-map.json`** — reflect your actual skill names and eval commands.

## Layout

```text
.
├── .claude-plugin/plugin.json      # Claude plugin manifest
├── .codex-plugin/plugin.json       # Codex plugin manifest
├── skills/
│   └── example-skill/              # Replace with your skills
│       └── SKILL.md
├── tests/evals/
│   ├── packages/example-skill/     # One eval package per skill
│   ├── prompts/                    # Eval prompts
│   ├── assertions/                 # Shared assertion helpers
│   └── scripts/                   # Eval runner scripts
└── README.md
```

## Use In Claude

Install through a Claude plugin marketplace pointing to this repo, or symlink locally:

```bash
mkdir -p ~/.claude/skills

ln -s /absolute/path/to/your-plugin/skills/your-skill-name \
  ~/.claude/skills/your-skill-name
```

Enable the pre-commit hook:

```bash
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit
```

## Use In Codex

Install through a Codex plugin marketplace pointing to this repo, or symlink locally:

```bash
mkdir -p ~/.codex/skills

ln -s /absolute/path/to/your-plugin/skills/your-skill-name \
  ~/.codex/skills/your-skill-name
```

## Eval Harness

Promptfoo evals live under [`tests/evals/`](./tests/evals).

```bash
cd tests/evals
npm install
npm run eval
```

Individual skill suite:

```bash
cd tests/evals
npm run eval:example-skill
```

## Development Notes

- Keep all skill directories under `skills/`.
- Keep skill assets, references, and scripts inside the owning skill directory.
- Avoid cross-repo relative paths — a plugin install is expected to be self-contained.
- Bump the version in `.claude-plugin/plugin.json` with every PR (enforced by CI).
