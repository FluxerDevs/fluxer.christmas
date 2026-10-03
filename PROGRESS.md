# fluxer.christmas: feature roadmap progress

Tracks the work requested in `TODO.md`. Update this file at the end of every task and commit at the end of every phase, so the work can be stopped and resumed at any point.

## Current status

- **Current phase:** Phase 2 (Keyboard layout support)
- **Next step:** create `src/lib/game/input.svelte.ts` (key state keyed on `event.code`) and replace `useInputMap` in `src/lib/3d/Player.svelte`.

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

### Phase 2: Keyboard layout support (TODO 2)

- [ ] `src/lib/game/input.svelte.ts`: `event.code`-based key state, bindings, one-shot actions
- [ ] Replace `useInputMap` in `Player.svelte`
- [ ] Layout-aware HUD labels (`navigator.keyboard.getLayoutMap()` plus a fallback layout picker)
- [ ] Settings panel (rebinding, sensitivity) persisted in localStorage

### Phase 3: Backend migration (Docker + GHCR)

- [ ] adapter-node; remove the static/Pages-only config
- [ ] Custom server entry with WebSocket upgrade on `/ws`, plus `/healthz`
- [ ] `src/lib/server/env.ts`, `db.ts` (`node:sqlite`, migrations)
- [ ] `Dockerfile`, `.dockerignore`
- [ ] GitHub Actions: build and push to GHCR (replaces the Pages deploy)
- [ ] `deploy/k8s.yaml` reference for Rancher (single Deployment, PVC)

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
- [ ] Create the GHCR package and the Rancher workload (Phase 3).

## Resume notes

- Fluxer reference source: run `pnpm fluxer:sync` and read `fluxer-reference/` (AGPL, read only, never copy code). The key files are `fluxer_docs/src/content/docs/http-api/oauth2.mdx`, `fluxer_api/src/api/oauth/OAuth2Service.ts`, `fluxer_app/src/features/user/utils/AvatarUtils.ts` and `packages/instance_bootstrap/src/Types.ts`.
- The full plan with per-phase details is in `docs/PLAN.md`. The checklist above is the source of truth for status.
