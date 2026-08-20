const CACHE = 'bisnis-pribadi-v1';
const ASSETS = [
    './',
    './index.html',
    './ulat.html',
    './dedak.html',
    './manifest.webmanifest',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE).then(function(cache) {
            return cache.addAll(ASSETS);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE; })
                    .map(function(k) { return caches.delete(k); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

self.addEventListener('fetch', function(e) {
    if (e.request.method !== 'GET') return;
    const url = new URL(e.request.url);
    if (url.origin !== location.origin) return;

    e.respondWith(
        caches.match(e.request).then(function(hit) {
            if (hit) return hit;
            return fetch(e.request).then(function(res) {
                if (res && res.status === 200 && res.type === 'basic') {
                    const copy = res.clone();
                    caches.open(CACHE).then(function(cache) { cache.put(e.request, copy); });
                }
                return res;
            }).catch(function() {
                if (e.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return Response.error();
            });
        })
    );
});