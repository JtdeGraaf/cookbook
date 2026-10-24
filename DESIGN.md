---
name: Cookbook
description: A Japanese home-cooking mook for a Dutch kitchen; prep is a boxed list you finish before the numbered method begins.
colors:
  paper: "#f7f7f4"
  sheet: "#ffffff"
  ink: "#1c1b19"
  ink-soft: "#57544d"
  rule: "#d6d3cb"
  rule-strong: "#aca89e"
  focus: "#1f5fbf"
  tomato: "#c93f1f"
  tomato-ink: "#b23517"
  on-tomato: "#ffffff"
  yolk: "#f0b323"
  yolk-ink: "#8a5b00"
  on-yolk: "#1c1b19"
  plum: "#8a3363"
  plum-ink: "#8a3363"
  on-plum: "#ffffff"
  matcha: "#4f7a1f"
  matcha-ink: "#456a1c"
  on-matcha: "#ffffff"
  sea: "#23628f"
  sea-ink: "#23628f"
  on-sea: "#ffffff"
typography:
  display:
    fontFamily: "Zen Maru Gothic, Hiragino Maru Gothic ProN, Arial Rounded MT Bold, sans-serif"
    fontSize: "clamp(3rem, 11vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Zen Maru Gothic, Hiragino Maru Gothic ProN, Arial Rounded MT Bold, sans-serif"
    fontSize: "clamp(2rem, 6vw, 3.25rem)"
    fontWeight: 900
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Zen Maru Gothic, Hiragino Maru Gothic ProN, Arial Rounded MT Bold, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  step:
    fontFamily: "Zen Kaku Gothic New, Hiragino Sans, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 3.4vw, 1.875rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Zen Kaku Gothic New, Hiragino Sans, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Zen Maru Gothic, Hiragino Maru Gothic ProN, Arial Rounded MT Bold, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.2
rounded:
  small: "6px"
  base: "12px"
  large: "20px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "72px"
components:
  button-primary:
    backgroundColor: "{colors.tomato}"
    textColor: "{colors.on-tomato}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "52px"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "52px"
  button-disabled:
    backgroundColor: "{colors.rule}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "44px"
  search-field:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0 8px 0 16px"
    height: "44px"
  ingredient-box-head:
    backgroundColor: "{colors.tomato}"
    textColor: "{colors.on-tomato}"
    padding: "12px 12px 12px 24px"
  step-number:
    backgroundColor: "{colors.tomato}"
    textColor: "{colors.on-tomato}"
    rounded: "{rounded.pill}"
    size: "34px"
  chip:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "2px 12px"
  point-label:
    backgroundColor: "{colors.yolk}"
    textColor: "{colors.on-yolk}"
    rounded: "{rounded.small}"
    padding: "1px 8px"
  timer-ticket:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.base}"
    width: "min(300px, 82vw)"
  timer-ticket-finished:
    backgroundColor: "{colors.tomato}"
    textColor: "{colors.on-tomato}"
    rounded: "{rounded.base}"
---

# Design System: Cookbook

## Overview

**Creative North Star: "The Kitchen Mook"**

A Japanese home-cooking magazine-book, printed on coated white paper in sumi ink and set in rounded gothic. Each chapter owns one strong colour, and that colour shows up only on things the reader touches or counts: thumb-index tabs, ingredient box headers, filled step circles, ticks, timers. Everything else is paper, ink and hairline rules. Pages read like print, with folios, dotted leaders, a contents page and a soft centre fold on the recipe spread. In the kitchen they behave like a tool: big step text, 44-52px targets, and a timer shelf docked to the bottom of the screen.

The book refuses the cream-paper serif cookbook and the recipe-card grid. Recipes are listed as contents rows, chapters open as full colour bands, and prep sits in a dashed box that you finish before the numbered method starts. Dark mode is the same book under a night-kitchen pendant: ink-black paper, chapter colours lifted so they still read, and separate ink tokens so the colours stay legible as text.

**Key Characteristics:**
- Neutral coated paper and warm sumi ink; one chapter colour per page, switched by `data-color`.
- Rounded gothic throughout: Zen Maru Gothic at 900/700 for headings, numbers and labels, Zen Kaku Gothic New for reading.
- Circles and pills: step numbers, ticks, seals, buttons, chips.
- Print devices: thumb-index tabs, folios, dotted leaders, a dashed prep box, a centre-fold gutter.
- Motion moves things with transform only. The one authored motion is the page-turn on cook steps; finished timers shake like a bell.

