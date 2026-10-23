import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'

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
      const files = [...new Set([...Object.keys(bundle), ...readdirSync(publicFolder)])]
        .filter((file) => file !== WORKER_FILE)
        .sort()
        // Cloudflare redirects /index.html to /, and a redirected response can't stand in for a page.
        .map((file) => (file === 'index.html' ? '/' : `/${file}`))
      const cacheName = `cookbook-${createHash('sha256').update(files.join('\n')).digest('hex').slice(0, 12)}`
      const template = readFileSync(resolve(import.meta.dirname, 'offline-worker.js'), 'utf8')
      const source = template
        .replace("'__CACHE_NAME__'", JSON.stringify(cacheName))
        .replace('__FILES__', JSON.stringify(files, null, 2))
      writeFileSync(join(outFolder, WORKER_FILE), source)
    },
  }
}
