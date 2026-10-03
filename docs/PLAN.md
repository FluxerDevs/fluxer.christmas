# Plan: fluxer.christmas feature roadmap (TODO.md)

## Context

fluxer.christmas is a SvelteKit + Threlte first-person cozy room. It's built statically and deployed to GitHub Pages. Every object is procedural (primitives plus canvas textures), and there's no backend, persistence or interaction system. TODO.md asks for cosmetic and gameplay features (Gingy cookies, keyboard layouts, third-person view, player model, interactions) and for features that need a server: Fluxer OAuth, a whitelist gate, saved rooms, guild ornaments and real-time multiplayer.

Findings that shape the plan:

- **Fluxer's token endpoint always requires `client_secret`.** PKCE is only an extra check, so the code exchange must happen on a server.
- **Bearer tokens can't use the relationships API.** "Invite friends" therefore means share links, not a friend picker.
- **Available scopes:** `identify email guilds connections bot`. We only need `identify guilds`.
- **API host:** discover it via `GET https://<host>/.well-known/fluxer` (`endpoints.api_public`, `media`). The token endpoint is `POST /v1/oauth2/token`. Access tokens last 7 days and refresh tokens 30 days.
- **Keyboard input:** `Player.svelte` uses Threlte's `useInputMap`, which matches `event.key`, so AZERTY/Dvorak users get the wrong keys.

**Decisions (confirmed with you):**

- **Hosting:** one Docker image (adapter-node plus a custom server that also handles WebSockets), built and pushed to GHCR by GitHub Actions and run as a single Rancher workload.
- **Storage:** SQLite on a volume, using the built-in `node:sqlite` so there are no native dependencies.
- **Whitelist:** env var of Fluxer user IDs.
- **Player model:** procedural.

**Assumption to confirm:** while the gate is on, guests holding a valid invite link from a whitelisted host may enter. The invite counts as the host's authorization.

---

## Phase 0: Bootstrap and progress tracking

- Create **`PROGRESS.md`** at the repo root. It holds:
  - the phase checklist below, with sub-task checkboxes
  - a "Current phase / next step" header
  - a decisions log
  - the env-var table
  - a "Resume notes" section
- Update it at the end of every task, and commit at the end of each phase.
- Extend `scripts/sync-fluxer-source.mjs`:
  - Fix the header comment, which was copied from another project.
  - Add these paths to `INCLUDE`:
    - `fluxer_docs/src/content/docs/` (http-api/oauth2, users, guilds, media-proxy, index)
    - `fluxer_api/src/api/oauth/`
    - `fluxer_api/src/api/middleware/OAuth2ScopeMiddleware.ts`
    - `fluxer_api/src/api/user/controllers/`
    - `packages/schema/src/domains/oauth/`
    - `packages/errors/src/domains/oauth/`
    - `packages/hono/src/middleware/Cors.ts`
    - `packages/instance_bootstrap/`
  - Run `pnpm fluxer:sync` and check that `fluxer-reference/` contains them.
- Set the Vite dev server port to **4321** (`server.port`, `strictPort`) so it matches the registered redirect URI.
- Remove the `src/routes/demo/` scaffolding.

## Phase 1: Gingy cookies (TODO 1)

- In `src/lib/3d/furniture/ChristmasTree.svelte` (L127-153), replace `gingerbreadGeometry()`. The new shape is a Gingy silhouette:
  - Built as a `Shape` + `ExtrudeGeometry` with a bevel: big round head, stubby arms, splayed legs, slightly tilted pose.
  - Material: a baked-dough color map from a new `gingyTexture()` in `src/lib/3d/textures.ts`, reusing the `make()` cache. The map includes darker edge browning.
  - Decorations: white icing lines on the wrists and ankles, a wavy smile, two gumdrop buttons (red and green), eyes and eyebrows.
  - Do the decorations as a canvas texture on the front face plus small instanced gumdrop meshes.
- Keep the instancing and placement logic.
- Optionally reuse the shape for the coffee-table cookie plate (`CoffeeTable.svelte` L108-113).

## Phase 2: Keyboard layout support (TODO 2)

- New module `src/lib/game/input.svelte.ts`. It's our own key-state tracker keyed on **`event.code`** (physical position: `KeyW`, `KeyA`, `ShiftLeft`, …), so ZQSD on AZERTY works automatically.
  - Exposes `pressed(action)`, `vector()`, an action→codes binding map and `onAction(action, cb)` for one-shot keys (E, V, etc.).
  - Clears all keys on blur and when pointer lock is lost.
- Replace `useInputMap` in `src/lib/3d/Player.svelte` L19-29.
- Make the HUD key labels (`src/lib/ui/HUD.svelte` L17) layout-aware. Use `navigator.keyboard.getLayoutMap()` when available (Chromium). Otherwise fall back to the QWERTY label plus a layout picker (QWERTY/AZERTY/QWERTZ/Dvorak) stored in localStorage.
- Add a small settings panel in the pause overlay for rebinding, persisted in localStorage. It also holds the existing `game.sensitivity`.