## Colors

Neutral paper and ink carry the page, and one saturated chapter colour per page carries every interactive and counting element.

### Primary (chapter colours, one per page)
- **Tomato**: Mains, and the book's own colour. The cover seal, the header wordmark and the finished-timer alarm always use tomato, whatever chapter is open.
- **Yolk**: Breakfast. Also the fixed colour of the "Point" hint label on every page.
- **Plum**: Desserts.
- **Matcha** and **Sea**: defined and allowed by the chapter schema; no chapter uses them yet.

Each colour comes in three tokens: the fill (`--tomato`), a darker or lighter **ink** for text on paper (`--tomato-ink`), and an **on** colour for text set on the fill (`--on-tomato`). Dark-mode values (fill / ink / on): tomato #f26849 / #ff8b70 / #1a0b06; yolk #f5c04a / #f5c04a / #1a1406; plum #d27bad / #e296c2 / #1a0a13; matcha #9cc860 / #add677 / #10160a; sea #6db0e0 / #8cc2ea / #07131c.

### Neutral
- **Coated Paper** (paper): the page background. Also used for the Point box and the ingredient sheet. Dark: #141413.
- **White Sheet** (sheet): the raised leaves: recipe spread, cook step, ingredient box body, dialogs, search field. Dark: #1f1e1c.
- **Sumi Ink** (ink): text, quiet-button hover rings, the contents rule, and the inverted timer tickets and ingredients button. Dark: #edebe5.
- **Soft Ink** (ink-soft): secondary text, metadata, done states. Dark: #aaa69d.
- **Rule** / **Strong Rule**: hairlines and dividers, and the dotted leaders and dashed prep boxes. Dark: #393731 / #5c5950.
- **Focus Blue** (focus): the focus outline only, never decoration. Dark: #8cc2ff.

### Named Rules
**The Chapter-From-Data Rule.** A page's colour comes from data: `recipes/<chapter>/chapter.json` `"color"` (one of tomato, matcha, yolk, plum, sea) is rendered as `data-color` and remaps `--chapter`, `--chapter-ink`, `--on-chapter` and `--chapter-wash`. Components only ever reference `--chapter*`, never a named colour. The fixed exceptions are the book's brand (tomato wordmark, seal, alarm) and the yolk Point label.

**The Three Inks Rule.** A fill and the text on it are separate tokens. Use `--chapter` for fills, rings and ticks; `--chapter-ink` for chapter-coloured text on paper or sheet; and `--on-chapter` for text on a chapter fill. Never put `--chapter` text on paper, and never pick white text by hand (yolk takes ink-coloured text). When the roles flip (an `--on-chapter` pill with chapter text on top), dark mode switches the text to `--chapter`.

**The Wash Rule.** Tints are `--chapter-wash`, which is the chapter mixed 12% into the sheet (16% in dark). It is used for hover rows, chips, time pills, servings buttons and photo placeholders. No other tints.

## Typography

**Display Font:** Zen Maru Gothic (with Hiragino Maru Gothic ProN, Arial Rounded MT Bold)
**Body Font:** Zen Kaku Gothic New (with Hiragino Sans, system-ui)

**Character:** A soft, round, heavy display face against a plain, clear Japanese gothic for reading. It is friendly at 900 and legible at arm's length.

### Hierarchy
- **Display** (900, clamp(2.25rem, 6vw, 3.25rem), 1, -0.03em): the book title line on the contents page. Folder bands use clamp(2rem, 5vw, 2.75rem). The finished page goes up to 5rem.
- **Headline** (900, clamp(2rem, 6vw, 3.25rem), -0.02em): prep and cook page heads, the contents title, the recipe spread title (up to 3.5rem).
- **Title** (900, 1.375-1.625rem): ingredient box, method, dialog and chapter-band titles.
- **Step** (body face, 400, clamp(1.375rem, 3.4vw, 1.875rem), 1.45, max 34ch): the single cook-step instruction, sized to read from the counter.
- **Body** (400, 1.0625rem, 1.65): running text, with 46-56ch measures for intros and summaries. Prep tasks and lead paragraphs step up to 1.1875rem.
- **Label** (display face, 700, 0.8125-0.9375rem): amounts, times, folios, tabs, page numbers, buttons (1.0625rem).

