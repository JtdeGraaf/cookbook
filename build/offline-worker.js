// Service worker: keeps a copy of the whole book so it opens without a connection.
// The build fills in CACHE_NAME and FILES; a new build means a new cache name, and the old copy is removed.
const CACHE_NAME = '__CACHE_NAME__'
const FILES = __FILES__
const NETWORK_WAIT_MS = 3000

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return

  // Pages: try the network for the newest book, but use the saved copy when offline or when the network takes
  // longer than a few seconds, as it can on kitchen wifi.
  if (request.mode === 'navigate') {
    const savedPage = () => caches.match('/')
    const slowNetwork = new Promise((resolve) => setTimeout(resolve, NETWORK_WAIT_MS)).then(savedPage)
    event.respondWith(Promise.race([fetch(request), slowNetwork]).catch(savedPage))
    return
  }

  // Everything else has a hash in its name, so a saved copy is never out of date.
  event.respondWith(caches.match(request).then((saved) => saved ?? fetch(request)))
})
