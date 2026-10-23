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
- **Browse the folders.** "Browse folders" shows the `recipes/` folder like a file manager: a tree you can open and close, a clickable path bar (All recipes › Mains › Pasta), and each folder's sub-folders and recipes. Folders can be nested as deep as you like.
- **Filters and "Surprise me".** On the contents page: under 30 minutes, under an hour, favourites, or any tag. "Surprise me" opens a random recipe from what is left. Filters are in the address, so a filtered page can be bookmarked.
- **Favourites and notes.** Heart a recipe. Each recipe keeps your own notes for next time and remembers when you cooked it (finishing the last step counts).
- **Shopping list.** Put recipes on the list with their servings; the list adds up the same ingredient across recipes (200 g + 0.5 kg spaghetti becomes 0.7 kg) for ticking off in the shop, or copying into a chat.
- **Share for a number of people.** "Share" sends a link like `/mains/pasta/carbonara?servings=6` that opens the recipe already scaled.
- **Screen stays on** while you prep and cook (where the browser allows it).
- **Print** a recipe as one clean page with the amounts for your servings.
- **Works offline** and can be added to your phone's home screen; the whole book, photos included, is saved on the first visit.

Everything you tick or choose is stored in your browser only. There is no backend.

## Recipes are files

```
recipes/
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

Every file is checked when the site is built. A typo in a field name, a missing Dutch translation, a step that uses an ingredient that doesn't exist, or a photo that isn't in the folder all **stop the build** with a message saying exactly which file and what is wrong. A broken recipe never reaches the site.

### Add a recipe

Three ways, all ending in a `recipe.json` that already passes the checks, so the site keeps building while you fill it in:

- **From the site:** every folder page has "Add a recipe to this folder". It opens GitHub's new-file page in that folder with a filled-in `new-recipe/recipe.json`; rename the folder, fill it in, commit. Every recipe also has "Edit on GitHub" under your notes.
- **From the terminal:** `npm run new-recipe -- mains/pasta/lasagne` creates the folder and the file.
- **By hand:** make a folder `recipes/<folders>/<recipe-name>/` (lowercase letters, digits and dashes) and copy a `recipe.json` from another recipe. Your editor autocompletes and checks it thanks to the `$schema` line.

Then add a photo next to it (any `.jpg`, `.png` or `.webp`; the build resizes it and converts it to webp) and point `cover` at it. Until then the recipe shows a block of chapter colour with its first letter. Run `npm run dev` to see it, or just push to `main`: GitHub Actions checks, builds and deploys it.

### `recipe.json`

Every text is given in both languages: `{ "en": "…", "nl": "…" }`.

| Field | Required | What it is |
|---|---|---|
| `$schema` | no | `"../../../schemas/recipe.schema.json"` for editor help |
| `title`, `summary` | yes | Name and a one or two sentence description |
| `servings` | yes | How many people the amounts are for (1–24) |
| `prepMinutes`, `cookMinutes` | yes | Rough times, shown on the recipe |
| `tags` | no | List of texts, e.g. `{ "en": "vegetarian", "nl": "vegetarisch" }`; searchable |
| `cover` | no | `{ "file", "alt", "credit"? }`, see images below; leave out until you have a photo |
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

The JSON Schemas in `schemas/` are generated from the checks in `src/lib/recipe-file.ts` (`npm run schemas`); a test fails if they drift apart.

## Starter recipes and photo credits

Shakshuka, Dutch bacon pancakes (spekpannenkoeken), kale stamppot with smoked sausage (boerenkoolstamppot), spaghetti carbonara and spaghetti aglio e olio (in the `mains/pasta` section) and chocolate mousse. All photos come from Wikimedia Commons under Creative Commons licences; author, licence and source link are in each `recipe.json` and shown under every photo.

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest: scaling, search, timers, progress, recipe checks, translations
npm run typecheck
npm run build      # checks every recipe, optimises images, builds to dist/
npm run deploy     # build + wrangler deploy (needs CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID)
npm run new-recipe -- mains/pasta/lasagne   # start a new recipe
```

Every push to `main` runs typecheck, tests and build in GitHub Actions and deploys to Cloudflare Workers (static assets) on both domains.

Stack: Vite, React, TypeScript, TanStack Router, i18next, Zod, vite-imagetools. Design notes in [DESIGN.md](DESIGN.md), product notes in [PRODUCT.md](PRODUCT.md).
