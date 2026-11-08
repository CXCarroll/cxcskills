# cxcskills

An amalgamation of skills from other creators that I use frequently.

cxcskills is my working set of agent skills for building and maintaining apps with Claude Code and Codex. The base is [Matt Pocock's skills](https://github.com/mattpocock/skills), which run my day-to-day workflow: interview the idea, write a spec, split it into tickets, build test-first, review. On top of that sit skills drawn from Lauren Tan's [pstack](https://github.com/cursor/plugins/tree/main/pstack) and Theo Browne's [tstack](https://github.com/t3dotgg/tstack), adapted so they fit Matt's workflow instead of competing with it, plus two of my own that take a new app from spec to designed screens.

## Credits

The skills here are other people's work, adapted. Any rough edges in the adaptations are mine, not theirs.

| Creator | Source | Used here | Licence |
| --- | --- | --- | --- |
| **Matt Pocock** ([AI Hero](https://www.aihero.dev)) | [mattpocock/skills](https://github.com/mattpocock/skills) | The whole base: every engineering and productivity skill, the workflow that ties them together, and the repo's conventions | MIT |
| **Lauren Tan** ([poteto](https://x.com/poteto)) | [pstack](https://github.com/cursor/plugins/tree/main/pstack) | `typescript-best-practices` (with her type-system and boundary discipline principles folded in) and `blast-radius` | MIT |
| **Theo Browne** ([t3dotgg](https://github.com/t3dotgg)) | [tstack](https://github.com/t3dotgg/tstack) | `sol-loop`, `council`, and the delegation pattern behind `model-delegates` | MIT |

Each adapted skill names its source in its `SKILL.md` under `metadata.credits`. The licences are in [LICENSE](./LICENSE) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md). The originals are maintained by their authors and move faster than this fork: Matt's [newsletter](https://www.aihero.dev/s/skills-newsletter) announces changes to his skills, and pstack and tstack are worth watching on GitHub.

### What each source brings

- **Matt Pocock** built his skills around four failure modes he kept seeing in coding agents. The agent builds the wrong thing, so start with a **grilling** session that aligns you before any code. The agent is verbose and inconsistent, so build a shared **glossary** of the project's terms. The code doesn't work, so give the agent tight feedback loops and **red-green-refactor** TDD. The codebase turns into a ball of mud, so design **deep modules**: a lot of behaviour behind a small interface. His skills are small, composable, and meant to be adapted, which is what made this fork easy.
- **Lauren Tan** wrote pstack so agents write less code of higher quality: go deep first, verify against the real thing rather than a proxy, and let the type system reject bad states. This fork takes her TypeScript rules and her blast-radius check.
- **Theo Browne** wrote tstack around getting a change proven, reviewed and landed. This fork takes his two cross-model review loops, which have models from other providers check the agent's work.

## Install

You need Claude Code or Codex. `sol-loop` and `council` also need the [Codex CLI](https://developers.openai.com/codex) signed in with ChatGPT, and the PR steps use the GitHub CLI (`gh`).

Pick **one** route. If Matt's plugin is installed, remove it first, or every skill shows up twice:

```bash
claude plugin uninstall mattpocock-skills@claude-plugins-official
```

### Claude Code plugin

```bash
claude plugin marketplace add CXCarroll/cxcskills
claude plugin install cxcskills@cxcskills
```

Restart Claude Code. Skills appear as `/cxcskills:<name>`, for example `/cxcskills:grill-with-docs`. To install from a local clone instead of GitHub, pass its path to `marketplace add`.

Installed plugins are cached by version. To pick up a change, bump the `-cxc.<n>` suffix of `version` in `.claude-plugin/plugin.json`, push, then run:

```bash
claude plugin marketplace update cxcskills
claude plugin update cxcskills@cxcskills
```

### Symlinks (Claude Code and Codex)

```bash
git clone https://github.com/CXCarroll/cxcskills.git
cd cxcskills
scripts/link-skills.sh
```

This links every skill into `~/.claude/skills` (Claude Code) and `~/.agents/skills` (Codex), so edits and `git pull` take effect at once, with no version bumps. It also links Matt's beta skills from `skills/in-progress/`. Re-run it after adding or renaming a skill.

### Set up each project

Run `/setup-matt-pocock-skills` once in each repo (`/cxcskills:setup-matt-pocock-skills` with the plugin). It records your issue tracker (GitHub Issues, local markdown files, or another), your triage labels, and where the domain docs live.

### Settings for sol-loop and council

`sol-loop` and `council` read which models to use from a `## Model delegates` section that you add to a `CLAUDE.md` or `AGENTS.md`: your global one to cover every project, or one repo's to cover just that repo.

```markdown
## Model delegates

| Member | Route | Model | Effort |
| --- | --- | --- | --- |
| Claude Opus | subagent | opus | high |
| GPT Sol | codex | default | high |
| <third member> | cmd: `<CLI call that reads the prompt on stdin>` | set in the command | |

- Sol reviewer: GPT Sol
- Council: Claude Opus, GPT Sol, <third member>
```

`default` uses whatever model your Codex CLI is configured with. The third member can be any command-line tool that reads a prompt on stdin, prints its reply, and runs in its own read-only mode. Until one is set, `/council` says so and stops, unless you name the members yourself ("council with Claude and GPT").

## How the skills work

A skill is a folder with a `SKILL.md`: a one-line description the agent always sees, and instructions it loads only when the skill runs. There are two kinds:

- **User-invoked** skills run only when you type them, like `/grill-with-docs` or `/sol-loop`. Each one orchestrates a whole step of work.
- **Model-invoked** skills can be typed too, but the agent also reaches for them on its own when a task fits, like `tdd` while building or `typescript-best-practices` while writing TypeScript. They hold reusable discipline.

A user-invoked skill can call model-invoked ones, never another user-invoked one.

### The workflow

```text
/grill-with-docs    sharpen the idea; build GLOSSARY.md and ADRs
   |  /prototype    when a question needs running code to answer
/to-spec            turn the conversation into a spec
/to-views           new screens: list the views, write a Claude Design brief for each
   |                (in Claude Design: draw and tweak the boards)
/adopt-design       the boards become the source of truth for how the app looks
/to-tickets         split the spec into tracer-bullet tickets
/implement          per ticket: tdd at agreed seams, then code-review
   |                typescript-best-practices applies while coding and in code-review
/sol-loop           optional: a second model hunts bugs in the diff
/council            or: three providers review and score it
/blast-radius       optional: what could this break outside the diff?
pr                  the PR body: summary, evidence, merge danger
/retro              improve the agent's environment for next time
```

Off the main path: `/diagnosing-bugs` for hard bugs, `/triage` for incoming issues, `/wayfinder` for work too big for one session, `/improve-codebase-architecture` for upkeep, and `/ask-matt` when you're not sure which skill fits. `/ask-matt` knows the additions too.

### Cross-model review

`sol-loop`, `council` and `blast-radius` reach other providers' models through `model-delegates`. Every run:

- **is read-only.** Codex runs in its read-only sandbox, and a guard fingerprints your git working tree before and after, failing the run if anything changed.
- **uses the model you configured.** If a member can't run, you get the blocker, never a substitute model.
- **leaves a record**: the brief, the reply, the model as the provider reported it, and token usage, in a folder under `$TMPDIR/cxc-delegates`.

Reviews are budgeted. `sol-loop` stops after 3 rounds (5 for security, auth or data-loss findings), `council` after 3, and both push back on fixes that would grow the change.

## Using them

A typical feature, start to finish:

```text
/grill-with-docs Tenants should be able to upload proof of insurance from their portal.
/to-spec
/to-tickets
/clear
/implement #42
/sol-loop
```

`/grill-with-docs`, `/to-spec` and `/to-tickets` share one session, so the spec and tickets build on the interview. Clear the context before each `/implement`, since every ticket stands on its own.

A new app with designed screens adds a detour between the spec and the tickets:

```text
/grill-with-docs A portal where tenants report maintenance issues and track repairs.
/to-spec
/clear
/to-views
   (paste the briefs into Claude Design, then tweak the boards)
/adopt-design https://claude.ai/artifact/<your canvas>
/to-tickets
```

`/to-views` runs in a fresh context on purpose: it reads only the spec, so anything the interview settled but the spec left out shows up as a gap to fix before you design.

| You want to | Type |
| --- | --- |
| Find the right skill for a situation | `/ask-matt` |
| Fix a bug that resists a first look | `/diagnosing-bugs` |
| Review a branch against `main` | `/code-review main` |
| Get a second model's opinion on a diff | `/sol-loop` |
| Have three providers review a risky change | `/council` |
| Check what a small change might break | `/blast-radius` |
| Plan the screens of a new app and brief Claude Design | `/to-views` |
| Make finished boards the source of truth for the build | `/adopt-design` |
| Tighten the types in a module | `/typescript-best-practices`, then say which module |
| Improve the setup after a rough session | `/retro` |

With the plugin installed, add the `cxcskills:` prefix, for example `/cxcskills:sol-loop`.

## Skill reference

### Engineering (Matt Pocock)

Daily code work.

**User-invoked**

- **[ask-matt](./skills/engineering/ask-matt/SKILL.md)**: Ask which skill or flow fits your situation. A router over the user-invoked skills in this repo.
- **[grill-with-docs](./skills/engineering/grill-with-docs/SKILL.md)**: Grilling session that also builds your project's domain model, sharpening terminology and updating `GLOSSARY.md` and ADRs inline.
- **[triage](./skills/engineering/triage/SKILL.md)**: Move issues through a state machine of triage roles.
- **[improve-codebase-architecture](./skills/engineering/improve-codebase-architecture/SKILL.md)**: Scan a codebase for deepening opportunities, present them as a visual HTML report, then grill through whichever one you pick.
- **[setup-matt-pocock-skills](./skills/engineering/setup-matt-pocock-skills/SKILL.md)**: Configure this repo for the engineering skills (issue tracker, triage labels, domain doc layout). Run once per repo before using the other engineering skills.
- **[to-spec](./skills/engineering/to-spec/SKILL.md)**: Turn the current conversation into a spec and publish it to the issue tracker. No interview, just synthesizes what you've already discussed.
- **[to-tickets](./skills/engineering/to-tickets/SKILL.md)**: Break any plan, spec, or conversation into a set of tracer-bullet tickets, each declaring its blocking edges, written as text in a local file, or as native blocking links on a real tracker.
- **[implement](./skills/engineering/implement/SKILL.md)**: Build the work described by a spec or set of tickets, driving `/tdd` at pre-agreed seams and closing out with `/code-review` before committing.
- **[implement-spec](./skills/engineering/implement-spec/SKILL.md)**: Implement a whole spec on one integration branch. Works the tickets as a task graph, running implementer subagents across the ready frontier for maximum concurrency, then closes out with `/code-review`.
- **[wayfinder](./skills/engineering/wayfinder/SKILL.md)**: Plan a huge chunk of work, more than one agent session can hold, as a shared map of decision tickets on the issue tracker, and resolve them one at a time until the way to the destination is clear.
- **[retro](./skills/engineering/retro/SKILL.md)**: Suggest improvements to the coding agent's environment (navigation, automated checks, coding standards, steering files, tooling) after a session, most severe first.

**Model-invoked**

- **[prototype](./skills/engineering/prototype/SKILL.md)**: Build a throwaway prototype to answer a design question, either a single shareable HTML file for state/logic questions, or several radically different UI variations toggleable from one route.
- **[diagnosing-bugs](./skills/engineering/diagnosing-bugs/SKILL.md)**: Disciplined diagnosis loop for hard bugs and performance regressions: build a feedback loop that goes red on this bug → minimise → hypothesise → instrument → fix → regression-test.
- **[research](./skills/engineering/research/SKILL.md)**: Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo, run as a background agent.
- **[tdd](./skills/engineering/tdd/SKILL.md)**: Test-driven development with a red-green-refactor loop. Builds features or fixes bugs one vertical slice at a time.
- **[domain-modeling](./skills/engineering/domain-modeling/SKILL.md)**: Actively build and sharpen a project's domain model: challenge terms against the glossary, stress-test with edge-case scenarios, and update `GLOSSARY.md` and ADRs inline.
- **[codebase-design](./skills/engineering/codebase-design/SKILL.md)**: Shared discipline and vocabulary for designing deep modules: a lot of behaviour behind a small interface, placed at a clean seam, testable through that interface.
- **[code-review](./skills/engineering/code-review/SKILL.md)**: Two-axis review of the diff since a fixed point: **Standards** (does it follow the repo's coding standards, plus a Fowler smell baseline?) and **Spec** (does it faithfully implement the originating issue/spec?), run as parallel sub-agents so neither pollutes the other.
- **[pr](./skills/engineering/pr/SKILL.md)**: The shape a pull request body should take: a summary as the smallest visual that makes the change clear, before/after evidence that it works, and a merge-danger call (one-way or two-way door, plus blast radius).
- **[wizard](./skills/engineering/wizard/SKILL.md)**: Generate an interactive bash wizard that walks a human through steps only they can perform: provisioning infrastructure, setting up credentials or CI secrets, walking an unfamiliar third-party dashboard, or running a one-off migration or cutover.

### Productivity (Matt Pocock)

General workflow tools, not code-specific.

**User-invoked**

- **[grill-me](./skills/productivity/grill-me/SKILL.md)**: Get relentlessly interviewed about a plan or design until every branch of the design tree is resolved.
- **[handoff](./skills/productivity/handoff/SKILL.md)**: Compact the current conversation into a handoff document so another agent can continue the work.
- **[teach](./skills/productivity/teach/SKILL.md)**: Teach the user a new skill or concept over multiple sessions, using the current directory as a stateful teaching workspace.
- **[to-questionnaire](./skills/productivity/to-questionnaire/SKILL.md)**: Turn a decision you can't answer alone into a Markdown questionnaire for the one person who can, filled in async, or together over a meeting. It grills you about the send (who it's for, what you need back), not the subject.
- **[wait-what](./skills/productivity/wait-what/SKILL.md)**: Fire this the moment a message doesn't land. The agent re-pitches it with the context you're missing, in plain English, using your `GLOSSARY.md` vocabulary.

**Model-invoked**

- **[grilling](./skills/productivity/grilling/SKILL.md)**: Interview the user relentlessly about a plan, decision, or idea until every branch of the design tree is resolved. The reusable interview primitive behind `grill-me`, `grill-with-docs`, `triage`, `wayfinder` and `improve-codebase-architecture`.
- **[writing-for-agents](./skills/productivity/writing-for-agents/SKILL.md)**: Writing documents for agents: skills, AGENTS.md/CLAUDE.md, and any doc an agent reaches by a pointer.

### cxc (this fork)

Adapted from pstack and tstack, plus `model-delegates`, `to-views` and `adopt-design`, written for this fork. See [`skills/cxc/README.md`](./skills/cxc/README.md) and the docs pages in [`docs/cxc/`](./docs/cxc/).

**User-invoked**

- **[sol-loop](./skills/cxc/sol-loop/SKILL.md)**: Review the current change with OpenAI's Sol model in a short loop until you both agree. From tstack.
- **[council](./skills/cxc/council/SKILL.md)**: Get a review or feedback from three models from different providers, and loop until they agree. From tstack.
- **[blast-radius](./skills/cxc/blast-radius/SKILL.md)**: Find what a change could break outside its diff, and prove the one fact it is safe because of by running real code. From pstack.
- **[to-views](./skills/cxc/to-views/SKILL.md)**: Turn a spec into a list of the app's views and one Claude Design brief per view, ready to prototype the screens.
- **[adopt-design](./skills/cxc/adopt-design/SKILL.md)**: Make finished Claude Design boards the repo's source of truth for how the app looks, with tokens, a design README, and the coding standards that enforce them.

**Model-invoked**

- **[typescript-best-practices](./skills/cxc/typescript-best-practices/SKILL.md)**: Type-design rules for TypeScript and Svelte: discriminated unions, branded IDs from a verifying parse, parsing at boundaries, no `as` or `!`, exhaustive switches. `code-review` loads it for TypeScript diffs. From pstack.
- **[model-delegates](./skills/cxc/model-delegates/SKILL.md)**: Run a read-only task on a model from another provider (Codex CLI, a Claude subagent, or any CLI you configure) and keep a record of what ran.

## What was left out

Other skills from the same sources were considered and skipped, because they repeat or conflict with Matt's workflow:

- From pstack: `tdd` (meant only for bug fixes on request, where Matt's `tdd` is test-first for everything), `poteto-mode` (a competing workflow router), and `architect`, `correct` and `interrogate` (covered by `codebase-design`, `retro` and `code-review`).
- From tstack: `full-send`, `full-stop`, `babysit-pr` and `file-pr` (they overlap with the PR flow and the `pr` skill), plus `takeover`, `modernize` and `leaving-pr-comments`, which may come later.
- Kun Chen's [First Mate](https://github.com/kunchenguid/firstmate), an agent distro for running a crew of agents rather than a set of skills to mix in.

## Staying current with Matt's skills

This repo keeps Matt's repository as the `upstream` remote:

```bash
git fetch upstream
git merge upstream/main
```

[CUSTOMIZATIONS.md](./CUSTOMIZATIONS.md) lists every change made to Matt's files, which is where any merge conflicts will be, and how to resolve them.

## Repository layout

- `skills/engineering/`, `skills/productivity/`: Matt's skills, shipped in the plugin.
- `skills/cxc/`: this fork's additions, shipped in the plugin.
- `skills/in-progress/`, `skills/misc/`: Matt's beta and rarely used skills, not in the plugin.
- `docs/`: a human-facing page per skill.
- `CUSTOMIZATIONS.md`: what differs from upstream, and how to merge.
- `THIRD_PARTY_NOTICES.md`: the pstack and tstack licences.

## License

MIT. Matt Pocock's licence is in [LICENSE](./LICENSE); the pstack and tstack licences are in [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