### Named Rules
**The Round Numbers Rule.** Every number the cook acts on (amounts, step numbers, timer clocks, page numbers, servings) is set in the display face at 700 or 900. Running prose is never set in it.

## Layout

The page is a centred column up to 1180px (`--page-width`) with 16px gutters on phones. From 760px it gets 32px gutters, with an extra 44px (`--tab-width`) on the right where the thumb index sits. Spacing follows a 4-8-12-16-24-32-48-72 scale. Sections are separated by 48-72px, and a folio closes each page 72px below the content.

- **Index pages** (contents, every folder, search) share one shell: from 900px a sticky 260px folder tree on the left beside one main column; below 900px the main column alone. The contents page is the top folder: a one-line title with tagline and a 92px tilted seal, the filter row, then chapters stacked in one column. Folder pages: path bar, a plain title line a size down (intro beneath, then recipe count and page in small display type), then the same rows. No coloured banner inside a folder.
- **Recipe spread:** one sheet, split into two pages with a centre fold from 1024px.
- **Prep and cook:** a main column plus a sticky 340px ingredient box from 1024px. Below that, a floating ingredients pill opens a bottom sheet (max 560px, 86dvh).
- **Chrome:** a sticky, blurred running head on top and a fixed 76px timer shelf at the bottom (the page pads itself to make room). On recipe pages under 760px, search collapses to an icon and the tabs hide so the step gets the room.
- **Breakpoints:** 560, 640, 760, 900, 1000 and 1024px.

## Elevation & Depth

Depth is mostly tonal: white sheets lie on off-white paper. Shadows are soft, warm and pulled in at the bottom (negative spread), like paper resting on paper. Nothing has hard offset shadows. In dark mode the shade deepens to 45% black.

### Shadow Vocabulary
- **Leaf** (`0 18px 40px -24px var(--shade)`): the recipe spread and cook step sheets.
- **Lift** (`0 10px 24px -8px var(--shade)`): floating objects such as the ingredients pill and the cover seal.
- **Press** (`0 3px 6px -2px` at rest, `0 6px 12px -4px` on hover, `0 1px 2px` when active): the primary pill button.
- **Dialog** (`0 24px 60px -12px var(--shade)`): modal dialogs.
- **Ring** (inset `0 0 0 1.5-2px`): outline borders on pills, boxes and timers drawn as inset shadows, not borders.
- **Gutter**: a horizontal gradient of `--gutter-shadow` (80px wide) down the centre of the open spread.

### Named Rules
**The Paper-On-Paper Rule.** A shadow means a sheet or object lying on the page. Use the tight negative-spread vocabulary above, never offset blocks or glows.

## Shapes

The book is round: rounded type, pill buttons and controls (999px), circles for step numbers, ticks, seals, the folio number and hero dishes. Containers use 12px corners (photos, ingredient box, thumbnails, tickets, chapter bands) or 20px (spread, cook step, chapter opener, dialogs, dashed prep boxes). Small 6px corners go on the wordmark, key hints, the Point label and focus outlines. Thumb-index tabs are rounded only on the side that sticks out.

Line styles carry meaning:
- **Solid hairline:** structure (running head, folio, rows).
- **3px dotted:** leaders from a name to its amount or page.
- **2px dashed:** "do this before the heat goes on" (prep box, before-heat box, the prep-not-done gate).

**The Dashed-Means-Prep Rule.** A dashed border is used only for mise en place and the gate before cooking. Everything else is solid or a ring.

## Components

### Buttons
- **Shape:** full pill (999px), 52px tall, 0 24px padding, display face 700.
- **Primary:** chapter fill with on-chapter text and the Press shadow. Hover lifts 1px, and active presses 1px down.
- **Quiet:** transparent with a 2px strong-rule inset ring that turns ink on hover.
- **Disabled:** rule fill, soft-ink text, no shadow, not-allowed cursor.
- **Icon button:** a 44px transparent circle with an 8% ink wash on hover. Icons are drawn for this book: 24px grid, 2px round stroke.
- **Focus (global):** 3px focus-blue outline with a 2px offset.

### Chips
- **Ingredient chip:** a chapter-wash pill, 0.9375rem, with the amount in the display face.
- **Tag:** a transparent pill with a 1.5px strong-rule ring and soft-ink text.
- **Time pill:** chapter wash, with a soft-ink term and the value in the display face.

