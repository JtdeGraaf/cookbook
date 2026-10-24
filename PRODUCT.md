# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + React + TypeScript, frontend-only, Cloudflare Workers static assets (pinned by ship-app). Recipes are JSON files in the repo, validated with Zod at build time.

## Users

Jt (the owner) and the people he cooks with or shares recipes with. Used at home, mostly in the kitchen: a phone or tablet propped against the backsplash, hands busy or wet, sometimes a laptop on the counter. Also used on the couch to pick what to cook. (Inferred from the brief.)

## Product Purpose

A personal cookbook of recipes the owner likes, kept as data in a GitHub repository and read as a real book: a table of contents, chapters, recipe pages. Success is cooking a recipe start to finish without stress: every bit of preparation is done before anything goes in a hot pan, the ingredient list is always one tap away, and timers run themselves.

## Positioning

A cookbook that is also the cook's assistant: the recipe data separates mise en place from cooking, so the book walks you through prep first and cooking second, one step at a time, with timers taken from the recipe itself. Adding a recipe is adding a folder with a JSON file and photos.

## Operating Context

- Recipes live at `recipes/<chapter>/<recipe>/recipe.json` with images next to them; the folder a recipe sits in is its chapter. Optional `chapter.json` per chapter folder.
- Push to main deploys. No accounts, no backend, no editing in the browser.
- Bilingual: English and Dutch, both for interface and recipe content. kookboek.graaf.dev opens in Dutch, cookbook.graaf.dev in English (unless the reader chose otherwise).
- Kitchen scene: glance-reading at arm's length, messy hands, several timers at once, phone screen may dim.

## Capabilities and Constraints

- Table of contents → chapter → recipe overview → mise en place checklist → focused cooking steps.
- Search across recipe titles, ingredients and tags in both languages, client-side.
- Servings counter that scales every amount with sensible, unit-aware rounding; ingredients and prep tasks can be ticked off.
- Optional timer per step, defined in the data; several can run at once; they keep running across steps and pages; audible and visible alert when done.
- Light and dark mode, following the system by default, with a remembered toggle.
- Frontend only; state (language, theme, servings, ticks, timers) in localStorage.

## Brand Commitments

- The brief pins it: "I want the UI to look like an actual cookbook."
- Names: Cookbook (English), Kookboek (Dutch).

## Evidence on Hand

Six starter recipes authored for launch, each with a freely licensed photo (credited per image in the recipe data). No testimonials, users or claims exist and none may be invented.

## Product Principles

1. Prep before heat: the book never lets cooking start before the mise en place is laid out.
2. The data is the book: every recipe, chapter and image comes from files in the repo; nothing is hand-placed in code.
3. Readable from arm's length with busy hands: big targets, one step in focus, ingredients one tap away.
4. Both languages are first-class; neither is a translation afterthought.

## Accessibility & Inclusion

Keyboard operable, works at 360px wide, respects reduced motion, timer alerts are both audible and visible.
