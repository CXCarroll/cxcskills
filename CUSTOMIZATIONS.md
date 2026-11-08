# Customizations

cxcskills is a fork of [mattpocock/skills](https://github.com/mattpocock/skills), based on upstream commit `4ae2317` (2026-10-31). This file lists everything that differs from upstream, so merging Matt's updates stays a few minutes of work.

## Install

Pick one route. Both give you every skill, so installing both shows each skill twice, and so does keeping Matt's own plugin installed beside either one:

```bash
claude plugin uninstall mattpocock-skills@claude-plugins-official
```

**Claude Code plugin** (the 34 promoted skills, namespaced as `/cxcskills:<name>`):

```bash
claude plugin marketplace add /path/to/cxcskills
claude plugin install cxcskills@cxcskills
```

The plugin is cached by version. After changing a skill, bump the `-cxc.<n>` suffix in `.claude-plugin/plugin.json`, then:

```bash
claude plugin marketplace update cxcskills
claude plugin update cxcskills@cxcskills
```

**Symlinks for Claude Code and Codex** (live edits, no version bumps; also links Matt's `in-progress/` skills):

```bash
scripts/link-skills.sh
```

It links every skill outside `deprecated/` and `misc/` into `~/.claude/skills` and `~/.agents/skills`. Re-run it after adding, removing, or renaming a skill.

## Settings for sol-loop and council

`sol-loop` and `council` read their models from a `## Model delegates` section in `CLAUDE.md` or `AGENTS.md` (the repo's, then your global `~/.claude/CLAUDE.md` or `~/.codex/AGENTS.md`). The format and the defaults are in [`skills/cxc/model-delegates/SKILL.md`](./skills/cxc/model-delegates/SKILL.md). OpenAI runs through the Codex CLI signed in with ChatGPT. The third council member is any CLI that reads a prompt on stdin and prints its reply, run in its own read-only mode.

## Added files

These never conflict with upstream.

- `skills/cxc/`: `typescript-best-practices`, `blast-radius`, `sol-loop`, `council`, `model-delegates`, `to-views`, `adopt-design`, and the bucket `README.md`.
- `docs/cxc/`: one docs page per cxc skill.
- `.claude-plugin/icon.png`: the plugin icon `claude plugin validate` asks for.
- `CUSTOMIZATIONS.md` (this file) and `THIRD_PARTY_NOTICES.md`.

## Changed upstream files

Expect merge conflicts only here. Each change is small and sits at the top or bottom of its file where possible.

| File | Change | Why |
| --- | --- | --- |
| `.claude-plugin/plugin.json` | Name `cxcskills`, version `<upstream>-cxc.<n>`, description, author, keywords; no `homepage` or `repository`; the five cxc skill paths | Its own plugin identity, so it replaces `mattpocock-skills` instead of colliding with it |
| `.claude-plugin/marketplace.json` | Marketplace and plugin renamed to `cxcskills`, owner, descriptions | Local install by path |
| `README.md` | Rewritten as the fork's own README: credits, install, workflow, usage, and the full skill reference. On a conflict, keep ours and copy any new skill entries from Matt's README into its Skill reference | The fork's README describes the fork, and every promoted skill is listed and linked |
| `CLAUDE.md` | `## This fork (cxcskills)` section at the bottom | `skills/cxc/` is a promoted bucket, with the same obligations as Matt's |
| `skills/engineering/code-review/SKILL.md` | One paragraph in step 3: TypeScript diffs load `typescript-best-practices` as a standards source | Enforces the TypeScript rules at review, where Matt's flow imposes standards |
| `skills/engineering/ask-matt/SKILL.md` | `## Additions in this fork (cxcskills)` section at the bottom | The router maps every user-reachable skill |
| `.github/workflows/release.yml`, `needs-info.yml`, `triage-label.yml` | One `if: github.repository == 'mattpocock/skills'` line per job | Matt's release and issue-triage automation is skipped on this fork |

`package.json` is untouched, so `npm run check-plugin-version` reports the `-cxc` suffix as a mismatch. That check only matters to Matt's release workflow.

## Differences from the source skills

- **typescript-best-practices** (pstack): the `type-system-discipline` and `boundary-discipline` principle skills are folded into a Discipline section, so nothing points at a missing skill. Model-invoked, with `paths` covering `.svelte` too. Adds a `!` row, a lint table for typescript-eslint and oxlint, and three patterns (form and DOM values, IDs read from your own database, cookie and JSON payloads).
- **blast-radius** (pstack): its pointers to pstack's `why`, `arena` and `unslop` are replaced with `gh`/`git log`, `model-delegates`, and plain writing. Reads the domain glossary like Matt's skills do.
- **sol-loop** (tstack): T3 Code's `delegate_task` is replaced by `model-delegates`, with a fresh delegate every round instead of resuming one. The PR line goes in the `pr` skill's Evidence section. User-invoked.
- **council** (tstack): members come from `model-delegates` settings. Adds a review brief with a `SCORE:` line and a 3-round budget (the source loops until everyone is satisfied). The score table goes after the `pr` skill's sections. User-invoked.
- **to-views** and **adopt-design**: new. They add a design detour for new screens between `to-spec` and `to-tickets`: list the views and brief Claude Design, then make the finished boards the source of truth with tokens, a design README and UI coding standards.
- **model-delegates**: new. It owns the `delegate` script (Codex read-only runs, a configurable third CLI, a working-tree guard, timeouts, and a record per run), because this repo's convention lets one skill reach another only through the Skill tool.

## Pull Matt's updates

```bash
git fetch upstream
git merge upstream/main
```

Resolve conflicts in the files in the table above, keeping both sides. If Matt bumped his version, set `plugin.json` to his new version plus `-cxc.1`. Then run `claude plugin validate .`. Under Claude Code 2.1.319, `--strict` fails on Matt's repo too, because it flags the maintainer `CLAUDE.md` at the plugin root, so plain `validate` is the check that passes here.

The fork lives at https://github.com/CXCarroll/cxcskills (`origin`), with Matt's repo as `upstream`.
