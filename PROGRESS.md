# fluxer.christmas: feature roadmap progress

Tracks the work requested in `TODO.md`. Update this file at the end of every task and commit at the end of every phase, so the work can be stopped and resumed at any point.

## Current status

- **Current phase:** Phase 6 (Player model and third-person view), not started
- **Next step:** `src/lib/game/avatar.ts` (`AvatarConfig`) and `src/lib/3d/avatar/Avatar.svelte`, then the third-person camera in `Camera.svelte`.

## Phases

### Phase 0: Bootstrap ✅

- [x] Create `PROGRESS.md`
- [x] Point `scripts/sync-fluxer-source.mjs` at OAuth2, HTTP API, docs and discovery sources. Drop the desktop/injector paths. Gitignore `.fluxer-upstream/`.
- [x] Run `pnpm fluxer:sync` and check that `fluxer-reference/` has `fluxer_docs`, `fluxer_api/src/api/oauth`, etc.
- [x] Pin the Vite dev server to port 4321 (OAuth redirect URI), and update `.vscode/launch.json` to match
- [x] Remove the `src/routes/demo/` scaffolding and replace its e2e test with a smoke test (`src/routes/page.e2e.ts`)

### Phase 1: Gingy cookies (TODO 1) ✅

- [x] Cookies use the **Gingy (Shrek) model**, `static/models/gingy.glb` (CC BY 4.0, tannersprague938). The README and the Settings panel credit it.
- [x] `src/lib/3d/gingy.ts` loads it once with `GLTFLoader`, turns it upright facing +Z (the raw mesh is upside down; the file's root node would lay it flat), scales it to 0.2 m and fills `InstancedMesh` batches that stay hidden until it loads
- [x] Used on the tree (14, scale 0.9) and the coffee-table plate (5, lying face up)
- The first version was procedural (extruded outline + canvas icing texture). It was replaced by the model; see git history before this change.

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

### Phase 4: Fluxer OAuth login (TODO 3) ✅

- [x] `src/lib/server/fluxer.ts`: discovery from `${FLUXER_INSTANCE}/.well-known/fluxer` (cached 1 h), code exchange and refresh, revoke, `/users/@me`, `/users/@me/guilds`, avatar and guild icon URLs
- [x] `/login` (state + PKCE S256 in a 10-minute httpOnly cookie, `?returnTo=`), `/callback` (errors go back with `?login_error=denied|expired|failed`), `/logout` (POST only; revokes the refresh token)
- [x] Sessions in SQLite (`src/lib/server/session.ts`): the cookie holds a random token and the DB stores its SHA-256 and the Fluxer tokens. Access tokens refresh when they have less than a day left, deduplicated per session. `invalid_grant` ends the session.
- [x] `hooks.server.ts` sets `locals.session`/`locals.user`. `+layout.server.ts` exposes `user` to pages.
- [x] `AccountChip.svelte` on the start/pause overlay (log in, or avatar + name + log out)
- [x] e2e: `src/routes/login/login.e2e.ts` (needs network for discovery)
- Verified: the authorize URL matches the registered one plus state/PKCE. The token endpoint accepts the request format (with a fake secret it answers `invalid_client`). A seeded session renders the chip, and logout clears it.
- [ ] **Needs the real `FLUXER_CLIENT_SECRET`** in `.env` to test a full round trip
- Discovery: `https://canary.fluxer.com/.well-known/fluxer` → webapp `web.canary.fluxer.app`, API `api.canary.fluxer.app`, media `fluxerusercontent.com`, static `fluxerstatic.com`. `web.canary.fluxer.app` itself does **not** serve `/.well-known/fluxer`.

### Phase 5: Temporary whitelist gate (TODO 7) ✅

- [x] `REQUIRE_LOGIN` (default on) + `FLUXER_WHITELIST`, checked in `src/lib/server/access.ts` and `src/routes/+page.server.ts`
- [x] `WipScreen.svelte` (link to https://fluxer.gg/dh9m2Iqo, login, "not on the tester list" for logged-in non-testers). The 3D experience moved to `src/lib/Experience.svelte` and is lazy-imported only for allowed visitors.
- [x] e2e: Playwright runs the production server twice (gate off on :4173, on on :4174). `e2e/fixtures.ts` seeds sessions in the DB. Gate tests are in `src/routes/wip.gate.e2e.ts`.
- [ ] Invite holders bypass the gate (Phase 10, pending the owner's confirmation)

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
- **Hosting, for now (owner's decision, 2026-10-02):** the site stays on **GitHub Pages** until the owner switches infra by hand. `deploy.yml` builds `DEPLOY_TARGET=static` (adapter-static, prerendered, no server features; the WIP screen shows unless the repo variable `REQUIRE_LOGIN=false`). `docker.yml` (GHCR) is `workflow_dispatch` only. **Don't make it automatic until the owner says so.** Server-only features (login, rooms, multiplayer) only work in the Node build, so the static build must keep compiling: guard server-only UI with `__STATIC_SITE__`.
- **OAuth:** Fluxer's token endpoint always requires `client_secret`, so the code exchange happens on the server. PKCE (S256) is used as well. Scopes are `identify guilds`.
- **Friends:** OAuth bearer tokens can't use the relationships API, so "invite friends" means shareable links.
- **Whitelist:** comma-separated Fluxer user IDs in the `FLUXER_WHITELIST` env var.
- **Player model:** procedural (primitives), matching the rest of the scene.
- **Assumption (unconfirmed):** while the gate is on, guests holding a valid invite from a whitelisted host may enter.
- **Keyboard:** movement is bound to `event.code` (physical keys), and labels come from the active layout.

## Environment variables (from Phase 3)

| Name                   | Purpose                                       | Example                     |
| ---------------------- | --------------------------------------------- | --------------------------- |
| `ORIGIN`               | Public URL of the site                        | `https://fluxer.christmas`  |
| `FLUXER_CLIENT_ID`     | OAuth app id                                  | `1555762697700651008`       |
| `FLUXER_CLIENT_SECRET` | OAuth app secret                              | (secret)                    |
| `FLUXER_INSTANCE`      | Instance origin serving `/.well-known/fluxer` | `https://canary.fluxer.com` |
| `FLUXER_WHITELIST`     | Allowed user IDs while gated                  | `123,456`                   |
| `REQUIRE_LOGIN`        | Enables the WIP gate                          | `true`                      |
| `SESSION_SECRET`       | HMAC key for join tickets                     | (random 32+ bytes)          |
| `DATA_DIR`             | SQLite location                               | `/data`                     |

## Manual steps for the owner

- [ ] Add `https://fluxer.christmas/callback` as a redirect URI in the Fluxer application settings.
- [ ] Run `docker build .` once locally, or check the first `docker.yml` CI run after pushing.
- [ ] Create the Rancher workload from `deploy/k8s.yaml` (fill in the Secret). If the GHCR package stays private, add an image pull secret.

## Resume notes

- Fluxer reference source: run `pnpm fluxer:sync` and read `fluxer-reference/` (AGPL, read only, never copy code). The key files are `fluxer_docs/src/content/docs/http-api/oauth2.mdx`, `fluxer_api/src/api/oauth/OAuth2Service.ts`, `fluxer_app/src/features/user/utils/AvatarUtils.ts` and `packages/instance_bootstrap/src/Types.ts`.
- The full plan with per-phase details is in `docs/PLAN.md`. The checklist above is the source of truth for status.
