---
name: maintain-verification-skill
description: Audit the repo's verification skill against the app as it is now, drive every mapped feature live, and ship one PR of proven corrections.
disable-model-invocation: true
metadata:
  credits:
    skill: maintain-verification-skill
    author: Lauren Tan (poteto)
    url: "https://github.com/cursor/plugins/blob/main/pstack/skills/maintain-verification-skill/SKILL.md"
---

# Maintain a verification skill

A feature map **drifts** the moment the app changes. This is the upkeep pass for a skill made by `/create-verification-skill`, or any project-local verification skill with a feature map. The unit of rigour is the feature, not every sentence: cover every feature file from source, and drive every feature live.

## Outcome

End on exactly one, and say which:

- **clean**: every feature got source and live coverage, and nothing needs fixing. No branch, no PR.
- **changed**: one PR ships proven corrections to the map, the driver, or the skill's steps.
- **blocked**: coverage couldn't finish, or a proven fix couldn't ship safely. Say exactly what blocked it.

## Edit scope

Edit only the verification skill's own folder: its `SKILL.md`, `features/`, and its driver scripts. Never edit product code in this pass. Behaviour the map describes that the app no longer has is either **doc drift** (fix the map) or a **product regression** (report it, never paper over it in the map).

## Pass

1. **Find the target.** The project-local skill under `.claude/skills/` with Launch and Drive sections and a `features/` map, usually `verify-<app>`. Several candidates: ask which. None: stop, and tell the user to run `/create-verification-skill`.

2. **Index hygiene.** Read `features/README.md` and list the folder. Fix missing, extra, duplicate or dead entries.

3. **Source wave.** One read-only subagent per feature file, launched together, each started with a fresh context window. Each explains how the feature works from source, flags likely drift with `file:line` citations, and returns one live recipe. Subagents never drive the app and never edit files. Return shape: feature summary / source entry points / likely drift or none / one recipe.

4. **Reconcile.** Every feature file has a returned summary. Merge overlapping recipes into as few app states as practical. Spot-check cited drift; don't re-prove clean claims. Sweep the changes since the skill's folder last changed (`git log <that commit>..HEAD --name-only`, where `git log -1 --format=%h -- <skill folder>` gives the commit) for user-facing surfaces the map lacks: new routes, screens, commands, and changes to `docs/design/views.md`. Require a concrete source path before calling one missing.

5. **Live pass.** Required even when source looks clean. You alone drive, following the skill's own Launch section. Drive every feature at least once, and hold three rules whatever fails:
   - **Doctor first.** Never drive an instance you haven't checked since it last surprised you: doctor before the first drive and after any failed drive. Where doctor can't see the failure (a wedged UI on a healthy process), reset to a known state or relaunch.
   - **Evidence survives.** Everything captured so far still exists after every cleanup, checked at its named location.
   - **Nothing lingers.** Whatever a drive started is cleaned up once it stops being useful, whether the drive passed, failed or hung.

   A doctor failure caused by the skill's own drift is drift: fix it within the edit scope and retry once before calling the pass blocked. A feature you can't reach is `unreachable` only with the concrete prerequisite (a role, an entitlement, an outside service) and the route you tried; if the map omits that prerequisite, that is drift too. Drive any driver fix live again before it ships. Tear down after the last drive, including those re-proofs.

6. **Triage.** A wrong or missing user-view description is doc drift: fix it. Working behaviour the driver can't reach is a harness gap: fix the driver, with its invocation shown in the skill body. Broken app behaviour is a product gap: record it for the user and keep it out of this PR.

7. **Ship or stop.** For **changed**, re-read every changed file, then call the Skill tool with "pr" for the PR body, with the live evidence in its Evidence section. For **clean** or **blocked**, no PR: report the outcome and the coverage honestly.

Keep short run notes (features covered, unreachable prerequisites, confirmed drift, outcome) under `${TMPDIR:-/tmp}`, not in the repo.
