/* ای‌کام شاپ — Service Worker (PWA) */
const VER = 'ecomshop-v1';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VER).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VER).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  /* صفحات HTML و فایل‌های دیتای سایت: همیشه اول شبکه (تا سایت قدیمی نشود)، در نبود شبکه حافظه */
  if (e.request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request)
        .then(r => { const cp = r.clone(); caches.open(VER).then(c => c.put(e.request, cp)); return r; })
        .catch(() => caches.match(e.request).then(m => m || caches.match('./index.html')))
    );
    return;
  }

  /* بقیه (آیکون، مانيفست و ...): حافظه اول */
  e.respondWith(
    caches.match(e.request).then(m => m || fetch(e.request).then(r => {
      const cp = r.clone(); caches.open(VER).then(c => c.put(e.request, cp)); return r;
    }))
  );
});
