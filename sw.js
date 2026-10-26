const CACHE = 'rainguard-v7';
const ASSETS = ['./', './index.html', './styles.css', './weather-v2.css', './app-v2.js', './imd.css', './imd-live.js', './imd-data.json', './windy-ui.css', './windy-ui-fix.css', './windy-ui-v5.js', './flow-overlay.css', './flow-overlay.js', './india-forecast-label.js', './weather-tools-fix.css', './weather-tools-fix.js', './manifest.webmanifest', './icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (new URL(request.url).origin === self.location.origin) {
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok && request.method === 'GET') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      }).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw new Error('RainGuard asset is not cached for offline use.');
      })
    );
  }
});
