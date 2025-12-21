const CACHE_NAME = 'app-cache-v1';

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Only handle same-origin requests
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Clone the response for caching
                    const responseToCache = response.clone();
                    // Cache successful responses
                    if (response.status === 200) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // If fetch fails, try to serve from cache
                    return caches.match(event.request).then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If not in cache and it's a navigation request, return index.html
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
                })
        );
    }
});