## Phase 3: Backend migration (Docker + GHCR)

- Switch from `@sveltejs/adapter-static` to `@sveltejs/adapter-node` in `vite.config.ts`:
  - Remove the `BASE_PATH` and `fallback` logic.
  - Drop the global `prerender = true` (`src/routes/+layout.ts`). Keep `ssr = false` only on the 3D page.
  - Also remove the hidden prerender-crawl `<a>` links in `src/routes/+layout.svelte` (L19-23); they only exist for prerendering.
- Add `server/index.ts`, a custom Node entry point. It creates an `http` server, mounts the SvelteKit `handler` from `build/handler.js`, and attaches a `ws` WebSocketServer on `/ws`. Multiplayer gets wired in during Phase 10.
- Add `/healthz`.
- Add the `src/lib/server/` modules:
  - `env.ts`: typed `$env/dynamic/private` with these vars:
    - `ORIGIN`
    - `FLUXER_CLIENT_ID`
    - `FLUXER_CLIENT_SECRET`
    - `FLUXER_INSTANCE` (default `https://web.canary.fluxer.app`)
    - `FLUXER_WHITELIST`
    - `REQUIRE_LOGIN`
    - `DATA_DIR`
    - `SESSION_SECRET`
  - `db.ts`: `node:sqlite` with a simple ordered migration runner. Tables:
    - `users` (id, username, avatar, avatar_custom JSON)
    - `sessions` (id hash, user_id, access/refresh tokens, expires)
    - `rooms` (owner_id, layout JSON, version)
    - `invites` (code, owner_id, password_hash, expires_at, revoked)
- Add a multi-stage `Dockerfile` (node:24-alpine, corepack pnpm, build, `pnpm deploy --prod`) and a `.dockerignore`. It runs as a non-root user, exposes 3000 and uses a `VOLUME /data`.
- Replace `.github/workflows/deploy.yml` with `docker.yml`:
  - Runs check, lint and build.
  - Builds with docker/build-push-action and pushes to `ghcr.io/<owner>/fluxer.christmas` with tags `latest`, `sha-*` and semver tags.
- Add `deploy/k8s.yaml` as a reference for Rancher: one Deployment with `replicas: 1` and the `Recreate` strategy (SQLite), a PVC, a Service, an Ingress with WebSocket timeouts, and a Secret.

## Phase 4: Fluxer OAuth login (TODO 3)

- `src/lib/server/fluxer.ts`:
  - discovery (`/.well-known/fluxer`, cached)
  - `exchangeCode`, `refreshToken`, `getMe`, `getGuilds`
  - `avatarUrl` / `iconUrl` builders using the `media` endpoint
- Routes:
  - `/login`: generate `state` + a PKCE S256 verifier, store them in a short-lived httpOnly cookie, then redirect to `{instance}/oauth2/authorize?scope=identify+guilds…` with `redirect_uri = ${ORIGIN}/callback`.
  - `/callback`: verify `state`, exchange the code server-side, upsert the user, create a session (random id, store its hash), set an httpOnly SameSite=Lax cookie and redirect to `/`.
  - `/logout`: POST.
- `src/hooks.server.ts`: add a `handle` before the paraglide middleware that resolves `locals.user` and refreshes tokens when close to expiry. Type `App.Locals` in `src/app.d.ts`.
- Make sure `/callback`, `/login` and `/api/*` are not locale-prefixed. Check the `reroute` in `src/hooks.ts`.
- Add a UI user chip to StartOverlay/HUD (avatar and name, log in/out). Login stays optional.
- Register `https://fluxer.christmas/callback` as a second redirect URI in the Fluxer app settings (manual step, recorded in PROGRESS.md).

## Phase 5: Temporary whitelist gate (TODO 7)

- `src/routes/+page.server.ts` returns `{ user, allowed }`, where:
  - `allowed = !REQUIRE_LOGIN || whitelist.has(user.id)`, or
  - the request carries a valid invite.
- If not allowed, render `src/lib/ui/WipScreen.svelte` instead of the Canvas. The 3D bundle is lazy-imported so it isn't even downloaded. The screen shows:
  - a festive "Work in progress" message
  - a link to https://fluxer.gg/dh9m2Iqo
  - a "Log in with Fluxer" button
  - for logged-in users who aren't whitelisted: "you're not on the list yet"
- Turning `REQUIRE_LOGIN=false` disables the gate without code changes.
- All strings go in `messages/en.json` and `messages/es.json`.

## Phase 6: Player model and third-person view (TODO 4, 5)

