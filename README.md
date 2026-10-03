# fluxer.christmas

A cozy Christmas room to walk around in, built with SvelteKit, Threlte and Rapier. It's served by a small Node server that also handles Fluxer login and WebSockets.

Roadmap and status: [PROGRESS.md](PROGRESS.md) (detailed plan in [docs/PLAN.md](docs/PLAN.md)).

## Developing

Requires Node 24+ and pnpm.

```sh
pnpm install
cp .env.example .env   # fill in FLUXER_CLIENT_SECRET to try logging in
pnpm dev               # http://localhost:4321
```

The dev server is pinned to port 4321 because that's the OAuth redirect URI registered with Fluxer (`http://localhost:4321/callback`).

Useful scripts:

| Command                     | What it does                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------- |
| `pnpm check`                | Type-check (run `pnpm build` once first so the Paraglide messages exist)                              |
| `pnpm lint` / `pnpm format` | Prettier and ESLint                                                                                   |
| `pnpm test`                 | Playwright end-to-end tests against a production build                                                |
| `pnpm fluxer:sync`          | Download the Fluxer docs and source this project relies on into `fluxer-reference/` (read-only, AGPL) |

## Running in production

```sh
pnpm build
pnpm start             # node server/index.js, listens on PORT (default 3000)
```

`server/index.js` starts SvelteKit's Node server (`build/`) and routes WebSocket upgrades on `/ws`. `/healthz` reports whether the server and its database are up.

### Docker

GitHub Actions (`.github/workflows/docker.yml`) builds the image and publishes it to `ghcr.io/fluxerdevs/fluxer.christmas` on every push to `main`. It's tagged `latest`, `sha-<commit>` and the version for `v*` tags.

```sh
docker build -t fluxer-christmas .
docker run -p 3000:3000 -v fluxer-christmas-data:/data --env-file .env fluxer-christmas
```

The SQLite database lives in `/data`, so mount a volume there. Run **exactly one** instance: sessions, rooms and multiplayer state belong to a single process. `deploy/k8s.yaml` is a reference setup for Rancher (one replica with the `Recreate` strategy, a PVC, and an ingress with long WebSocket timeouts).

### Environment variables

| Name                                           | Purpose                                                                                  |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ORIGIN`                                       | Public URL, e.g. `https://fluxer.christmas`. OAuth redirects go to `${ORIGIN}/callback`. |
| `FLUXER_CLIENT_ID` / `FLUXER_CLIENT_SECRET`    | The Fluxer OAuth application                                                             |
| `FLUXER_INSTANCE`                              | Fluxer instance to discover hosts from (default `https://canary.fluxer.com`)             |
| `REQUIRE_LOGIN`                                | Work-in-progress gate. Defaults to `true`.                                               |
| `FLUXER_WHITELIST`                             | Comma-separated Fluxer user IDs allowed in while the gate is on                          |
| `SESSION_SECRET`                               | Random secret for signed tokens. Required in production.                                 |
| `DATA_DIR`                                     | SQLite location (`/data` in the image)                                                   |
| `PORT`, `HOST`, `ADDRESS_HEADER`, `XFF_DEPTH`… | [adapter-node options](https://svelte.dev/docs/kit/adapter-node#Environment-variables)   |

## Credits

- [Gingy (shrek)](https://sketchfab.com/3d-models/gingy-shrek-cea352f1dd9848cdbdb748d1926c05be) by [tannersprague938](https://sketchfab.com/tannersprague938), licensed under [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/). Used as-is in `static/models/gingy.glb`; it's turned upright and scaled at load time. It's also credited in the in-game Settings panel.
