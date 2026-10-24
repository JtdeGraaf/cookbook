import { describe, expect, it } from 'vitest'
import { writeDomainLanguageScript } from './domain-language-plugin.ts'

/** Runs the head script against a page on `hostname` and returns what it left behind. */
function runOn(hostname: string) {
  const page = { lang: 'en', manifest: '/manifest.webmanifest' }
  const manifestLink = {
    setAttribute(name: string, value: string) {
      if (name === 'href') page.manifest = value
    },
  }
  const document = {
    documentElement: {
      set lang(value: string) {
        page.lang = value
      },
    },
    querySelector: (selector: string) => (selector === 'link[rel="manifest"]' ? manifestLink : null),
  }
  new Function('location', 'document', writeDomainLanguageScript())({ hostname }, document)
  return page
}

describe('domain-language head script', () => {
  it('links the Dutch manifest and sets lang="nl" on kookboek.graaf.dev', () => {
    expect(runOn('kookboek.graaf.dev')).toEqual({ lang: 'nl', manifest: '/manifest.nl.webmanifest' })
  })

  it('keeps the English manifest and lang="en" on cookbook.graaf.dev', () => {
    expect(runOn('cookbook.graaf.dev')).toEqual({ lang: 'en', manifest: '/manifest.webmanifest' })
  })
})
