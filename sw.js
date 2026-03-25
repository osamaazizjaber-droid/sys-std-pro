const CACHE_NAME = 'wms-pro-cache-v4';
const STATIC_ASSETS = [
    './',
    './auth.html',
    './favicon.png',
    './manifest.json',
    './css/style.css',
    './js/config.js',
    './js/auth.js',
    './js/app.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).catch(err => console.log('Cache install failed', err))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(keys.map((key) => {
                if (key !== CACHE_NAME) return caches.delete(key);
            }));
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Bypass Supabase API calls and Cross-Origin requests
    if (event.request.url.includes('supabase.co') || !event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => caches.match(event.request))
    );
});