- `src/lib/3d/avatar/Avatar.svelte`: a procedural elf/snowman-style character built from primitives.
  - Parts: body, head, arms, legs, Santa hat, scarf.
  - Driven by an `AvatarConfig` (colors, hat/scarf/accessory variants) defined in `src/lib/game/avatar.ts` with defaults and validation. The Phase 10 customizer and the server reuse it.
  - Animation states: idle, walk, run (procedural limb swing) and sit.
- In `src/lib/3d/Player.svelte`, render the Avatar on the player body. Hide it in first person, or show only the shadow.
- Camera mode `game.view: 'first' | 'third'`, toggled by `KeyV` through the Phase 2 input module.
  - `src/lib/3d/Camera.svelte` gets a third-person boom behind and above the player at the current yaw/pitch.
  - Use a Rapier `castRay` from the head toward the boom so the camera doesn't clip into walls, and lerp it smoothly.
  - In third person, the body rotates toward the movement direction.
- Add the V binding to the HUD controls list.

## Phase 7: Environment interactions (TODO 6)

- `src/lib/game/interact.svelte.ts`:
  - A registry of interactables: `{ id, object3D ref, label(), action(), range }`.
  - Each frame, raycast from the camera center (first person) or the player's look direction (third person) against the registered meshes.
  - Show a HUD prompt ("E: Open gift"). `KeyE` (by code) triggers the action.
- Interactions to ship:
  - **Presents:** unwrap animation (lid pops, ribbon falls), revealing a small surprise (confetti `Sparkles`, a random toy mesh or a festive message). Re-wrap after a while.
  - **Sofa sitting:** seat transforms per cushion. Snap the player to the seat (kinematic, disable movement) with the sit animation. Movement keys or E stand up.
  - **Tree:** toggle lights or cycle light patterns. Looking at an ornament jingles it (sway).
  - **Fireplace:** stoke it (bigger flames plus a sparks burst).
  - **Rocking chair:** push it to rock.
  - **Mantel clock:** chime.
  - **Floor lamp and chandelier:** toggle.
- Keep interaction state as serializable events (`{type, targetId, t}`) applied by a reducer, so Phase 10 can broadcast them.
- Optional short sound effects under `static/sfx/` (CC0), with volume in settings.

## Phase 8: Guild ornaments (logged in, TODO L2)

- `GET /api/me/guilds`: a server proxy using the session token. It returns `{id, name, iconUrl}` and caches per session for a few minutes.
- `GET /api/img?u=…`: a same-origin image proxy restricted to the Fluxer media host, to avoid WebGL CORS problems with icon textures.
- In `ChristmasTree.svelte`:
  - When logged in, split the ornaments into two groups: the decorative instanced ones (fewer) plus one **GuildOrnament** mesh per guild.
  - Each guild ornament is a sphere with the icon mapped onto a front decal or band, plus a metal cap. Guilds without an icon get the name's initials drawn on a canvas.
  - Placement is deterministic (golden-angle spacing seeded by guild id) and stays in the front-facing band.
  - The count is capped to what fits on the tree. Overflow goes to garland ornaments.
- Each guild ornament registers as an interactable: the prompt shows the guild name and E spins or jingles it.

## Phase 9: Room customization and saving (logged in, TODO L1)

- Turn the static `LAYOUT` and `COLLIDERS` in `src/lib/game/world.ts` into **defaults**, and add a runtime `RoomState` (`src/lib/game/room.svelte.ts`):
  - wallpaper `{pattern, colors}`
  - floor `{material, tint}`
  - placements `{id → position, rotationY}`
  - `schemaVersion`
- `StaticColliders` and furniture components read their positions from `RoomState`.
- Parameterize the textures: `wallpaperTexture`/`floorTexture` in `textures.ts` take pattern and color options. Add presets (several damask/stripe/plaid wallpapers; oak/walnut/herringbone/checker floors). Cache key = options.
- Edit mode (key `KeyB` / button, logged-in owner only):
  - A side panel for wallpaper and floor presets.
  - Movable items: pick via the interact raycast, then grab. The item follows the floor point under the crosshair, snaps to a grid and rotates with Q/R by code. Placement is checked against walls/other footprints using an AABB test.
  - Save, Cancel and Reset to default.
- `GET/PUT /api/room`: zod-validated (or hand-validated) JSON layout saved to the `rooms` table.
  - The server clamps positions to the room bounds and whitelists item ids.
  - Load on page load when logged in. Guests and logged-out visitors see the defaults.

## Phase 10: Multiplayer and invites (logged in, TODO L3)

- Invites:
  - `POST /api/invites` with `{password?, expiresIn?}` → `{code, url: ${ORIGIN}/r/{code}}`. Passwords are hashed with `crypto.scrypt`.
  - `GET /api/invites` lists invites, `DELETE /api/invites/:code` revokes one.
  - A UI panel to create, copy and revoke links.
