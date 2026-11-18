// Repo guardrails: each rule bans a pattern agents misuse and names the fix in its error.
// Add a rule here when the same correction comes up twice.

const EFFECT_HOME = 'src/lib/effects/';
const TIMER_HOME = 'src/lib/timing/';

function isShadowed(sourceCode, node, name) {
	for (let scope = sourceCode.getScope(node); scope; scope = scope.upper) {
		const variable = scope.set.get(name);
		if (variable && variable.defs.length > 0) return true;
	}
	return false;
}

const noEffect = {
	meta: {
		type: 'problem',
		docs: { description: 'Keep $effect out of product code' },
		schema: [],
		messages: {
			effect:
				'`{{name}}` is reserved for syncing with something outside Svelte. Compute values with `$derived`, ' +
				'react to the user in the event handler, load data in `load` or `{#await}`, and attach DOM behaviour ' +
				`with \`{@attach}\`. A genuine outside sync goes in a helper under ${EFFECT_HOME} that components call.`
		}
	},
	create(context) {
		return {
			CallExpression(node) {
				const { callee } = node;
				if (callee.type === 'Identifier' && callee.name === '$effect') {
					context.report({ node, messageId: 'effect', data: { name: '$effect' } });
				} else if (
					callee.type === 'MemberExpression' &&
					callee.object.type === 'Identifier' &&
					callee.object.name === '$effect' &&
					callee.property.type === 'Identifier' &&
					(callee.property.name === 'pre' || callee.property.name === 'root')
				) {
					context.report({ node, messageId: 'effect', data: { name: `$effect.${callee.property.name}` } });
				}
			}
		};
	}
};

const TIMERS = new Set(['setTimeout', 'setInterval', 'requestAnimationFrame', 'requestIdleCallback']);
const GLOBAL_OBJECTS = new Set(['window', 'globalThis', 'self']);

const noTimers = {
	meta: {
		type: 'problem',
		docs: { description: 'Keep raw timers out of client code' },
		schema: [],
		messages: {
			timer:
				'`{{name}}` here usually papers over an ordering problem. Wait for the DOM with `await tick()`, animate ' +
				'with transitions or `svelte/motion`, and fix the order of updates instead of delaying one. A real ' +
				`schedule (polling, debounce, auto-dismiss) goes through a helper under ${TIMER_HOME} that clears itself.`
		}
	},
	create(context) {
		const { sourceCode } = context;
		return {
			CallExpression(node) {
				const { callee } = node;
				let name;
				if (callee.type === 'Identifier' && TIMERS.has(callee.name)) {
					if (isShadowed(sourceCode, node, callee.name)) return;
					name = callee.name;
				} else if (
					callee.type === 'MemberExpression' &&
					callee.object.type === 'Identifier' &&
					GLOBAL_OBJECTS.has(callee.object.name) &&
					callee.property.type === 'Identifier' &&
					TIMERS.has(callee.property.name)
				) {
					name = `${callee.object.name}.${callee.property.name}`;
				}
				if (name) context.report({ node, messageId: 'timer', data: { name } });
			}
		};
	}
};

const plugin = { meta: { name: 'guardrails' }, rules: { 'no-effect': noEffect, 'no-timers': noTimers } };

// Oxlint loads the plugin itself (`jsPlugins` in .oxlintrc.json) and scopes it with `overrides`.
export default plugin;

// ESLint spreads this config. Server code, tests, and each rule's own helper folder are exempt.
const SERVER_AND_TESTS = [
	'src/lib/server/**',
	'src/**/*.server.{ts,js}',
	'src/**/+server.{ts,js}',
	'src/**/*.{test,spec}.{ts,js}'
];

export const guardrails = [
	{
		files: ['src/**/*.{svelte,ts,js}'],
		ignores: SERVER_AND_TESTS,
		plugins: { guardrails: plugin },
		rules: {
			'guardrails/no-effect': 'error',
			'guardrails/no-timers': 'error'
		}
	},
	{ files: [`${EFFECT_HOME}**`], rules: { 'guardrails/no-effect': 'off' } },
	{ files: [`${TIMER_HOME}**`], rules: { 'guardrails/no-timers': 'off' } }
];
