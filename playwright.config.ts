import { defineConfig } from '@playwright/test';
import { E2E_TESTER, e2eDataDir } from './e2e/fixtures';

/**
 * Runs the production server (`pnpm build` first; `pnpm test:e2e` does that), once
 * with the work-in-progress gate off and once with it on.
 */
const server = (port: number, requireLogin: boolean) => ({
	command: 'node --disable-warning=ExperimentalWarning server/index.js',
	port,
	env: {
		PORT: String(port),
		ORIGIN: `http://localhost:${port}`,
		REQUIRE_LOGIN: String(requireLogin),
		FLUXER_WHITELIST: E2E_TESTER,
		// Not under test-results/, which Playwright empties on every run.
		DATA_DIR: e2eDataDir(port),
		SESSION_SECRET: 'e2e'
	}
});

export default defineConfig({
	webServer: [server(4173, false), server(4174, true)],
	projects: [
		{
			name: 'open',
			testMatch: '**/*.e2e.{ts,js}',
			testIgnore: '**/*.gate.e2e.ts',
			use: { baseURL: 'http://localhost:4173' }
		},
		{
			name: 'gated',
			testMatch: '**/*.gate.e2e.ts',
			use: { baseURL: 'http://localhost:4174' }
		}
	]
});
