// Fetches the parts of the Fluxer monorepo that fluxer.christmas builds on
// (OAuth2, the HTTP API, media URLs) without downloading the rest, so they can
// be read offline. Re-run it to update.
//
//   .fluxer-upstream/   sparse, blobless, shallow git clone (git state; never edit)
//   fluxer-reference/   plain copy of the useful files plus FLUXER_SOURCE.md,
//                       brought in line with the clone on every run (read this one)
//
// Usage: node scripts/sync-fluxer-source.mjs [--ref <branch|tag|sha>]
//
// Fluxer is AGPL-3.0. Both folders are gitignored: read the code to understand
// Fluxer's behaviour, but don't copy it into fluxer.christmas.
import { spawnSync } from 'node:child_process';
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY = 'https://github.com/fluxerapp/fluxer.git';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const upstream = resolve(root, '.fluxer-upstream');
const reference = resolve(root, 'fluxer-reference');
const MARKER = 'FLUXER_SOURCE.md';

// Paths in the Fluxer repo to download. A trailing "/" means a whole directory.
const INCLUDE = [
	['README.md', 'Project overview'],
	['LICENSE', "Fluxer's license (AGPL-3.0)"],
	[
		'fluxer_docs/src/content/docs/',
		'Public docs: OAuth2, HTTP API (users, guilds, invites), media proxy, discovery'
	],
	[
		'fluxer_api/src/api/oauth/',
		'OAuth2 server: authorize/consent, token exchange, PKCE, refresh, scopes'
	],
	[
		'fluxer_api/src/api/middleware/OAuth2ScopeMiddleware.ts',
		'Which routes a bearer token may call, per scope'
	],
	['fluxer_api/src/api/user/controllers/', '/users/@me, guild list and relationship routes'],
	['packages/schema/src/domains/oauth/', 'OAuth2 request and response schemas'],
	['packages/errors/src/domains/oauth/', 'OAuth2 error codes'],
	['packages/hono/src/middleware/Cors.ts', 'API CORS behaviour'],
	['packages/instance_bootstrap/', 'Shape of the /.well-known/fluxer discovery document'],
	['packages/constants/src/', 'Shared constants, including the OAuth2 scope list'],
	['fluxer_app/src/', 'Web client: OAuth authorize page, avatar/icon URL helpers, runtime config'],
	['fluxer_app/scripts/build/', 'Web client build config (static CDN host and other defaults)'],
	[
		'fluxer_app_proxy/src/csp.rs',
		'Content-Security-Policy served with the web client (API and media hosts)'
	]
];

// Never downloaded, even inside an included directory: binary assets,
// translations and data files add size without helping.
const SKIP_DOWNLOAD = [
	'png',
	'jpg',
	'jpeg',
	'gif',
	'webp',
	'avif',
	'ico',
	'icns',
	'bmp',
	'svg',
	'mp3',
	'ogg',
	'wav',
	'flac',
	'mp4',
	'webm',
	'mov',
	'woff',
	'woff2',
	'ttf',
	'otf',
	'eot',
	'wasm',
	'node',
	'dll',
	'so',
	'dylib',
	'exe',
	'zip',
	'gz',
	'onnx',
	'tflite',
	'bin',
	'po',
	'pot',
	'lottie'
];
const SKIP_DOWNLOAD_PATHS = [
	'fluxer_app/src/features/i18n/locales/',
	'fluxer_app/src/media/data/emojis.json',
	'fluxer_docs/src/content/docs/admin-api/'
];

// Downloaded, but left out of fluxer-reference/ as noise.
const SKIP_REFERENCE = [
	/\.(test|spec)\.[cm]?[jt]sx?$/,
	/\.stories\.[jt]sx?$/,
	/\.snap$/,
	/(^|\/)__(tests|snapshots|mocks)__\//
];

