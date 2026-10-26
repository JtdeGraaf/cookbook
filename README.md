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
- **Prep before cooking.** Every recipe starts with a *mise en place* checklist (chop, measure, preheat). Cooking only unlocks once every prep task is ticked off. Then the cooking steps come one at a time, big enough to read from the stove, with Previous / Next always in reach at the bottom of the screen (arrow keys turn the page too). Prep ticks from an earlier day are cleared, so every cook starts with the prep.
- **Ingredients always one tap away.** Pinned beside the steps on wide screens, a button-and-sheet on phones. A servings counter scales every amount with kitchen-sensible rounding (grams to kilos, teaspoons to tablespoons, halves for eggs). Ticking an ingredient means "I have it"; the shopping list uses the same ticks.
- **Timers from the recipe.** Steps can carry a timer. Start several at once; they keep running across steps, pages and even a reload, and sit on a shelf at the bottom of every page, soonest first. A finished timer turns into a wide alarm banner with a Stop button and rings (sound, vibration, tab title). After a reload, the first tap anywhere turns the sound back on. The first timer you start asks once whether the book may show notifications; if you allow it, a timer that finishes while you're in another app or tab also shows a phone notification that vibrates and stays until you tap it, and tapping it brings you back to the book. That works where the browser allows it, and on iPhone and iPad only once the book is added to the Home Screen. There is no server behind the book, so the notification comes from the page itself: when the browser closes, freezes or slows down the page in the background, it may come late or not at all. Keeping the screen on (below) covers the usual case of a phone propped up in the kitchen.
- **Search** across titles, ingredients, tags and chapters in both languages at once: "eieren" and "eggs" both find the shakshuka. Press `/` anywhere to jump to the search box.
- **English and Dutch** for the interface and every recipe. Your choice is remembered.
- **Light and dark** follow your system until you pick one.
- **Browse the folders.** The contents and every folder page share one layout, like a file manager: the `recipes/` folder as a tree you can open and close beside the page (on wider screens), a clickable path bar (All recipes › Mains › Pasta), and each folder's sub-folders and recipes. Folders can be nested as deep as you like.
- **Filters and "Surprise me".** On the contents page: under 30 minutes, under an hour, favourites, or any tag. "Surprise me" opens a random recipe from what is left. Filters are in the address, so a filtered page can be bookmarked.
- **Finishing.** Finish on the last step closes the cooking session: the cook is written into the recipe's history, its ticks and timers are cleared, and it comes off the shopping list (you can put it back).
- **Favourites and history.** Mark a recipe as a favourite; lists show a heart next to it. Each recipe remembers when you cooked it and shows it under the cooking times.
- **Shopping list.** Put recipes on the list; it uses each recipe's own servings (change them on either page) and adds up the same ingredient across recipes (200 g + 0.5 kg spaghetti becomes 0.7 kg). Ticking a line means you have it, on every recipe that needs it, and it moves to "Already have". Kitchen staples like salt and water are left off (and named). Copy list copies only what's left to buy.
- **Share for a number of people.** "Share" sends a link like `/mains/pasta/carbonara?servings=6` that opens the recipe already scaled.
- **Screen stays on** while you prep and cook, and on any page while a timer runs (where the browser allows it).
- **Print** a recipe as one clean page with the amounts for your servings.
- **Works offline** and can be added to your phone's home screen; the whole book, photos included, is saved on the first visit.

- **Sync between phones** (optional). Phones that know the same four Dutch words share favourites, the shopping list, ticks, servings and the journal. Start on one phone, scan its QR code with the other. Timers, theme and language stay on each phone.

