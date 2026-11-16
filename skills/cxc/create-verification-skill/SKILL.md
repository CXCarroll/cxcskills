---
name: create-verification-skill
description: Generate a project-local skill that launches this app, drives it the way a user does, and captures proof, with a feature map of what to check.
disable-model-invocation: true
metadata:
  credits:
    skill: create-verification-skill
    author: Lauren Tan (poteto)
    url: "https://github.com/cursor/plugins/blob/main/pstack/skills/create-verification-skill/SKILL.md"
---

# Create a verification skill

Every app needs a scripted way to prove behaviour: launch it, use a feature the way a user would, and capture **evidence**. This skill writes that as a project-local skill, `verify-<app>`, tailored to the repo, with a **feature map**: one file per user-facing feature saying how to reach it, how to drive it, and what end state proves it works. Agents then share your words for the app ("the filter in the tenant list") and reuse one **driver** script instead of improvising a harness every run.

You write the generated skill for the next agent, not for a human: it will be read cold, mid-task, by an agent that has never seen the app.

## 1. Interview the repo, not the user

Answer these from the codebase, and ask the user only what you cannot observe:

- **Surface:** what does a user actually touch? A web UI, an iOS app, a CLI, an API? Pick the primary one and note the rest.
- **Run:** how does the app start locally? Prefer the repo's own scripts (`package.json`, the README quickstart). Note ports, env vars, the database, seed data, and auth.
- **Drive:** how can an agent use it programmatically? Existing harnesses first: Playwright specs and config, a UI test target, curl-able endpoints. Only then pick a recipe from [references/drivers.md](references/drivers.md).
- **Observe:** what evidence can be captured? Screenshots, ARIA snapshots, response bodies, logs, exit codes, database rows.
- **Isolate:** can two instances run side by side (ports, databases, simulators)? If not, say so in the generated skill: refusing to drive a shared instance beats corrupting the user's session.

Then look for what already exists, and build on it rather than beside it:

- `docs/design/views.md` (from `to-views`) and the spec: the views and user stories that seed the feature map.
- An existing QA or verification skill under `.claude/skills/`, or a scenario list (a `qa/` folder, a `scenarios.json`). If one covers part of this job, show the user what it covers and ask whether to extend it or replace it.
- A screenshot script from `ui-hill-climb`, and the repo's seed or demo-data scripts.

If the checkout doesn't build or start as-is, fix that first, or report it precisely. A skill written against a broken base teaches wrong steps. When an irrelevant missing asset blocks startup (a sample config, an empty static folder), the generated skill may create it, marked as verification scaffolding, and remove it in cleanup.

## 2. Generate the skill

Write `.claude/skills/verify-<app>/SKILL.md`, model-invoked so agents reach for it while building. Its frontmatter has `name: verify-<app>` and a `description` that names the app and surface and says when to reach for it ("Use to prove a change to <app> works in the running app, before review or a PR"). Without frontmatter the skill never registers. Link it for Codex too: `mkdir -p .agents/skills && ln -s ../../.claude/skills/verify-<app> .agents/skills/verify-<app>`.

The body has these sections, each grounded in what the interview found, with no placeholders left:

- **Launch:** the exact commands that start an instance for verification from an empty database (migrations and seed data included), and how to tell it is ready. Ready means usable: a page that renders the app, not just a port that answers. Include teardown.
- **Doctor:** one read-only check that answers "is this instance worth driving?": the process is the one this run started, the build is the current checkout, the database is the run's own, and auth works. Agents run it first, and again whenever anything looks off.
- **Drive:** the driver's commands with real selectors from this repo. Prefer stable handles (ARIA roles and accessible names, `data-testid`, accessibility identifiers, routes) over coordinates and DOM position.
- **Evidence:** what to capture and where it goes: `${TMPDIR:-/tmp}/verify-<app>/<run-id>/`, outside the repo. The proof standards: use the real user path, not internal setters or test-only endpoints; capture the action and the resulting state, not only the final screen; check side effects (rows written, emails queued) beside what is visible; mock only where a production boundary already isolates the outside system. When the safe path is a dry run or test mode, check what it actually skips by observing it, not by trusting its name.
- **Cleanup:** stop what this run started (by the PID or ID it recorded, never by process name), drop the run's database or simulator, and keep the evidence.
- **Driver:** ship the driver as a script in the skill's `scripts/` folder (for a web app, a Bun script over Playwright with subcommands such as `launch`, `doctor`, `login --as <role>`, `goto`, `click`, `fill`, `snapshot`, `screenshot`, `stop`). Make it executable and show every invocation in the body. A helper the reader has to reverse-engineer is not a helper.

## 3. Seed the feature map

Create `.claude/skills/verify-<app>/features/README.md` and one file per user-facing feature. Seed from `docs/design/views.md` and the spec's user stories where they exist, otherwise from routes and navigation; start with the 3 to 5 features users touch most. A feature can span several views; name the views each one touches.

Follow the shape in [references/feature-map-example/](references/feature-map-example/): a README with baseline preconditions, driving conventions and proof rules, then one file per feature. Each feature file opens with an H1 and a paragraph of user-visible behaviour, then exactly four H2s: `Sub-features`, `How to get to it (user POV)`, `Driving it with <driver>`, and `Gotchas`. Keep implementation details out: user paths, stable handles, required state, commands, and observable proof only.

If the seed data lacks a precondition a journey needs, the journey reports a failure and the reason goes in that feature's `Gotchas`. Never weaken the journey to make it pass. The map is the repo's source for verification: a proof that drives one convenient entry point is incomplete when the map lists others.

## 4. Prove the generated skill

Run its own instructions end to end once: launch, doctor, drive one mapped feature, capture evidence, clean up. Then confirm the evidence still exists at its named location: a cleanup that eats the proof fails this step. Fix what fails, and run the generated cleanup after every failed attempt too, so broken attempts don't strand processes, ports or databases.

A generated skill that was never run is a draft, not a deliverable. If you proved it in a stand-in (a local Postgres in place of the Docker one, a different simulator), list every step the stand-in did that the real setup won't; those stay unproven.

## 5. Hand over

Tell the user:

- the skill is model-invoked, so agents reach for it while implementing, and its screenshots belong in the `pr` skill's Evidence section;
- `ui-hill-climb` can build its screenshot script on the driver instead of a second harness;
- `/maintain-verification-skill` keeps the map honest as the app changes. Suggest a cadence only if they ask.