function parseArguments(argv) {
	const options = { ref: 'HEAD' };
	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === '--ref' && argv[index + 1]) options.ref = argv[++index];
		else if (argument.startsWith('--ref=')) options.ref = argument.slice(6);
		else if (argument === '--help' || argument === '-h') {
			console.log('Usage: node scripts/sync-fluxer-source.mjs [--ref <branch|tag|sha>]');
			process.exit(0);
		} else throw new Error(`unknown_argument:${argument}`);
	}
	return options;
}

function git(args, { cwd = upstream, capture = false } = {}) {
	const result = spawnSync('git', args, {
		cwd,
		encoding: 'utf8',
		stdio: capture ? ['ignore', 'pipe', 'inherit'] : 'inherit'
	});
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed (${result.status})`);
	return capture ? result.stdout.trim() : '';
}

function sparsePatterns() {
	return [
		...INCLUDE.map(([path]) => `/${path}`),
		...SKIP_DOWNLOAD.map((extension) => `!*.${extension}`),
		...SKIP_DOWNLOAD_PATHS.map((path) => `!/${path}`)
	];
}

function matchesPath(path, pattern) {
	return pattern.endsWith('/') ? path.startsWith(pattern) : path === pattern;
}

function isIncluded(path) {
	const extension = path.slice(path.lastIndexOf('.') + 1).toLowerCase();
	if (path.includes('.') && SKIP_DOWNLOAD.includes(extension)) return false;
	if (SKIP_DOWNLOAD_PATHS.some((pattern) => matchesPath(path, pattern))) return false;
	return INCLUDE.some(([include]) => matchesPath(path, include));
}

async function ensureClone() {
	if (existsSync(join(upstream, '.git'))) {
		const remote = git(['remote', 'get-url', 'origin'], { capture: true });
		if (remote !== REPOSITORY) throw new Error(`unexpected_upstream_remote:${remote}`);
		return;
	}
	if (existsSync(upstream)) throw new Error(`${upstream} exists but is not a git clone; remove it`);
	git(
		[
			'clone',
			'--filter=blob:none',
			'--depth=1',
			'--no-checkout',
			'-c',
			'core.longpaths=true',
			'-c',
			'core.autocrlf=false',
			REPOSITORY,
			upstream
		],
		{ cwd: root }
	);
}

async function currentCommit() {
	const result = spawnSync('git', ['rev-parse', '--verify', '-q', 'HEAD'], {
		cwd: upstream,
		encoding: 'utf8'
	});
	// A fresh --no-checkout clone has HEAD but no index yet.
	const hasIndex = existsSync(join(upstream, '.git', 'index'));
	return result.status === 0 && hasIndex ? result.stdout.trim() : undefined;
}

async function listFiles(folder) {
	const found = [];
	for (const entry of await readdir(folder, { withFileTypes: true })) {
		if (entry.name === '.git') continue;
		const path = join(folder, entry.name);
		if (entry.isDirectory()) found.push(...(await listFiles(path)));
		else if (entry.isFile()) found.push(path);
	}
	return found;
}

async function removeEmptyDirectories(folder) {
	for (const entry of await readdir(folder, { withFileTypes: true })) {
		if (!entry.isDirectory()) continue;
		const path = join(folder, entry.name);
		await removeEmptyDirectories(path);
		if ((await readdir(path)).length === 0) await rm(path, { recursive: true });
	}
}

// Syncs in place rather than deleting the folder: on Windows the folder can't
// be removed while a terminal or Explorer window has it open.
async function rebuildReference(files) {
	if (existsSync(reference) && !existsSync(join(reference, MARKER)))
		throw new Error(
			`${reference} exists but was not created by this script; refusing to overwrite it`
		);
	await mkdir(reference, { recursive: true });
	const wanted = new Set(files.map((file) => join(reference, relative(upstream, file))));
	wanted.add(join(reference, MARKER));
	for (const existing of await listFiles(reference))
		if (!wanted.has(existing)) await rm(existing, { force: true });
	await removeEmptyDirectories(reference);
	let bytes = 0;
	for (const file of files) {
		const target = join(reference, relative(upstream, file));
		await mkdir(dirname(target), { recursive: true });
		await cp(file, target);
		bytes += (await stat(file)).size;
	}
	return bytes;
}

function describeChanges(previous, next) {
	if (!previous) return 'First sync; no previous commit to compare with.';
	if (previous === next) return 'No upstream changes since the previous sync.';
	const lines = git(['diff', '--name-status', '--no-renames', previous, next], {
		capture: true
	})
		.split('\n')
		.filter(Boolean)
		.map((line) => line.split('\t'))
		.filter(([, path]) => isIncluded(path));
	if (lines.length === 0)
		return `Upstream moved from \`${previous.slice(0, 12)}\`, but none of the synced files changed.`;
	const names = { A: 'added', D: 'deleted', M: 'modified', T: 'type changed' };
	return [
		`Changed since \`${previous.slice(0, 12)}\` (${lines.length} files):`,
		'',
		...lines.map(([status, path]) => `- ${names[status[0]] ?? status}: \`${path}\``)
	].join('\n');
}