- Join flow at `/r/[code]`:
  - Validate the code, then ask for the password if one is set.
  - Choose "Join as guest" (random festive name, default or random avatar) or "Log in with Fluxer". The login uses the user's saved `AvatarConfig` and Fluxer name/avatar, and returns to the invite after the callback.
  - The server issues a short-lived signed join ticket (HMAC with `SESSION_SECRET`).
- Realtime (`server/realtime.ts`, attached to the Phase 3 WS server):
  - Rooms are kept in memory per host owner_id. The WS connection authenticates with the ticket or the session cookie.
  - Messages (JSON, versioned):
    - `hello/welcome` (room layout, players)
    - `state` (pos, yaw, anim, at about 15 Hz from the client)
    - `snapshot` (about 15 Hz broadcast)
    - `interact` events (the Phase 7 reducer)
    - `join/leave`
    - `chat-emote`, optional
  - Server-side rate limiting and payload validation. There's a per-room player cap (e.g. 12). Revoking an invite kicks its guests.
- The client gets a `src/lib/game/net.svelte.ts` connection manager with reconnect. `RemotePlayers.svelte` renders an Avatar per peer with interpolation (a 100 ms buffer) and floating name tags. Visitors see the host's saved room (read-only, no edit mode).
- An avatar customizer UI (logged-in only), with `PUT /api/me/avatar` saving to `users.avatar_custom`.

## Phase 11: Polish

- Complete i18n (en/es) for every new string.
- Accessibility pass on the overlays.
- Update `README` with env vars, the Docker run command and the Rancher notes.
- Playwright e2e tests:
  - WIP gate shown when logged out with `REQUIRE_LOGIN=true`
  - scene loads with the gate off
  - invite page password flow
- Unit tests for the input map, the room-layout validator and the realtime message validation.

---

## Critical files

- **Modified:** `vite.config.ts`, `package.json`, `src/routes/+layout.ts`, `src/routes/+layout.svelte`, `src/routes/+page.svelte`, `src/hooks.server.ts`, `src/hooks.ts`, `src/app.d.ts`, `src/lib/3d/Player.svelte`, `src/lib/3d/Camera.svelte`, `src/lib/3d/Scene.svelte`, `src/lib/3d/furniture/ChristmasTree.svelte`, `src/lib/3d/textures.ts`, `src/lib/game/world.ts`, `src/lib/game/state.svelte.ts`, `src/lib/ui/HUD.svelte`, `src/lib/ui/StartOverlay.svelte`, `scripts/sync-fluxer-source.mjs`, `messages/*.json`, `.github/workflows/*`
- **New:** `PROGRESS.md`, `Dockerfile`, `server/index.ts`, `server/realtime.ts`, `src/lib/server/{env,db,fluxer,session}.ts`, `src/lib/game/{input,interact,room,net,avatar}.svelte.ts`, `src/lib/3d/avatar/Avatar.svelte`, `src/lib/ui/WipScreen.svelte`, routes `login`, `callback`, `logout`, `r/[code]`, `api/*`, `deploy/k8s.yaml`
- **Reuse:** `make()` texture cache (`textures.ts`), `seededRandom` (`world.ts`), the `game` runes state class, the `look`/`eye` per-frame refs (`player.ts`) and the `envelope()` tree silhouette.

## Working rules during execution

- Run the Svelte MCP `svelte-autofixer` on every Svelte file written (AGENTS.md).
- Never copy Fluxer source into the project (AGPL). Only read `fluxer-reference/`.
- At the end of each phase: run `pnpm check`, `pnpm lint` and `pnpm build`, test manually in `pnpm dev` (port 4321), update PROGRESS.md and commit (conventional commits, which commitlint enforces).

## Verification

- **Phases 1, 2, 6, 7:**
  - In `pnpm dev`, check the visuals (Gingy cookies, third-person camera not clipping walls).
  - Switch the OS keyboard to AZERTY: ZQSD must move and the HUD must show Z/Q/S/D.
  - Every interaction prompt must work.
- **Phases 4, 5:**
  - Run a full OAuth round trip against canary on `localhost:4321` and confirm the session survives a reload.
  - A non-whitelisted account sees the WIP screen with the community link. A whitelisted one sees the room.
- **Phase 3:**
  - `docker build` + `docker run -p 3000:3000 -v data:/data --env-file .env`. Check `/healthz`, check that the DB file is created, and check the CI run pushes to GHCR.
- **Phases 8, 9:**
  - Guild icons appear on the tree.
  - A customized room persists across reloads and container restarts.
- **Phase 10:**
  - Open two browsers, one host and one guest via the invite (with and without a password).
  - Both see each other move, sit and open gifts in real time.
  - Revoking the invite kicks the guest.
- **Phase 11:** `pnpm test` (unit + e2e) is green.
