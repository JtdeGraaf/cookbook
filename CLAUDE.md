# Cookbook / Kookboek

Frontend-only Vite + React + TypeScript app, deployed to https://cookbook.graaf.dev and https://kookboek.graaf.dev (Cloudflare Workers; pushes to main deploy).

Follow the `house-style` and `react-slices` skills from the `graaf` marketplace (JtdeGraaf/agents), scaled to a
small frontend-only app: plain-English names, components only render, logic in `lib/` with tests. No backend.
Verify with `npm run typecheck && npm test && npm run build`.

Recipes are data: `recipes/<folders…>/<recipe>/recipe.json` plus photos next to it (folders nest; the top level are chapters), checked at build time by
`build/read-recipe-folder.ts` against the Zod schema in `src/lib/recipe-file.ts`. After changing that schema, run
`npm run schemas` to refresh `schemas/*.schema.json`. The visual system is described in DESIGN.md.
