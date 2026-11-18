#!/usr/bin/env bun
// Picks the newest settled stable version of each package and checks the set for peer and engine conflicts.
//
//   bun resolve-versions.ts [--project DIR] [--min-age-days 7] [--json] [pkg[@version] ...]
//
// With package names, it resolves those, checked against what the project already has installed.
// With none, it audits every direct dependency of the project instead.
// Exit 0: no conflicts. Exit 1: conflicts found. Exit 2: bad arguments or a registry error.

type Packument = {
	'dist-tags': Record<string, string>;
	time: Record<string, string>;
	versions: Record<
		string,
		{
			peerDependencies?: Record<string, string>;
			peerDependenciesMeta?: Record<string, { optional?: boolean }>;
			engines?: Record<string, string>;
		}
	>;
};

type Pick = {
	name: string;
	version: string;
	latest: string;
	ageDays: number;
	source: 'resolved' | 'pinned' | 'installed';
	note: string;
	settled?: string;
	runtime?: boolean;
};

type Conflict = { pkg: string; peer: string; range: string; found: string; hint: string };

const DAY_MS = 86_400_000;
const registry = (Bun.env.NPM_CONFIG_REGISTRY ?? 'https://registry.npmjs.org').replace(/\/$/, '');
const cache = new Map<string, Packument>();

function fail(message: string): never {
	console.error(`resolve-versions: ${message}`);
	process.exit(2);
}

function parseArgs(argv: string[]) {
	const options = { project: '.', minAgeDays: 7, json: false, packages: [] as string[] };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i] ?? '';
		if (arg === '--project') options.project = argv[++i] ?? fail('--project needs a directory');
		else if (arg === '--min-age-days') options.minAgeDays = Number(argv[++i]);
		else if (arg === '--json') options.json = true;
		else if (arg.startsWith('--')) fail(`unknown option ${arg}`);
		else options.packages.push(arg);
	}
	if (!Number.isFinite(options.minAgeDays) || options.minAgeDays < 0) fail('--min-age-days must be a number');
	return options;
}

function splitSpec(spec: string): { name: string; version: string | undefined } {
	const at = spec.lastIndexOf('@');
	if (at > 0) return { name: spec.slice(0, at), version: spec.slice(at + 1) };
	return { name: spec, version: undefined };
}

async function packument(name: string): Promise<Packument> {
	const hit = cache.get(name);
	if (hit) return hit;
	const response = await fetch(`${registry}/${name.replace('/', '%2F')}`);
	if (!response.ok) fail(`${name}: registry answered ${response.status}`);
	const doc = (await response.json()) as Packument;
	cache.set(name, doc);
	return doc;
}

function isStable(version: string): boolean {
	return /^\d+\.\d+\.\d+$/.test(version);
}

function ageDays(doc: Packument, version: string): number {
	const published = doc.time[version];
	return published ? Math.floor((Date.now() - Date.parse(published)) / DAY_MS) : 0;
}

function settledVersions(doc: Packument, minAgeDays: number): string[] {
	const latest = doc['dist-tags'].latest ?? '0.0.0';
	return Object.keys(doc.versions)
		.filter((v) => isStable(v) && Bun.semver.order(v, latest) <= 0 && ageDays(doc, v) >= minAgeDays)
		.sort((a, b) => Bun.semver.order(b, a));
}

async function resolve(name: string, minAgeDays: number): Promise<Pick> {
	const doc = await packument(name);
	const latest = doc['dist-tags'].latest ?? fail(`${name} has no latest tag`);
	const settled = settledVersions(doc, minAgeDays);
	const version = settled[0] ?? latest;
	let note = '';
	if (version !== latest) note = `held back: latest ${latest} is ${ageDays(doc, latest)} days old`;
	else if (settled.length === 0) note = `no release is ${minAgeDays}+ days old; using latest`;
	return { name, version, latest, ageDays: ageDays(doc, version), source: 'resolved', note };
}

async function readJson(path: string): Promise<Record<string, unknown> | undefined> {
	const file = Bun.file(path);
	return (await file.exists()) ? ((await file.json()) as Record<string, unknown>) : undefined;
}

async function installedVersions(project: string): Promise<Map<string, { version: string; runtime: boolean }>> {
	const manifest = await readJson(`${project}/package.json`);
	if (!manifest) return new Map();
	const runtime = new Set(Object.keys((manifest.dependencies as object | undefined) ?? {}));
	const names = [...runtime, ...Object.keys((manifest.devDependencies as object | undefined) ?? {})];
	const found = new Map<string, { version: string; runtime: boolean }>();
	for (const name of names) {
		const installed = await readJson(`${project}/node_modules/${name}/package.json`);
		if (typeof installed?.version === 'string') found.set(name, { version: installed.version, runtime: runtime.has(name) });
	}
	return found;
}

function major(version: string): string {
	return version.split('.')[0] ?? '';
}

async function peerHint(pkg: Pick, peer: string, peerVersion: string, range: string, minAgeDays: number): Promise<string> {
	const hints: string[] = [];
	const peerDoc = await packument(peer);
	const peerFit = settledVersions(peerDoc, minAgeDays).find((v) => Bun.semver.satisfies(v, range));
	if (peerFit) hints.push(`step ${peer} back to ${peerFit}`);
	const doc = await packument(pkg.name);
	const pkgFit = settledVersions(doc, minAgeDays).find((v) => {
		if (major(v) !== major(pkg.version)) return false;
		const theirs = doc.versions[v]?.peerDependencies?.[peer];
		return theirs !== undefined && Bun.semver.satisfies(peerVersion, theirs);
	});
	if (pkgFit) hints.push(`move ${pkg.name} to ${pkgFit}`);
	return hints.length ? hints.join(', or ') : `no settled fix within ${pkg.name} ${major(pkg.version)}.x; decide by hand`;
}