### Cards / Containers
- **Ingredient box:** a sheet with a 2px chapter ring and 12px corners. The header bar is chapter-filled with on-chapter text and holds the servings stepper (a sheet pill with 38px wash circles). Each line is name, dotted leader, amount, with a minimum height of 48px. A ticked line is struck through in the chapter colour.
- **Prep box:** a sheet with a 2px dashed strong rule and 20px corners. Tasks are separated by 2px dotted rules, each with a large 34px round tick, and a segmented meter shows progress in the chapter colour.
- **Cook step:** a 20px sheet with the Leaf shadow. A chapter circle (56-84px) holds the number, beside step-size text.

### Inputs / Fields
- **Search:** a 44px sheet pill with a 1.5px rule ring. On focus-within the ring becomes 2px ink. A `/` key hint shows only on hover-capable devices.
- **Tick:** a 26px circle (34px large) with a 2px strong-rule border. When checked it fills with the chapter colour and the check mark scales in.

### Navigation
- **Running head:** sticky, with 92% paper and a 10px blur. It holds the tomato wordmark block (on the cover, only the round mark), search, the language switch (a segmented pill) and the theme switch.
- **Thumb index:** from 760px, chapter-coloured tabs with vertical text are fixed to the right edge, pushed 8px out. Hover pulls a tab in to 2px; the current tab sits flush and is taller and wider. On phones they hang from under the head as a scrollable row.
- **Folio:** a hairline-topped foot with the page number in a chapter pill.

### Contents Row (signature)
Contents are rows, not a card grid, and the same size on every index page: a 72px rounded thumbnail (64px on phones; a folder shows a wash tile with a folder icon), the title in the display face, a dotted leader, and the page number in chapter ink. Folder pages add one line of summary. Hover tints the row with the chapter wash. Each chapter heads its rows with the folder band.

### Folder Band (signature)
Only on the contents: a chapter-colour bar (12px corners, title 1.625rem/900, page number right) heading each chapter's rows, linking to the folder and sliding 4px right on hover. Folder pages don't repeat it; they open with the plain title line, so the page stays quiet and the rows come first.

### Point (signature)
A paper-coloured hint box (12px) beside a step, with a yolk "Point" label in the display face at 900.

### Timers (signature)
- **On a step:** a timer is a pill with a 2px chapter ring. When running it fills with the chapter colour and shows the clock at 1.5rem/900; a paused timer drops to 0.75 opacity.
- **On the shelf:** the bottom shelf holds inverted ink tickets (12px corners) that slide up 16px on arrival.
- **When finished:** both the step pill and its ticket shake like a bell (rotate ±1.5deg, 900ms, repeating) until stopped, and the ticket turns tomato.

### Motion
- **Easing:** `--ease-out` (cubic-bezier(0.16, 1, 0.3, 1)), at 160-320ms.
- **Properties:** motion moves things with transform. Colour states fade with background-color transitions, but layout properties are never animated.
- **Authored motion:** the cook step arrives like a turned page (520ms, perspective rotateY -12deg plus translateX 24px, origin left).
- **Reduced motion:** with `prefers-reduced-motion`, all motion collapses to 1ms.

## Do's and Don'ts

### Do:
- **Do** reference `--chapter`, `--chapter-ink`, `--on-chapter` and `--chapter-wash` in components, and let `data-color` (from `chapter.json`) pick the colour.
- **Do** keep fill and text colours separate: chapter text on paper is `--chapter-ink`, and text on a chapter fill is `--on-chapter`.
- **Do** set amounts, step numbers, clocks and page numbers in Zen Maru Gothic at 700/900.
- **Do** use dotted leaders between a name and its amount or page number.
- **Do** keep touch targets at 44px or more (52px for primary actions and timers).
- **Do** give every new colour pair a dark-mode value with lifted fills and dark on-colours.

### Don't:
- **Don't** hard-code a chapter hex in a component. Tomato (brand and alarm) and the yolk Point label are the only fixed uses.
- **Don't** use cream paper, serif type or a grid of recipe cards. Contents are rows.
- **Don't** use a dashed border for anything but prep and the gate before cooking.
- **Don't** add hard offset shadows or glows. Shadows are soft, negative-spread paper shadows.
- **Don't** add a second authored motion beside the page-turn and the timer bell, and don't animate layout properties.
- **Don't** put small uppercase labels above headings. The only tag-style label is the yolk Point label.