Everything you tick or choose is stored in your browser. Syncing goes through one small Worker with a Durable Object per shared book, using [`@graaf/unsafe-device-sync`](https://github.com/JtdeGraaf/unsafe-device-sync): no accounts, and anyone with the words can read and change what is shared. Fine for a shopping list, not for secrets.

## Recipes are files

```
recipes/
  techniques.json             <- cooking terms the steps explain behind an (i) button
  breakfast/                  <- a chapter: a top-level folder
    chapter.json              <- optional: title, intro, order, tab colour
    shakshuka/                <- a recipe: any folder with a recipe.json
      recipe.json
      cover.jpg               <- images live next to recipe.json
      sauce.jpg
  mains/
    kale-stamppot/
      recipe.json
      cover.jpg
    pasta/                    <- a section: a folder inside a chapter, nested as deep as you like
      chapter.json            <- optional here too
      carbonara/
        recipe.json
        cover.jpg
```

**The folders are the book.** A folder with a `recipe.json` is a recipe; any other folder holds recipes or more folders. Top-level folders are the chapters (each with its tab colour); folders inside them are sections, which use their chapter's colour. There is no chapter field in `recipe.json`: move the folder and the recipe moves. The web address is the folder path, so `recipes/mains/pasta/carbonara` is at `/mains/pasta/carbonara`. A folder without `chapter.json` uses its folder name as its title (`quick-bites` becomes "Quick bites") and comes after the folders that do have an order. Top-level folders can't be called `search`, `browse` or `shopping-list`, and a recipe folder can't hold other folders.

Every file is checked when the site is built. A typo in a field name, a missing Dutch translation, a step that uses an ingredient or technique that doesn't exist, or a photo that isn't in the folder all **stop the build** with a message saying exactly which file and what is wrong. A broken recipe never reaches the site.

### Add a recipe

Recipes are added and changed by AI agents working in this repository; the site itself has no way to edit them. The agent does one of two things, both ending in a `recipe.json` that already passes the checks, so the site keeps building while it is filled in:

- **From the terminal:** `npm run new-recipe -- mains/pasta/lasagne` creates the folder and the file. Add `--drink` for a drink: `npm run new-recipe -- cocktails/gimlet --drink`.
- **By hand:** make a folder `recipes/<folders>/<recipe-name>/` (lowercase letters, digits and dashes) and copy a `recipe.json` from another recipe. Your editor autocompletes and checks it thanks to the `$schema` line.

Then add a photo next to it (any `.jpg`, `.png` or `.webp`; the build resizes it and converts it to webp) and point `cover` at it. Until then the recipe shows a block of chapter colour with its first letter. Run `npm run dev` to see it, or just push to `main`: GitHub Actions checks, builds and deploys it.

### `recipe.json`

Every text is given in both languages: `{ "en": "…", "nl": "…" }`.

| Field | Required | What it is |
|---|---|---|
| `$schema` | no | `"../../../schemas/recipe.schema.json"` for editor help |
| `title`, `summary` | yes | Name and a one or two sentence description |
| `source` | no | `{ "url", "name"? }`: the recipe this one is based on, shown as "Original recipe: …"; without a name the link shows the website |
| `servings` | yes | How many people the amounts are for (1–24) |
| `prepMinutes`, `cookMinutes` | yes | Rough times, shown on the recipe |
| `tags` | no | List of texts, e.g. `{ "en": "vegetarian", "nl": "vegetarisch" }`; searchable |
| `cover` | no | `{ "file", "alt", "credit"? }`, see images below; leave out until you have a photo |
| `ingredients` | yes | List of `{ "id", "name", "plural"?, "amount"?, "unit"?, "note"?, "pantry"?, "bottle"? }` |
| `prep` | yes, at least one | The *mise en place*: everything done before anything goes on the heat |
| `cook` | yes, at least one | The cooking steps, shown one at a time |

**Ingredients.** `id` is a short name steps use to point at the ingredient (`"eggs"`). Give `amount` and `unit` together, or leave both out for "to taste". Units: `g`, `kg`, `ml`, `cl`, `l`, `tsp`, `tbsp`, `barspoon`, `dash`, `piece`, `clove`, `pinch`, `slice`, `sprig`, `can`. Amounts are for `servings` people and scale automatically. For things you count, `name` is the name of one (`{ "en": "egg", "nl": "ei" }`) and `plural` the name for more than one (`{ "en": "eggs", "nl": "eieren" }`), used whenever the scaled amount is more than 1; leave `plural` out when the name never changes, like garlic counted in cloves. Add `"pantry": true` to a staple the kitchen always has (salt, water, oil) to leave it off the shopping list, and `"bottle": true` to something bought by the bottle (gin, white wine): the shopping list then asks for a bottle instead of adding up centilitres.

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

**Cooking terms.** Mark a term in a step's text as `[[words|technique-id]]` to put a small (i) button after it that opens a short explanation from `recipes/techniques.json`, hidden until pressed: `"Peel the onion and [[chop it finely|chop-finely]]."` / `"Pel de ui en [[snijd hem fijn|chop-finely]]."`. Readers only see the words before the `|`. Mark the same techniques in English and Dutch; an unknown id, a broken mark or a mismatch between the languages stops the build.

### Drinks

A `recipe.json` with `"kind": "drink"` is a drink. A drink is made in one go, so it has no prep list, cooking mode or times: everything is on its one page, with a **Made it** button that notes the day, clears the ticks and takes it off the shopping list. Point `$schema` at `drink.schema.json`. It has the same `title`, `summary`, `source`, `tags`, `cover` and `ingredients` as a dish, plus:

| Field | Required | What it is |
|---|---|---|
| `kind` | yes | Always `"drink"` |
| `servings` | yes | How many drinks the amounts are for (1–24) |
| `method` | yes | `shaken`, `stirred`, `built` or `blended` |
| `glass` | yes | `coupe`, `nick-and-nora`, `martini`, `rocks`, `highball`, `wine`, `flute` or `mug` |
| `ice` | yes | What goes in the glass: `none` (served up), `cubes`, `large-cube` or `crushed` |
| `steps` | yes, at least one | Everything from chilling the glass to the garnish, without timers |

Give an ingredient `"garnish": true` to list it under **Garnish**, after what goes in the glass. Drinks are left out of the time filters, which hide on a page of drinks.

**Images.** `file` is a file next to `recipe.json`; `alt` describes the photo for people who can't see it. `credit` (`{ "author", "license", "source" }`) is shown under the photo; leave it out for your own photos.

### `chapter.json` (optional, in any folder)

```json
{
  "$schema": "../../schemas/chapter.schema.json",
  "title": { "en": "Breakfast", "nl": "Ontbijt" },
  "intro": { "en": "Slow weekend mornings.", "nl": "Trage weekendochtenden." },
  "order": 1,
  "color": "yolk"
}
```

Works the same for chapters and sections. `color` is one of `tomato`, `matcha`, `yolk`, `plum`, `sea`; without it, a chapter takes the next colour in that list and a section uses its chapter's colour.

### `techniques.json` (next to the chapters)

```json
{
  "$schema": "../schemas/techniques.schema.json",
  "chop-finely": {
    "name": { "en": "Chop finely", "nl": "Fijnsnijden" },
    "explanation": { "en": "Cut into pieces as small as you can manage…", "nl": "Snijd in zo klein mogelijke stukjes…" }
  }
}
```

Each key is a technique id (lowercase letters, digits and dashes) that steps point at with `[[words|id]]`. The explanation is one to three short, practical sentences; the (i) shows it under the step with the name in bold.

The JSON Schemas in `schemas/` are generated from the checks in `src/lib/recipe-file.ts` (`npm run schemas`); a test fails if they drift apart.

## Recipes and credits

In `mains`: kip in de hoed (after Cooked by Nadine) and a sweet potato beef bowl (after De Snelle Keuken). In the `mains/pasta` section: truffle orzo (after Indi Kuiper), and spaghetti all'amatriciana, spaghetti carbonara and penne with Parmigiano cream sauce (after Albert Heijn). All rewritten with the prep first, and each links to its original from the recipe page, except the beef bowl, whose original post we could not find again. Each photo is freely licensed (Pexels, Unsplash or Wikimedia Commons) and credited under the photo, linking to where it comes from.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest: scaling, search, timers, progress, recipe checks, translations
npm run typecheck
npm run build      # checks every recipe, optimises images, builds to dist/
npm run deploy     # build + wrangler deploy (needs CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID)
npx wrangler dev   # the built site plus the sync Worker, http://localhost:8787 (run npm run build first)
npm run new-recipe -- mains/pasta/lasagne   # start a new recipe (add --drink for a drink)
```

Every push to `main` runs typecheck, tests and build in GitHub Actions and deploys to Cloudflare Workers (static assets, plus the sync Worker for /api/*) on both domains.

Stack: Vite, React, TypeScript, TanStack Router, i18next, Zod, vite-imagetools. Design notes in [DESIGN.md](DESIGN.md), product notes in [PRODUCT.md](PRODUCT.md).
