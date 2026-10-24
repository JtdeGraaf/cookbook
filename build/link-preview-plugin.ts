import { createHash } from 'node:crypto'
import { resolve } from 'node:path'
import sharp from 'sharp'
import type { Plugin } from 'vite'
import type { Recipe } from '../src/lib/book.ts'
import { allRecipes } from '../src/lib/book.ts'
import { readRecipeFolder, type ImagePath } from './read-recipe-folder.ts'

/**
 * Link previews need absolute addresses, and static files can't know which of the two domains was asked for. The
 * English domain is the one the book started on; the Dutch domain serves the very same files.
 */
export const PREVIEW_ORIGIN = 'https://cookbook.graaf.dev'

/** Folder in the build that holds the preview photos. */
export const PREVIEW_IMAGE_FOLDER = 'previews'

/** The size chat apps show a large link preview at. */
const PREVIEW_IMAGE_WIDTH = 1200
const PREVIEW_IMAGE_HEIGHT = 630

/** What a chat app shows for a shared link. */
export type LinkPreview = {
  title: string
  description: string
  url: string
  image: { url: string; alt: string } | null
}

/** A file to add to the build, relative to its root. */
export type BuildFile = { fileName: string; source: string | Uint8Array }

/**
 * Both domains serve the same file and the link's `?lang=` never reaches a static file, so a preview names the dish
 * in both languages (once when they are the same). The summary leads with English, the book's default language, and
 * follows with Dutch, which a short preview cuts off.
 */
export function describeRecipeLink(recipe: Recipe<ImagePath>, imageUrl: string | null): LinkPreview {
  return {
    title: inBothLanguages(recipe.title.en, recipe.title.nl),
    description: inBothLanguages(recipe.summary.en, recipe.summary.nl),
    url: `${PREVIEW_ORIGIN}/${recipe.path}`,
    image: imageUrl && recipe.cover ? { url: imageUrl, alt: recipe.cover.alt.en } : null,
  }
}

/** index.html with the page title, description and link-preview tags of one recipe. */
export function writeLinkPreviewPage(indexHtml: string, preview: LinkPreview): string {
  const siteName = readTitle(indexHtml)
  const tags = [
    `<meta name="description" content="${escapeHtml(preview.description)}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:site_name" content="${escapeHtml(siteName)}" />`,
    `<meta property="og:title" content="${escapeHtml(preview.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(preview.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(preview.url)}" />`,
    `<meta property="og:locale" content="en_GB" />`,
    `<meta property="og:locale:alternate" content="nl_NL" />`,
    ...(preview.image
      ? [
          `<meta property="og:image" content="${escapeHtml(preview.image.url)}" />`,
          `<meta property="og:image:width" content="${PREVIEW_IMAGE_WIDTH}" />`,
          `<meta property="og:image:height" content="${PREVIEW_IMAGE_HEIGHT}" />`,
          `<meta property="og:image:alt" content="${escapeHtml(preview.image.alt)}" />`,
        ]
      : []),
    `<meta name="twitter:card" content="${preview.image ? 'summary_large_image' : 'summary'}" />`,
  ]
  return replaceOnce(
    replaceOnce(indexHtml, TITLE_TAG, `<title>${escapeHtml(`${preview.title} · ${siteName}`)}</title>`),
    DESCRIPTION_TAG,
    tags.join('\n    '),
  )
}

/** One page per recipe at `<recipe path>.html`, plus a preview photo for each recipe with a cover. */
export async function writeRecipePages(indexHtml: string, recipesRoot: string): Promise<BuildFile[]> {
  const recipes = allRecipes(readRecipeFolder(recipesRoot))
  const files: BuildFile[] = []
  for (const recipe of recipes) {
    const image = recipe.cover ? await writePreviewImage(recipe.cover.file, recipe.path) : null
    if (image) files.push(image)
    const imageUrl = image ? `${PREVIEW_ORIGIN}/${image.fileName}` : null
    files.push({
      fileName: `${recipe.path}.html`,
      source: writeLinkPreviewPage(indexHtml, describeRecipeLink(recipe, imageUrl)),
    })
  }
  return files
}

/** The recipe pages and preview photos: only chat apps need them, so the offline copy leaves them out. */
export function isLinkPreviewFile(fileName: string): boolean {
  if (fileName.startsWith(`${PREVIEW_IMAGE_FOLDER}/`)) return true
  return fileName.endsWith('.html') && fileName !== 'index.html'
}

/**
 * Adds a page per recipe next to index.html, so a shared link shows the dish's name, summary and photo in chat apps,
 * which don't run JavaScript. Cloudflare serves `mains/pasta/carbonara.html` at `/mains/pasta/carbonara`; every
 * other address still falls back to index.html.
 */
export function linkPreviewPlugin(recipesFolder: string): Plugin {
  let recipesRoot = resolve(recipesFolder)
  return {
    name: 'link-preview',
    apply: 'build',
    // After Vite's own HTML step, so index.html already has its scripts, styles and head tags.
    enforce: 'post',
    configResolved(config) {
      recipesRoot = resolve(config.root, recipesFolder)
    },
    async generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (index?.type !== 'asset' || typeof index.source !== 'string') {
        this.error('index.html is missing from the build, so no recipe pages can be made from it.')
      }
      for (const file of await writeRecipePages(index.source, recipesRoot)) {
        this.emitFile({ type: 'asset', fileName: file.fileName, source: file.source })
      }
    },
  }
}

const TITLE_TAG = /<title>[^<]*<\/title>/
const DESCRIPTION_TAG = /<meta\s+name="description"[^>]*>/

async function writePreviewImage(photo: ImagePath, recipePath: string): Promise<BuildFile> {
  const source = await sharp(photo)
    .resize(PREVIEW_IMAGE_WIDTH, PREVIEW_IMAGE_HEIGHT, { fit: 'cover' })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer()
  // The name changes with the photo, so chat apps that keep old previews fetch the new one.
  const hash = createHash('sha256').update(source).digest('hex').slice(0, 8)
  return { fileName: `${PREVIEW_IMAGE_FOLDER}/${recipePath}-${hash}.jpg`, source }
}

function inBothLanguages(english: string, dutch: string): string {
  return english === dutch ? english : `${english} / ${dutch}`
}

function readTitle(html: string): string {
  const title = html.match(TITLE_TAG)?.[0]
  if (!title) throw new Error('index.html has no <title> to name the site in link previews.')
  return title.slice('<title>'.length, -'</title>'.length).trim()
}

function replaceOnce(html: string, tag: RegExp, replacement: string): string {
  if (!tag.test(html)) throw new Error(`index.html has no ${tag.source} to replace for link previews.`)
  return html.replace(tag, () => replacement)
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