async function main() {
	const options = parseArguments(process.argv.slice(2));
	await ensureClone();
	const previous = await currentCommit();

	git(['sparse-checkout', 'set', '--no-cone', ...sparsePatterns()]);
	git(['fetch', '--depth=1', '--filter=blob:none', 'origin', options.ref]);
	const next = git(['rev-parse', 'FETCH_HEAD'], { capture: true });
	git(['reset', '--hard', '--quiet', next]);
	const committed = git(['show', '-s', '--format=%cI', next], {
		capture: true
	});

	const downloaded = await listFiles(upstream);
	const kept = downloaded.filter((file) => {
		const path = relative(upstream, file).split(sep).join('/');
		return !SKIP_REFERENCE.some((pattern) => pattern.test(path));
	});
	const bytes = await rebuildReference(kept);
	const changes = describeChanges(previous, next);

	const license = existsSync(join(upstream, 'LICENSE'))
		? (await readFile(join(upstream, 'LICENSE'), 'utf8'))
				.split('\n')
				.find((line) => line.trim())
				?.trim()
		: undefined;

	await writeFile(
		join(reference, MARKER),
		[
			'# Fluxer reference source',
			'',
			"Generated by `scripts/sync-fluxer-source.mjs`. Don't edit: every run overwrites these files and removes anything that isn't synced.",
			'',
			`- Upstream: ${REPOSITORY.replace(/\.git$/, '')}`,
			`- Commit: [\`${next.slice(0, 12)}\`](${REPOSITORY.replace(/\.git$/, '')}/commit/${next}) (committed ${committed})`,
			`- Requested ref: \`${options.ref}\``,
			`- Synced: ${new Date().toISOString()}`,
			`- Files: ${kept.length} (${(bytes / 1024 / 1024).toFixed(1)} MB)`,
			'',
			`**License:** ${license ?? 'see LICENSE'}. This folder is gitignored and for reading only. Don't copy code from it into fluxer.christmas.`,
			'',
			"## What's included",
			'',
			'| Path | Why |',
			'|---|---|',
			...INCLUDE.map(([path, why]) => `| \`${path}\` | ${why} |`),
			'',
			`Never downloaded: ${SKIP_DOWNLOAD.map((extension) => `\`.${extension}\``).join(', ')} files, and ${SKIP_DOWNLOAD_PATHS.map((path) => `\`${path}\``).join(', ')}. Tests, stories and snapshots are downloaded but left out of this folder.`,
			'',
			'## Changes',
			'',
			changes,
			''
		].join('\n')
	);

	console.log(
		`\nFluxer ${next.slice(0, 12)} → fluxer-reference/ (${kept.length} files, ${(bytes / 1024 / 1024).toFixed(1)} MB)`
	);
	console.log(changes);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
