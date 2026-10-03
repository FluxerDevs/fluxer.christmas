# fluxer.christmas: feature roadmap progress

Tracks the work requested in `TODO.md`. Update this file at the end of every task and commit at the end of every phase, so the work can be stopped and resumed at any point.

## Current status

- **Current phase:** Phase 4 (Fluxer OAuth login)
- **Next step:** write `src/lib/server/fluxer.ts` (discovery via `/.well-known/fluxer`, token exchange and refresh, `/users/@me`), then the `/login` and `/callback` routes.

## Phases

### Phase 0: Bootstrap ✅

- [x] Create `PROGRESS.md`
- [x] Point `scripts/sync-fluxer-source.mjs` at OAuth2, HTTP API, docs and discovery sources. Drop the desktop/injector paths. Gitignore `.fluxer-upstream/`.
- [x] Run `pnpm fluxer:sync` and check that `fluxer-reference/` has `fluxer_docs`, `fluxer_api/src/api/oauth`, etc.
- [x] Pin the Vite dev server to port 4321 (OAuth redirect URI), and update `.vscode/launch.json` to match
- [x] Remove the `src/routes/demo/` scaffolding and replace its e2e test with a smoke test (`src/routes/page.e2e.ts`)

### Phase 1: Gingy cookies (TODO 1) ✅

- [x] Gingy silhouette geometry: an extruded, bevelled outline in `src/lib/3d/gingy/shape.ts`, meshes in `gingy.ts`
- [x] `gingyTexture()` in `textures.ts`: dough, browned rim, icing on wrists/ankles, eyes, eyebrows, grin
- [x] Gumdrop buttons (red and green), instanced with the same matrices as the cookies
- [x] Reused on the coffee-table cookie plate

### Phase 2: Keyboard layout support (TODO 2) ✅

- [x] `src/lib/game/input.svelte.ts`: key state keyed on `event.code`, bindings, layout-aware labels
- [x] Replace `useInputMap` in `Player.svelte`
- [x] Layout-aware HUD labels. The order of preference is: an explicitly chosen layout, then labels learned from `navigator.keyboard.getLayoutMap()` or from keys the player has pressed, then a guess from the browser language.
- [x] Settings panel (`src/lib/ui/SettingsPanel.svelte`, opened from the start/pause overlay): sensitivity, layout, rebinding. Saved via `src/lib/game/storage.ts`.
- [x] e2e: `src/lib/ui/settings.e2e.ts`
- Note: Phases 6 and 7 add their actions (`view`, `interact`) to `ACTIONS`/`DEFAULT_BINDINGS` and to `actionLabels` in `SettingsPanel.svelte`.

### Phase 3: Backend migration (Docker + GHCR) ✅

