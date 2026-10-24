import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { isLinkPreviewFile, writeRecipePages, type BuildFile } from './link-preview-plugin.ts'

const INDEX_HTML = `<!doctype html>
<html lang="en">
  <head>
    <title>Cookbook · Kookboek</title>
    <meta
      name="description"
      content="A personal bilingual cookbook."
    />
    <script type="module" src="/assets/index-abc.js"></script>
  </head>
  <body><div id="root"></div></body>
</html>
`

let root: string

function addRecipe(path: string, recipe: Record<string, unknown>) {
  const folder = join(root, path)
  mkdirSync(folder, { recursive: true })
  writeFileSync(join(folder, 'recipe.json'), JSON.stringify(recipe))
}

function recipe(overrides: Record<string, unknown>): Record<string, unknown> {
  return {
    servings: 2,
    prepMinutes: 10,
    cookMinutes: 15,
    ingredients: [{ id: 'kale', name: { en: 'kale', nl: 'boerenkool' }, amount: 500, unit: 'g' }],
    prep: [{ text: { en: 'Wash the kale.', nl: 'Was de boerenkool.' }, ingredients: ['kale'] }],
    cook: [{ text: { en: 'Cook it.', nl: 'Kook het.' } }],
    ...overrides,
  }
}

/** The page's link-preview tags as name → content, and its <title>. */
function readHead(file: BuildFile) {
  const html = String(file.source)
  const tags = Object.fromEntries(
    [...html.matchAll(/<meta (?:name|property)="([^"]+)" content="([^"]*)" \/>/g)].map((match) => [match[1], match[2]]),
  )
  return { title: html.match(/<title>(.*)<\/title>/)?.[1], tags }
}

function findFile(files: BuildFile[], fileName: string): BuildFile {
  const file = files.find((candidate) => candidate.fileName === fileName)
  if (!file) throw new Error(`${fileName} not written; got ${files.map((f) => f.fileName).join(', ')}`)
  return file
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'recipes-'))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe('writeRecipePages', () => {
  it('writes a recipe page with its title, summary and photo in both languages', async () => {
    addRecipe(
      'mains/kale-stamppot',
      recipe({
        title: { en: 'Kale stamppot', nl: 'Boerenkoolstamppot met rookworst' },
        summary: { en: 'Mash with kale & "rookworst".', nl: 'Stamppot met boerenkool en rookworst.' },
        cover: { file: 'cover.jpg', alt: { en: 'A plate of stamppot.', nl: 'Een bord stamppot.' } },
      }),
    )
    const photo = sharp({ create: { width: 1600, height: 1200, channels: 3, background: '#c93f1f' } })
    await photo.jpeg().toFile(join(root, 'mains/kale-stamppot/cover.jpg'))

    const files = await writeRecipePages(INDEX_HTML, root)

    const image = files.find((file) => file.fileName.startsWith('previews/mains/kale-stamppot-'))
    expect(image?.fileName).toMatch(/^previews\/mains\/kale-stamppot-[0-9a-f]{8}\.jpg$/)
    expect(await sharp(image?.source as Uint8Array).metadata()).toMatchObject({
      format: 'jpeg',
      width: 1200,
      height: 630,
    })
    expect(readHead(findFile(files, 'mains/kale-stamppot.html'))).toEqual({
      title: 'Kale stamppot / Boerenkoolstamppot met rookworst · Cookbook · Kookboek',
      tags: {
        description: 'Mash with kale &amp; &quot;rookworst&quot;. / Stamppot met boerenkool en rookworst.',
        'og:type': 'article',
        'og:site_name': 'Cookbook · Kookboek',
        'og:title': 'Kale stamppot / Boerenkoolstamppot met rookworst',
        'og:description': 'Mash with kale &amp; &quot;rookworst&quot;. / Stamppot met boerenkool en rookworst.',
        'og:url': 'https://cookbook.graaf.dev/mains/kale-stamppot',
        'og:locale': 'en_GB',
        'og:locale:alternate': 'nl_NL',
        'og:image': `https://cookbook.graaf.dev/${image?.fileName}`,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': 'A plate of stamppot.',
        'twitter:card': 'summary_large_image',
      },
    })
  })

  it('keeps the rest of index.html, so the page still starts the app', async () => {
    addRecipe('mains/toast', recipe({ title: { en: 'Toast', nl: 'Toast' }, summary: { en: 'Hot.', nl: 'Heet.' } }))

    const html = String(findFile(await writeRecipePages(INDEX_HTML, root), 'mains/toast.html').source)

    expect(html).toContain('<script type="module" src="/assets/index-abc.js"></script>')
    expect(html).toContain('<div id="root"></div>')
    expect(html).not.toContain('A personal bilingual cookbook.')
  })

  it('names a dish once when both languages call it the same, and leaves out the photo when there is none', async () => {
    addRecipe('mains/toast', recipe({ title: { en: 'Toast', nl: 'Toast' }, summary: { en: 'Hot.', nl: 'Heet.' } }))

    const files = await writeRecipePages(INDEX_HTML, root)

    expect(files.map((file) => file.fileName)).toEqual(['mains/toast.html'])
    const { title, tags } = readHead(findFile(files, 'mains/toast.html'))
    expect(title).toBe('Toast · Cookbook · Kookboek')
    expect(tags['og:title']).toBe('Toast')
    expect(tags['og:image']).toBeUndefined()
    expect(tags['twitter:card']).toBe('summary')
  })
})

describe('isLinkPreviewFile', () => {
  it('picks out recipe pages and preview photos, not the app itself', () => {
    expect(isLinkPreviewFile('mains/pasta/carbonara.html')).toBe(true)
    expect(isLinkPreviewFile('previews/mains/pasta/carbonara-1a2b3c4d.jpg')).toBe(true)
    expect(isLinkPreviewFile('index.html')).toBe(false)
    expect(isLinkPreviewFile('assets/cover-1a2b3c4d.webp')).toBe(false)
  })
})
