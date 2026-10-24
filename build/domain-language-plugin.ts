import type { Plugin } from 'vite'
import { DUTCH_HOSTNAMES, MANIFEST_PATHS } from '../src/lib/language.ts'

/**
 * The script that runs in the page head, before the first paint: on the Dutch domain it sets `lang="nl"` and links
 * the Dutch manifest, so a home-screen icon added there is named "Kookboek". Both domains share one build.
 */
export function writeDomainLanguageScript(): string {
  return [
    `if (${JSON.stringify(DUTCH_HOSTNAMES)}.indexOf(location.hostname) !== -1) {`,
    `  document.documentElement.lang = 'nl'`,
    `  document.querySelector('link[rel="manifest"]').setAttribute('href', ${JSON.stringify(MANIFEST_PATHS.nl)})`,
    `}`,
  ].join('\n')
}

/** Adds the domain-language script to index.html, after the manifest link it changes. */
export function domainLanguagePlugin(): Plugin {
  return {
    name: 'domain-language',
    transformIndexHtml: () => [{ tag: 'script', children: writeDomainLanguageScript(), injectTo: 'head' }],
  }
}