- [x] adapter-node **v5** (v6 needs SvelteKit 3). Removed the prerender/base-path/Pages config, the hidden locale links and `static/.nojekyll`.
- [x] `server/index.js` (production entry) + `server/upgrade.js`. These route `/ws` upgrades to the handler that `src/lib/server/websocket.ts` registers from the `init` hook in `hooks.server.ts`. A Vite plugin wires the same bridge into `pnpm dev`/`preview`.
- [x] `/healthz` (`src/routes/healthz/+server.ts`) checks that the DB answers
- [x] `src/lib/server/env.ts` (typed runtime config), `db.ts` (`node:sqlite`, `PRAGMA user_version` migrations; tables users, sessions, rooms, invites)
- [x] `Dockerfile` (node:24-alpine, non-root, `/data` volume, healthcheck) and `.dockerignore`
- [x] `.github/workflows/docker.yml`: check + lint, then build and push `ghcr.io/fluxerdevs/fluxer.christmas` (replaces the Pages deploy)
- [x] `deploy/k8s.yaml` (Rancher reference: 1 replica, Recreate, PVC, ingress WebSocket timeouts), `.env.example`, README
- Verified locally: `node server/index.js` serves the page, `/healthz` and `/ws`, and creates the DB. The dev server bridge works too.
- [ ] **Not yet verified:** `docker build` (the Docker daemon wasn't running on the dev machine) and the first CI run to GHCR

### Phase 4: Fluxer OAuth login (TODO 3)

- [ ] `src/lib/server/fluxer.ts` (discovery, token exchange and refresh, `/users/@me`, guilds, CDN URLs)
- [ ] `/login`, `/callback`, `/logout` (state + PKCE S256)
- [ ] Sessions in SQLite, `locals.user` in `hooks.server.ts`
- [ ] User chip in the UI (optional login)

### Phase 5: Temporary whitelist gate (TODO 7)

- [ ] `REQUIRE_LOGIN` + `FLUXER_WHITELIST`
- [ ] WIP screen linking to https://fluxer.gg/dh9m2Iqo, with lazy-loaded 3D

### Phase 6: Player model and third-person view (TODO 4, 5)

- [ ] Procedural `Avatar.svelte` + `AvatarConfig`
- [ ] Idle/walk/run/sit animations
- [ ] Third-person camera with wall collision, toggled with V

### Phase 7: Environment interactions (TODO 6)

- [ ] Interaction registry, raycast, HUD prompt, E key
- [ ] Gifts, sofa sitting, tree lights/ornaments, fireplace, rocking chair, clock, lamps
- [ ] Serializable interaction events (for multiplayer)

### Phase 8: Guild ornaments (logged in)

- [ ] `/api/me/guilds`, `/api/img` proxy
- [ ] Per-guild ornaments with icon or initials, guild name on hover

### Phase 9: Room customization (logged in)

- [ ] Runtime `RoomState` (layout defaults come from `world.ts`)
- [ ] Parameterized wallpaper/floor textures and presets
- [ ] Edit mode: move/rotate furniture, pick wallpaper/floor
- [ ] `GET/PUT /api/room`, validated and saved

### Phase 10: Multiplayer and invites (logged in)

- [ ] Invite links (optional password, expiry, revoke)
- [ ] `/r/[code]` join flow (guest or Fluxer login)
- [ ] WebSocket realtime server (presence, movement, interactions)
- [ ] Remote players with interpolation and name tags
- [ ] Avatar customizer (`PUT /api/me/avatar`)

### Phase 11: Polish

- [ ] i18n (en/es) for all new strings
- [ ] Accessibility pass on overlays
- [ ] README: env vars, Docker, Rancher
- [ ] Playwright e2e and unit tests

## Decisions log

- **Hosting:** a single Docker image (adapter-node plus a custom server with WebSockets), published to GHCR and run as one Rancher workload. SQLite (`node:sqlite`) sits on a mounted volume.
- **OAuth:** Fluxer's token endpoint always requires `client_secret`, so the code exchange happens on the server. PKCE (S256) is used as well. Scopes are `identify guilds`.
- **Friends:** OAuth bearer tokens can't use the relationships API, so "invite friends" means shareable links.
- **Whitelist:** comma-separated Fluxer user IDs in the `FLUXER_WHITELIST` env var.
- **Player model:** procedural (primitives), matching the rest of the scene.
- **Assumption (unconfirmed):** while the gate is on, guests holding a valid invite from a whitelisted host may enter.
- **Keyboard:** movement is bound to `event.code` (physical keys), and labels come from the active layout.

## Environment variables (from Phase 3)

| Name                   | Purpose                                     | Example                         |
| ---------------------- | ------------------------------------------- | ------------------------------- |
| `ORIGIN`               | Public URL of the site                      | `https://fluxer.christmas`      |
| `FLUXER_CLIENT_ID`     | OAuth app id                                | `1555762697700651008`           |
| `FLUXER_CLIENT_SECRET` | OAuth app secret                            | (secret)                        |
| `FLUXER_INSTANCE`      | Fluxer web host for authorize and discovery | `https://web.canary.fluxer.app` |
| `FLUXER_WHITELIST`     | Allowed user IDs while gated                | `123,456`                       |
| `REQUIRE_LOGIN`        | Enables the WIP gate                        | `true`                          |
| `SESSION_SECRET`       | HMAC key for join tickets                   | (random 32+ bytes)              |
| `DATA_DIR`             | SQLite location                             | `/data`                         |

## Manual steps for the owner

- [ ] Add `https://fluxer.christmas/callback` as a redirect URI in the Fluxer application settings.
- [ ] Run `docker build .` once locally, or check the first `docker.yml` CI run after pushing.
- [ ] Create the Rancher workload from `deploy/k8s.yaml` (fill in the Secret). If the GHCR package stays private, add an image pull secret.

## Resume notes

- Fluxer reference source: run `pnpm fluxer:sync` and read `fluxer-reference/` (AGPL, read only, never copy code). The key files are `fluxer_docs/src/content/docs/http-api/oauth2.mdx`, `fluxer_api/src/api/oauth/OAuth2Service.ts`, `fluxer_app/src/features/user/utils/AvatarUtils.ts` and `packages/instance_bootstrap/src/Types.ts`.
- The full plan with per-phase details is in `docs/PLAN.md`. The checklist above is the source of truth for status.
