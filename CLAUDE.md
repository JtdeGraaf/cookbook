# Cookbook / Kookboek

Frontend-only Vite + React + TypeScript app, deployed to https://cookbook.graaf.dev and https://kookboek.graaf.dev (Cloudflare Workers; pushes to main deploy).

Follow the `house-style` and `react-slices` skills from the `graaf` marketplace (JtdeGraaf/agents), scaled to a
small frontend-only app: plain-English names, components only render, logic in `lib/` with tests. No backend beyond
the sync Worker: `worker/index.ts` answers `/api/*` with `packages/unsafe-device-sync` (an npm workspace, kept
app-agnostic so other apps can reuse it; unsafe on purpose, see its README). What syncs and how it merges lives in
`src/lib/synced-data.ts`. `npx wrangler dev` after a build runs the site and the Worker together.
Verify with `npm run typecheck && npm test && npm run build`.

Recipes are data: `recipes/<folders…>/<recipe>/recipe.json` plus photos next to it (folders nest; the top level are chapters), checked at build time by
`build/read-recipe-folder.ts` against the Zod schemas in `src/lib/recipe-file.ts`. A `recipe.json` with `"kind": "drink"`
is a drink (one page, no prep or cooking mode); without a kind it is a dish. After changing that schema, run
`npm run schemas` to refresh `schemas/*.schema.json`. The visual system is described in DESIGN.md.
