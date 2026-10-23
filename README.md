> [!WARNING]
> **🤖 One-prompt app — please ignore the code.**
> This entire project — idea, design, code, GitHub repo, and Cloudflare deployment — was generated and shipped by [Claude Code](https://claude.com/claude-code) from a **single prompt**, in a **single run**. No human wrote or reviewed this code. It is not an example of how I write software; judge the idea, not the implementation.
>
> **The prompt:** "I want to create a personal cookbook where i can store recipes i like all recipes must be data driven and easy to add and have support for images. Recipes must follow through step by step guides and stress free so all preparation before anything goes in a hot pan. There must also be an easily accessible list of all ingredients that are required with an amount of person counter and an integrated timer for each step if needed. I want the UI to look like an actual cookbook. And we must support both english and dutch, and fuck it and throw in dark and light mode. cookbook.graaf.dev and alias kookboek.graaf.dev. To clarify data driven means json recipes within the github repo, and of course the thing must be searchable and recipes can be put into different chapters, also data driven just based on the directory they are located in."

# Cookbook · Kookboek

A personal cookbook, in English and Dutch, that reads like a real book and cooks like a calm assistant.

- **English:** https://cookbook.graaf.dev
- **Dutch:** https://kookboek.graaf.dev (opens in Dutch)

## What it does

- **Reads like a book.** Contents with page numbers, chapters with coloured thumb-index tabs, every recipe an open two-page spread. The look borrows from Japanese home-cooking books: rounded type, boxed ingredient lists, numbered steps, small "Point" tips.
- **Prep before heat.** Every recipe starts with a *mise en place* checklist. Cooking only unlocks once every prep task is ticked off. Then the cooking steps come one at a time, big enough to read from the stove (arrow keys turn the page).
- **Ingredients always one tap away.** Pinned beside the steps on wide screens, a button-and-sheet on phones. A servings counter scales every amount with kitchen-sensible rounding (grams to kilos, teaspoons to tablespoons, halves for eggs), and you can tick off what is on the counter.
- **Timers from the recipe.** Steps can carry a timer. Start several at once; they keep running across steps, pages and even a reload, sit on a shelf at the bottom of every page, and ring (sound, vibration, tab title) when done.
- **Search** across titles, ingredients, tags and chapters in both languages at once: "eieren" and "eggs" both find the shakshuka. Press `/` anywhere to jump to the search box.
- **English and Dutch** for the interface and every recipe. Your choice is remembered.
- **Light and dark** follow your system until you pick one.

Everything you tick or choose is stored in your browser only. There is no backend.

## Recipes are files

```
recipes/
  breakfast/                  <- a chapter: the folder name is the chapter
    chapter.json              <- optional: title, intro, order, tab colour
    shakshuka/                <- a recipe: the folder name is its web address
      recipe.json
      cover.jpg               <- images live next to recipe.json
      sauce.jpg
  mains/
    kale-stamppot/
      recipe.json
      cover.jpg
```

**The chapter is the folder a recipe sits in.** There is no chapter field in `recipe.json`. Move the folder, and the recipe moves chapter. A chapter folder without `chapter.json` uses its folder name as its title (`quick-bites` becomes "Quick bites") and is sorted after the chapters that do have an order.

Every file is checked when the site is built. A typo in a field name, a missing Dutch translation, a step that uses an ingredient that doesn't exist, or a photo that isn't in the folder all **stop the build** with a message saying exactly which file and what is wrong. A broken recipe never reaches the site.

### Add a recipe

1. Make a folder: `recipes/<chapter>/<recipe-name>/` (lowercase letters, digits and dashes).
2. Put a photo in it, e.g. `cover.jpg`. Any `.jpg`, `.png` or `.webp` works; the build resizes it and converts it to webp.
3. Create `recipe.json` next to it (copy one of the existing recipes as a start). Your editor autocompletes and checks it thanks to the `$schema` line.
4. Run `npm run dev` to see it, or just push to `main`: GitHub Actions checks, builds and deploys it.

### `recipe.json`

Every text is given in both languages: `{ "en": "…", "nl": "…" }`.

| Field | Required | What it is |
|---|---|---|
| `$schema` | no | `"../../../schemas/recipe.schema.json"` for editor help |
| `title`, `summary` | yes | Name and a one or two sentence description |
| `servings` | yes | How many people the amounts are for (1–24) |
| `prepMinutes`, `cookMinutes` | yes | Rough times, shown on the recipe |
| `tags` | no | List of texts, e.g. `{ "en": "vegetarian", "nl": "vegetarisch" }`; searchable |
| `cover` | yes | `{ "file", "alt", "credit"? }`, see images below |
| `ingredients` | yes | List of `{ "id", "name", "amount"?, "unit"?, "note"? }` |
| `prep` | yes, at least one | The *mise en place*: everything done before anything goes on the heat |
| `cook` | yes, at least one | The cooking steps, shown one at a time |

**Ingredients.** `id` is a short name steps use to point at the ingredient (`"eggs"`). Give `amount` and `unit` together, or leave both out for "to taste". Units: `g`, `kg`, `ml`, `l`, `tsp`, `tbsp`, `piece`, `clove`, `pinch`, `slice`, `sprig`, `can`. Amounts are for `servings` people and scale automatically.

**Steps** (both `prep` and `cook`):

```json
{
  "text": { "en": "Simmer until thick.", "nl": "Laat inkoken tot het dik is." },
  "ingredients": ["tomatoes", "sugar"],
  "timer": { "minutes": 10, "label": { "en": "Simmer the sauce", "nl": "Saus inkoken" } },
  "tip": { "en": "A spoon dragged through should leave a path.", "nl": "Een lepel moet een spoor trekken." },
  "image": { "file": "sauce.jpg", "alt": { "en": "…", "nl": "…" } }
}
```

Only `text` is required. `ingredients` shows those ingredients with their scaled amounts on the step; `timer` adds a startable kitchen timer; `tip` shows a "Point" note; `image` adds a step photo.

**Images.** `file` is a file next to `recipe.json`; `alt` describes the photo for people who can't see it. `credit` (`{ "author", "license", "source" }`) is shown under the photo; leave it out for your own photos.

### `chapter.json` (optional)

```json
{
  "$schema": "../../schemas/chapter.schema.json",
  "title": { "en": "Breakfast", "nl": "Ontbijt" },
  "intro": { "en": "Slow weekend mornings.", "nl": "Trage weekendochtenden." },
  "order": 1,
  "color": "yolk"
}
```

`color` is one of `tomato`, `matcha`, `yolk`, `plum`, `sea`; without it, chapters take the next colour in that list. A chapter may not be called `search`.

The JSON Schemas in `schemas/` are generated from the checks in `src/lib/recipe-file.ts` (`npm run schemas`); a test fails if they drift apart.

## Starter recipes and photo credits

Shakshuka, Dutch bacon pancakes (spekpannenkoeken), kale stamppot with smoked sausage (boerenkoolstamppot), spaghetti carbonara and chocolate mousse. All photos come from Wikimedia Commons under Creative Commons licences; author, licence and source link are in each `recipe.json` and shown under every photo.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest: scaling, search, timers, progress, recipe checks, translations
npm run typecheck
npm run build      # checks every recipe, optimises images, builds to dist/
npm run deploy     # build + wrangler deploy (needs CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID)
```

Every push to `main` runs typecheck, tests and build in GitHub Actions and deploys to Cloudflare Workers (static assets) on both domains.

Stack: Vite, React, TypeScript, TanStack Router, i18next, Zod, vite-imagetools. Design notes in [DESIGN.md](DESIGN.md), product notes in [PRODUCT.md](PRODUCT.md).