async function findConflicts(picks: Map<string, Pick>, minAgeDays: number): Promise<Conflict[]> {
	const conflicts: Conflict[] = [];
	for (const pick of picks.values()) {
		const meta = (await packument(pick.name)).versions[pick.version];
		for (const [peer, range] of Object.entries(meta?.peerDependencies ?? {})) {
			const other = picks.get(peer);
			const optional = meta?.peerDependenciesMeta?.[peer]?.optional === true;
			if (!other) {
				if (!optional) conflicts.push({ pkg: `${pick.name}@${pick.version}`, peer, range, found: 'missing', hint: `add ${peer}` });
				continue;
			}
			if (Bun.semver.satisfies(other.version, range)) continue;
			const hint = await peerHint(pick, peer, other.version, range, minAgeDays);
			conflicts.push({ pkg: `${pick.name}@${pick.version}`, peer, range, found: other.version, hint });
		}
	}
	return conflicts;
}

async function runtimeVersions(): Promise<Record<string, string>> {
	const versions: Record<string, string> = { bun: Bun.version };
	const node = Bun.which('node');
	if (node) {
		const out = await new Response(Bun.spawn([node, '--version']).stdout).text();
		versions.node = out.trim().replace(/^v/, '');
	}
	return versions;
}

async function engineProblems(picks: Map<string, Pick>): Promise<string[]> {
	const runtimes = await runtimeVersions();
	const problems: string[] = [];
	for (const pick of picks.values()) {
		const engines = (await packument(pick.name)).versions[pick.version]?.engines ?? {};
		for (const [engine, range] of Object.entries(engines)) {
			const have = runtimes[engine];
			if (have && !Bun.semver.satisfies(have, range)) problems.push(`${pick.name}@${pick.version} wants ${engine} ${range}, have ${have}`);
		}
	}
	return problems;
}

async function main() {
	const options = parseArgs(Bun.argv.slice(2));
	const installed = await installedVersions(options.project);
	const picks = new Map<string, Pick>();

	for (const [name, { version, runtime }] of installed) {
		const doc = await packument(name);
		const latest = doc['dist-tags'].latest ?? version;
		picks.set(name, { name, version, latest, ageDays: ageDays(doc, version), source: 'installed', note: '', runtime });
	}

	const auditing = options.packages.length === 0;
	if (auditing && installed.size === 0) fail('no packages given and no installed dependencies found');

	for (const spec of options.packages) {
		const { name, version } = splitSpec(spec);
		if (version) {
			const doc = await packument(name);
			if (!doc.versions[version]) fail(`${name}@${version} does not exist`);
			picks.set(name, { name, version, latest: doc['dist-tags'].latest ?? version, ageDays: ageDays(doc, version), source: 'pinned', note: 'pinned' });
		} else {
			picks.set(name, await resolve(name, options.minAgeDays));
		}
	}

	if (auditing) {
		for (const pick of picks.values()) {
			if (pick.ageDays >= options.minAgeDays) continue;
			const settled = await resolve(pick.name, options.minAgeDays);
			if (settled.version === pick.version) continue;
			pick.settled = settled.version;
			pick.note = `installed release is ${pick.ageDays} days old; settled is ${settled.version}`;
		}
	}

	const conflicts = await findConflicts(picks, options.minAgeDays);
	const engines = await engineProblems(picks);
	const chosen = [...picks.values()].filter((p) => p.source !== 'installed' || p.note !== '');

	if (options.json) {
		console.log(JSON.stringify({ picks: [...picks.values()], conflicts, engines }, null, 2));
	} else {
		console.log(`Versions (settled = stable and ${options.minAgeDays}+ days old)`);
		for (const p of chosen) console.log(`  ${p.name}@${p.version}  [${p.source}, latest ${p.latest}, ${p.ageDays}d]${p.note ? `  ${p.note}` : ''}`);
		console.log(conflicts.length ? 'Peer conflicts' : 'Peer conflicts: none');
		for (const c of conflicts) console.log(`  ${c.pkg} wants ${c.peer} ${c.range}, found ${c.found}. Hint: ${c.hint}`);
		console.log(engines.length ? 'Engine problems' : 'Engine problems: none');
		for (const e of engines) console.log(`  ${e}`);
		const toAdd = [...picks.values()].filter((p) => p.source !== 'installed').map((p) => `${p.name}@${p.version}`);
		if (toAdd.length) console.log(`Install: bun add -d ${toAdd.join(' ')}`);
		const back = [...picks.values()].filter((p) => p.settled);
		const dev = back.filter((p) => !p.runtime).map((p) => `${p.name}@${p.settled}`);
		const run = back.filter((p) => p.runtime).map((p) => `${p.name}@${p.settled}`);
		if (dev.length) console.log(`Step back: bun add -d ${dev.join(' ')}`);
		if (run.length) console.log(`Step back: bun add ${run.join(' ')}`);
	}

	process.exit(conflicts.length || engines.length ? 1 : 0);
}

await main();
