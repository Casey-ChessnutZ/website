# Copilot instructions

## Live development versus isolated verification

- Do not change the `dev` script or make `npm run dev` disable Contentful. Local
  development intentionally uses the configured Contentful Delivery or Preview API.
- Preserve the existing environment-variable contract in `.env.local`; never print,
  commit, or replace Contentful tokens.
- When adding or changing build-validation tooling, keep it isolated from live CMS
  content. The isolated workflow must set an explicit offline flag (for example,
  `CONTENTFUL_OFFLINE=true`) and ensure Contentful requests are not made.
- An isolated verification command should run unit tests, linting, and a production
  build. It must not publish Contentful entries, update schemas, or call the
  management API.
- Use `npm run verify:isolated` for a complete offline test, lint, and build check.
  Use `npm run build:isolated` when only a CMS-isolated production build is needed.
- Treat `npm run contentful:sync` as an explicit content-management operation. Do
  not run it as part of tests, builds, formatting, or development startup.
- Add tests for any offline-mode behavior and keep normal Delivery/Preview behavior
  covered separately.

## Project conventions

- This is a Next.js App Router site driven by Contentful. Public routes must keep
  their graceful fallbacks for missing or unavailable CMS content.
- Prefer typed helpers in `app/lib/` for data and environment behavior. Keep route
  components focused on rendering.
- Run `npm test`, `npm run lint`, and `npm run build` before considering a change
  ready. Use a network-isolated build command when it exists.
