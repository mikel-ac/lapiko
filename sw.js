/* LAPIKO service worker
   Sube el número de VERSION cada vez que cambies index.html u otros archivos,
   para que la app se actualice en los dispositivos. */
const VERSION = 'lapiko-v12';
const ASSETS = ['index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(VERSION).then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => {}))))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => k !== VERSION ? caches.delete(k) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Navegaciones: servir la app (shell) desde caché para que abra sin conexión
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('index.html').then(hit => hit || fetch(req).catch(() => caches.match('index.html')))
    );
    return;
  }
  // Resto: caché primero, y si baja de la red, guardar copia (incluye Google Fonts)
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const u = new URL(req.url);
      if (u.origin === location.origin || u.host.indexOf('gstatic') > -1 || u.host.indexOf('googleapis') > -1) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => hit))
  );
});
