const CACHE = 'rainguard-v5';
const ASSETS = ['./', './index.html', './styles.css', './weather-v2.css', './imd.css', './imd-live.js', './imd-data.json', './windy-ui.css', './windy-ui-fix.css', './windy-ui-v5.js', './flow-overlay.css', './flow-overlay.js', './india-forecast-label.js', './weather-tools-fix.css', './weather-tools-fix.js', './manifest.webmanifest', './icon.svg'];

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
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return response;
      }).catch(() => caches.match(request))
    );
  }
});
