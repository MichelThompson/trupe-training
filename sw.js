const VERSAO = "trupe-v2";

const ARQUIVOS = [
  "/trupe-training/",
  "/trupe-training/index.html",
  "/trupe-training/manifest.webmanifest",
  "/trupe-training/icons/icon-192.png",
  "/trupe-training/icons/icon-512.png",
  "/trupe-training/icons/icon-maskable-512.png",
  "/trupe-training/icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(VERSAO)
      .then(cache => cache.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== VERSAO)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        const copia = response.clone();

        caches.open(VERSAO).then(cache => {
          cache.put(event.request, copia);
        });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});