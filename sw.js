// Service worker: deixa o app funcionar offline.
// Ao publicar uma atualização, aumente o número da versão abaixo.
const VERSAO = "trupe-v1";
const ARQUIVOS = ["./","index.html","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/icon-maskable-512.png","icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  const mesmaOrigem = url.origin === location.origin;
  const fonte = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!mesmaOrigem && !fonte) return;
  // Arquivos do app: tenta a rede primeiro (pega updates) e cai pro cache se estiver offline. Fontes: cache primeiro.
  if (fonte) {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const cp = res.clone(); caches.open(VERSAO).then(c => c.put(e.request, cp)); return res;
    })));
  } else {
    e.respondWith(fetch(e.request).then(res => {
      const cp = res.clone(); caches.open(VERSAO).then(c => c.put(e.request, cp)); return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
  }
});
