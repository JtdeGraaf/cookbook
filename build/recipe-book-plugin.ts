import { relative, resolve } from 'node:path'
import type { Plugin } from 'vite'
import { readRecipeFolder } from './read-recipe-folder.ts'

const MODULE_ID = 'virtual:recipe-book'
const RESOLVED_MODULE_ID = '\0' + MODULE_ID

/** Widths in pixels of the webp files made from each photo. */
const IMAGE_WIDTHS = '480;960;1440'

/**
 * Serves `virtual:recipe-book`: every recipe under `recipesFolder`, checked at build time, with each photo imported
 * through vite-imagetools so it is resized and converted to webp.
 */
export function recipeBookPlugin(recipesFolder: string): Plugin {
  let projectRoot = process.cwd()
  let recipesRoot = resolve(recipesFolder)
  return {
    name: 'recipe-book',
    configResolved(config) {
      projectRoot = config.root
      recipesRoot = resolve(config.root, recipesFolder)
    },
    resolveId(id) {
      if (id === MODULE_ID) return RESOLVED_MODULE_ID
    },
    load(id) {
      if (id !== RESOLVED_MODULE_ID) return
      const imagePaths: string[] = []
      const book = readRecipeFolder(recipesRoot)
      const json = JSON.stringify(book, (key, value) => {
        if (key !== 'file' || typeof value !== 'string') return value
        imagePaths.push(value)
        return `__image_${imagePaths.length - 1}__`
      })
      const imports = imagePaths.map((path, index) => {
        // Paths starting with "/" are read from the project root, in dev and in the build.
        const fromRoot = '/' + relative(projectRoot, path).replace(/\\/g, '/')
        return `import image${index} from ${JSON.stringify(`${fromRoot}?w=${IMAGE_WIDTHS}&format=webp&quality=72&as=img`)}`
      })
      const body = json.replace(/"__image_(\d+)__"/g, (_match, index) => `image${index}`)
      return `${imports.join('\n')}\nexport const book = ${body}\n`
    },
    configureServer(server) {
      // New or edited recipes show up in dev without a restart.
      server.watcher.add(recipesRoot)
      const reload = (path: string) => {
        if (!resolve(path).startsWith(recipesRoot)) return
        const module = server.moduleGraph.getModuleById(RESOLVED_MODULE_ID)
        if (module) server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', reload)
      server.watcher.on('change', reload)
      server.watcher.on('unlink', reload)
    },
  }
}
