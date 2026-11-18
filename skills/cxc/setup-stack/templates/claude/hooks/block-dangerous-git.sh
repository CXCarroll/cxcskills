#!/bin/bash
# PreToolUse hook for Bash: refuses git commands that destroy work or bypass review.
#
# Pushing is allowed only as the whole command, to a branch other than main, without force:
#   git push [-u|--set-upstream] origin <branch>
# main is also guarded by the lefthook pre-push hook, for pushes that don't come through Claude.

INPUT=$(cat)
COMMAND=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty')

block() {
  echo "BLOCKED: '$COMMAND' $1. The user has prevented you from doing this." >&2
  exit 2
}

if printf '%s' "$COMMAND" | grep -qE 'git push'; then
  case "$COMMAND" in
    *$'\n'* | *';'* | *'&&'* | *'||'* | *'|'*) block "combines a push with other commands; run the push as the whole command" ;;
  esac
  if printf '%s' "$COMMAND" | grep -qE '^git push (-u |--set-upstream )?origin [A-Za-z0-9._/-]+$'; then
    BRANCH=${COMMAND##* }
    case "$BRANCH" in
      main | master) block "pushes to $BRANCH; push a branch and open a pull request instead" ;;
    esac
    exit 0
  fi
  block "is not the allowed push form 'git push -u origin <branch>' (no force, no refspecs, no main)"
fi

DANGEROUS_PATTERNS=(
  "git reset --hard"
  "git clean -[a-z]*f"
  "git branch -D"
  "git checkout \."
  "git checkout -- \."
  "git restore \."
  "git stash (drop|clear)"
  "git commit .*--no-verify"
  "LEFTHOOK=0"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
  if printf '%s' "$COMMAND" | grep -qE "$pattern"; then
    block "matches dangerous pattern '$pattern'"
  fi
done

exit 0
