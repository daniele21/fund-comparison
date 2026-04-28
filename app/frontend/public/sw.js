const CACHE_PREFIX = 'fund-comparison-pwa';
const CACHE_VERSION = '2026-04-28-v1';
const APP_SHELL_CACHE = `${CACHE_PREFIX}-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}-runtime-${CACHE_VERSION}`;
const API_RUNTIME_CACHE = `${CACHE_PREFIX}-api-${CACHE_VERSION}`;
const SAFE_API_GET_PATHS = ['/auth/config'];
const SAFE_API_GET_PREFIXES = ['/api/public/'];

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/brand/icon-192.png',
  '/brand/icon-512.png',
  '/brand/logo-accprev.webp',
];

function isStaticAssetRequest(request) {
  return ['script', 'style', 'font', 'image'].includes(request.destination);
}

function isSafeApiGetRequest(request, requestUrl) {
  if (request.method !== 'GET') {
    return false;
  }

  const hasAuthorizationHeader = Boolean(request.headers.get('authorization'));
  if (hasAuthorizationHeader) {
    return false;
  }

  const pathname = requestUrl.pathname;
  return (
    SAFE_API_GET_PATHS.includes(pathname) ||
    SAFE_API_GET_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith(CACHE_PREFIX) &&
                key !== APP_SHELL_CACHE &&
                key !== RUNTIME_CACHE &&
                key !== API_RUNTIME_CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put('/index.html', networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const routeCache = await caches.match(request);
    if (routeCache) {
      return routeCache;
    }

    const shellCache = await caches.match('/index.html');
    if (shellCache) {
      return shellCache;
    }

    const offlineFallback = await caches.match('/offline.html');
    if (offlineFallback) {
      return offlineFallback;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Offline',
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cachedResponse = await cache.match(request);

  const networkRequest = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cachedResponse) {
    event.waitUntil(networkRequest.then(() => undefined));
    return cachedResponse;
  }

  const networkResponse = await networkRequest;
  if (networkResponse) {
    return networkResponse;
  }

  if (request.destination === 'image') {
    const fallbackIcon = await caches.match('/brand/icon-192.png');
    if (fallbackIcon) {
      return fallbackIcon;
    }
  }

  return new Response(null, { status: 504, statusText: 'Gateway Timeout' });
}

async function networkFirstSafeApi(request) {
  const apiCache = await caches.open(API_RUNTIME_CACHE);

  try {
    const networkResponse = await fetch(request);
    const cacheControlHeader = (networkResponse.headers.get('Cache-Control') || '').toLowerCase();
    const shouldCache = networkResponse.ok && !cacheControlHeader.includes('no-store') && !cacheControlHeader.includes('private');

    if (shouldCache) {
      apiCache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await apiCache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response(JSON.stringify({ detail: 'Offline' }), {
      status: 503,
      statusText: 'Offline',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);
  if (isSafeApiGetRequest(request, requestUrl)) {
    event.respondWith(networkFirstSafeApi(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (isStaticAssetRequest(request)) {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});
