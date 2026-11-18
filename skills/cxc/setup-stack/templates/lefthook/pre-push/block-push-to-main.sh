#!/usr/bin/env bash
# Git pre-push hook (lefthook script job, see lefthook.yml). Refuses any push that updates main,
# whether from a checked-out main or via an explicit refspec such as HEAD:main.
# It stands in for branch protection, which private repos on the free GitHub plan lack.
# Changes reach main only by merging a pull request on GitHub after its checks have run.
set -euo pipefail

PROTECTED="refs/heads/main"
blocked=0

# Git feeds one line per ref: <local ref> <local sha> <remote ref> <remote sha>
while read -r _local_ref _local_sha remote_ref _remote_sha; do
	if [ "$remote_ref" = "$PROTECTED" ]; then
		blocked=1
	fi
done

if [ "$blocked" = "1" ]; then
	cat >&2 <<'MSG'

  Push to main refused.

  main only changes by merging a pull request on GitHub once its checks are green.
  Push your branch and open a PR instead:

      git push -u origin "$(git branch --show-current)"
      gh pr create

  To bypass in a genuine emergency: LEFTHOOK=0 git push ...

MSG
	exit 1
fi
