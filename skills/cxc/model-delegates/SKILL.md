---
name: model-delegates
description: Run a read-only task, usually a review, on a model from another provider (OpenAI through the Codex CLI, Claude through a subagent, or any CLI you configure) and get its reply back with a record of what ran. Use when the user wants a second opinion from GPT, Gemini or another named model, asks what another model thinks of a change, or when another skill needs a cross-provider reviewer.
allowed-tools: "Bash(${CLAUDE_SKILL_DIR}/scripts/delegate *)"
metadata:
  credits:
    skill: council and sol-loop delegation steps
    author: Theo Browne
    url: "https://github.com/t3dotgg/tstack"
---

# Model delegates

A **delegate** is one model from one provider, given one self-contained **brief**, asked for one reply. Delegates are read-only: they read files and run read-only commands. They never edit, commit, push, comment on PRs or issues, or start subagents of their own.

The script `${CLAUDE_SKILL_DIR}/scripts/delegate` (the `scripts/delegate` file beside this `SKILL.md`) runs every route except the subagent one, guards the working tree, and keeps a record. `delegate --help` documents its flags and exit codes.

## Members

The user's settings name the members. Read the `## Model delegates` section of the repo's `CLAUDE.md` or `AGENTS.md`, then the user's global one (`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`). The repo's section wins where both name the same thing.

```markdown
## Model delegates

| Member | Route | Model | Effort |
| --- | --- | --- | --- |
| Claude Opus | subagent | opus | high |
| GPT Sol | codex | default | high |
| <third member> | cmd: `<a read-only CLI call that reads the brief on stdin>` | set in the command | |

- Sol reviewer: GPT Sol
- Council: Claude Opus, GPT Sol, <third member>
```

| Route | How it runs | Read-only is enforced by |
| --- | --- | --- |
| `subagent` | The Agent tool, with the table's model and effort. Claude Code only | The brief, then the guard |
| `codex` | `delegate run --provider codex`. `default` means Codex's own configured model | Codex's read-only sandbox, then the guard |
| `cmd` | `delegate run --provider cmd --command '<command>'`. The brief arrives on stdin and its path is in `$CXC_BRIEF_FILE` | The command's own flags, then the guard |

With no settings, the Sol reviewer is the `codex` route on Codex's default model, and the council is Claude Opus (`subagent`, `opus`, high) plus GPT (`codex`, default, high). A third council member exists only once the user configures one.

Never substitute. If a member cannot run (CLI missing, not signed in, unknown model, no subagent route in this harness), report the blocker and stop that member. Outside Claude Code there is no subagent route: Claude joins only as a `cmd` member the user configured.

## Run a delegate

1. **Write the brief** to a temp file outside the repo (`mktemp`). It must stand alone, since the delegate sees none of this conversation. Open it with the read-only line, then give the absolute repo path, the base SHA, the one diff command every round will use, the intent, what is out of scope, and the check results, then the reply format the caller wants:

   ```
   Review only. Do not edit, commit, push, comment on PRs, or start subagents.
   Use `git --no-optional-locks` for every git command.
   ```

2. **Start it.** For `codex` and `cmd`, run the script with the Bash tool in the background (Claude Code: `run_in_background: true`) and wait for the completion notice. Do not poll and do not start a second copy of the same member:

   ```bash
   ${CLAUDE_SKILL_DIR}/scripts/delegate run --provider codex [--model <slug>] [--effort <level>] \
     --brief <file> --repo <repo root> --label <member-slug>-r<round>
   ```

   For `subagent`, run `delegate fingerprint --repo <repo root>` first, then start one Agent with a fresh context window (never a fork of this conversation), the table's model and effort, and the brief as its prompt. When it returns, run `delegate fingerprint` again. A different fingerprint means the subagent broke read-only.

3. **Several members at once:** start every member in the same turn, then wait for all of them. Edit nothing in the repo until every delegate has returned: the guard fingerprints the whole working tree, so your own edit would fail the run.

4. **Read the result.** The script prints `run:`, `reply:` and `meta:` paths.

   | Exit | Meaning | Do |
   | --- | --- | --- |
   | 0 | Reply written | Read `reply.md` and check every claim against the code before acting on it |
   | 1 | Failed, timed out, or empty | Not approval. Read the stderr tail it printed, fix what you can (sign-in, CLI), rerun once, else report |
   | 2 | Bad arguments or missing CLI | Fix the call, or report the missing CLI as the blocker |
   | 3 | The working tree changed during the run | Stop. Show `git status` and `git diff` to the user before anything else |

## Record

Report each delegate with its member name, route, the model exactly as `meta.txt` states it (never a guess), the effort if one was set, usage if `meta.txt` has it, and the run folder. A timeout, an error, or a missing reply is never counted as approval.
