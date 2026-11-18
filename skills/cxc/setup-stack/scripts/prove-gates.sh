#!/usr/bin/env bash
# Proves each quality gate in a SvelteKit app catches what it claims to: every gate must pass on the
# clean tree, then fail on one planted violation. Probes are removed on exit, even on Ctrl-C.
#
#   prove-gates.sh [--repo DIR] [--skip-tests]
#
# Exit 0: every gate present passed clean and failed on its probe. Exit 1: a gate let a probe
# through or failed on the clean tree. Exit 2: not a SvelteKit app, or a probe would overwrite a file.
set -uo pipefail

repo=.
skip_tests=0
while [ $# -gt 0 ]; do
	case "$1" in
		--repo) repo=${2:?--repo needs a directory}; shift 2 ;;
		--skip-tests) skip_tests=1; shift ;;
		*) echo "prove-gates: unknown argument $1" >&2; exit 2 ;;
	esac
done
cd "$repo" || exit 2
if ! grep -q '"@sveltejs/kit"' package.json 2>/dev/null; then
	echo "prove-gates: no SvelteKit app in $(pwd)" >&2
	exit 2
fi

probe_dir=src/lib/__gate_probe__
[ -e "$probe_dir" ] && { echo "prove-gates: $probe_dir already exists" >&2; exit 2; }
log=$(mktemp)
staged=0
cleanup() {
	if [ "$staged" = 1 ]; then git reset -q -- "$probe_dir" 2>/dev/null; fi
	rm -rf "$probe_dir" "$log"
}
trap cleanup EXIT
trap 'exit 130' INT TERM

failures=0
rows=()
has_script() { jq -e --arg s "$1" '.scripts[$s] != null' package.json >/dev/null; }
record() { rows+=("$(printf '%-24s %-8s %-8s %s' "$1" "$2" "$3" "$4")"); }

# gate <name> <script> <probe-writer>: clean run must pass, probed run must fail.
gate() {
	local name=$1 script=$2 writer=$3 clean probed verdict
	if ! has_script "$script"; then record "$name" "-" "-" "missing: no \"$script\" script"; failures=$((failures + 1)); return; fi
	if bun run "$script" >"$log" 2>&1; then clean=pass; else clean=FAIL; fi
	mkdir -p "$probe_dir"
	"$writer"
	if bun run "$script" >"$log" 2>&1; then probed=pass; else probed=fail; fi
	rm -rf "$probe_dir"
	if [ "$clean" = pass ] && [ "$probed" = fail ]; then
		verdict=ok
	else
		failures=$((failures + 1))
		[ "$clean" = FAIL ] && verdict="clean tree fails: run 'bun run $script'" || verdict="probe got through"
	fi
	record "$name" "$clean" "$probed" "$verdict"
}

probe_format() { printf 'export const probe = {a:1,b:[1,2,3]}\n' >"$probe_dir/format.ts"; }
probe_lint_ts() { printf 'export function probe(): void {\n\tdebugger;\n}\n' >"$probe_dir/lint.ts"; }
probe_lint_svelte() {
	printf '<script lang="ts">\n\tconst value: unknown = 1;\n\tconst probe = value as number;\n</script>\n\n<p>{probe}</p>\n' >"$probe_dir/Lint.svelte"
}
probe_types_aware() {
	printf 'async function save(): Promise<void> {}\n\nexport function probe(): void {\n\tsave();\n}\n' >"$probe_dir/floating.ts"
}
probe_check_type() { printf '<script lang="ts">\n\tconst count: number = "one";\n</script>\n\n<p>{count}</p>\n' >"$probe_dir/Types.svelte"; }
probe_check_warning() { printf '<img src="/favicon.svg" />\n' >"$probe_dir/A11y.svelte"; }
probe_guardrail() {
	# shellcheck disable=SC2016 # the $ runes are literal Svelte
	printf '<script lang="ts">\n\tlet count = $state(0);\n\t$effect(() => {\n\t\tcount = 1;\n\t});\n</script>\n\n<p>{count}</p>\n' >"$probe_dir/Effect.svelte"
}
probe_test() {
	printf "import { expect, it } from 'vitest';\n\nit('is a planted failure', () => {\n\texpect(1).toBe(2);\n});\n" >"$probe_dir/probe.spec.ts"
}

gate "prettier" format:check probe_format
gate "oxlint (.ts)" lint probe_lint_ts
gate "oxlint (.svelte script)" lint probe_lint_svelte
gate "oxlint type-aware" lint:types probe_types_aware
gate "svelte-check (error)" check probe_check_type
gate "svelte-check (warning)" check probe_check_warning
if [ "$skip_tests" = 0 ]; then gate "vitest" test:unit probe_test; fi
if grep -q 'guardrails' .oxlintrc.json 2>/dev/null; then gate "guardrails (\$effect)" lint probe_guardrail; fi

# Hooks: probed directly, no clean run needed.
if [ -f lefthook.yml ] && git rev-parse --git-dir >/dev/null 2>&1 && ! git diff --cached --quiet; then
	record "pre-commit hook" "-" "-" "not run: other changes are staged; commit or unstage them"; failures=$((failures + 1))
elif [ -f lefthook.yml ] && git rev-parse --git-dir >/dev/null 2>&1; then
	mkdir -p "$probe_dir"
	probe_lint_ts
	git add -f -- "$probe_dir" && staged=1
	if bunx lefthook run pre-commit >"$log" 2>&1; then
		record "pre-commit hook" "-" "pass" "probe got through"; failures=$((failures + 1))
	else
		record "pre-commit hook" "-" "fail" "ok"
	fi
	git reset -q -- "$probe_dir"; staged=0
	rm -rf "$probe_dir"
else
	record "pre-commit hook" "-" "-" "missing: no lefthook.yml or not a git repo"; failures=$((failures + 1))
fi

push_hook=.lefthook/pre-push/block-push-to-main.sh
if [ -f "$push_hook" ]; then
	zero=0000000000000000000000000000000000000000
	if printf 'refs/heads/x %s refs/heads/main %s\n' "$zero" "$zero" | bash "$push_hook" >"$log" 2>&1; then
		record "pre-push (main)" "-" "pass" "push to main got through"; failures=$((failures + 1))
	elif ! printf 'refs/heads/x %s refs/heads/x %s\n' "$zero" "$zero" | bash "$push_hook" >"$log" 2>&1; then
		record "pre-push (main)" "-" "fail" "also refuses other branches"; failures=$((failures + 1))
	else
		record "pre-push (main)" "-" "fail" "ok"
	fi
else
	record "pre-push (main)" "-" "-" "missing: $push_hook"; failures=$((failures + 1))
fi

claude_hook=.claude/hooks/block-dangerous-git.sh
if [ -x "$claude_hook" ]; then
	ask() { printf '{"tool_input":{"command":"%s"}}' "$1" | "$claude_hook" >/dev/null 2>&1; }
	if ask "git push origin main"; then
		record "Claude git hook" "-" "pass" "push to main got through"; failures=$((failures + 1))
	elif ! ask "git push -u origin feature-probe"; then
		record "Claude git hook" "-" "fail" "also refuses a feature branch push"; failures=$((failures + 1))
	else
		record "Claude git hook" "-" "fail" "ok"
	fi
else
	record "Claude git hook" "-" "-" "missing or not executable: $claude_hook"; failures=$((failures + 1))
fi

printf '%-24s %-8s %-8s %s\n' "gate" "clean" "probed" "result"
printf '%s\n' "${rows[@]}"
[ "$failures" = 0 ] && exit 0 || exit 1
