import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'
import { isLinkPreviewFile } from './link-preview-plugin.ts'

const WORKER_FILE = 'sw.js'

/** Writes sw.js next to the build: a service worker that saves every file of the site for offline use. */
export function offlinePlugin(): Plugin {
  let publicFolder = ''
  return {
    name: 'offline',
    apply: 'build',
    configResolved(config) {
      publicFolder = config.publicDir
    },
    // After writing, so index.html (added late by Vite) is in the list too.
    writeBundle(options, bundle) {
      const outFolder = options.dir ?? 'dist'
      const fileNames = [...new Set([...Object.keys(bundle), ...readdirSync(publicFolder)])]
        // Recipe pages are index.html with link-preview tags; offline, every page falls back to the saved `/`.
        .filter((file) => file !== WORKER_FILE && !isLinkPreviewFile(file))
        .sort()
      // Contents too, not only names: files from public/ (manifests, icons) keep their name when they change.
      const hash = createHash('sha256')
      for (const file of fileNames) hash.update(file).update(readFileSync(join(outFolder, file)))
      const cacheName = `cookbook-${hash.digest('hex').slice(0, 12)}`
      // Cloudflare redirects /index.html to /, and a redirected response can't stand in for a page.
      const files = fileNames.map((file) => (file === 'index.html' ? '/' : `/${file}`))
      const template = readFileSync(resolve(import.meta.dirname, 'offline-worker.js'), 'utf8')
      const source = template
        .replace("'__CACHE_NAME__'", JSON.stringify(cacheName))
        .replace('__FILES__', JSON.stringify(files, null, 2))
      writeFileSync(join(outFolder, WORKER_FILE), source)
    },
  }
}
