const CACHE_NAME = "trupe-training-v1";

const ARQUIVOS = [
  "/trupe-training/",
  "/trupe-training/index.html",
  "/trupe-training/manifest.webmanifest",
  "/trupe-training/icons/icon-192.png",
  "/trupe-training/icons/icon-512.png",
  "/trupe-training/icons/icon-maskable-512.png",
  "/trupe-training/icons/apple-touch-icon.png"
];

// Instala o Service Worker e salva os arquivos no cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS);
    })
  );

  self.skipWaiting();
});

// Ativa o novo Service Worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});

// Tenta buscar da internet.
// Se estiver offline, usa o cache.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});