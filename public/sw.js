const CACHE_PREFIX = "lordic-campus-";
const STATIC_CACHE = `${CACHE_PREFIX}static-v1`;
const PAGE_CACHE = `${CACHE_PREFIX}pages-v1`;
const OFFLINE_URL = "/offline.html";
const MAX_CACHED_PAGES = 40;

// Bump these cache versions when the cache format or offline shell changes.
const PRECACHE = [
  { url: "/", cacheName: PAGE_CACHE },
  { url: OFFLINE_URL, cacheName: STATIC_CACHE },
  { url: "/manifest.webmanifest", cacheName: STATIC_CACHE },
  { url: "/favicon.svg", cacheName: STATIC_CACHE },
  { url: "/pwa-192x192.png", cacheName: STATIC_CACHE },
  { url: "/pwa-512x512.png", cacheName: STATIC_CACHE },
  { url: "/apple-touch-icon.png", cacheName: STATIC_CACHE },
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      await Promise.all(
        PRECACHE.map(async ({ url, cacheName }) => {
          try {
            const response = await fetch(new Request(url, { cache: "reload" }));
            if (response.ok) {
              const cache = await caches.open(cacheName);
              await cache.put(url, response);
            }
          } catch {
            // Pre-caching is best-effort; a failed item must not block installation.
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC_CACHE, PAGE_CACHE]);
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX) && !keep.has(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

async function trimPageCache(cache) {
  const requests = await cache.keys();
  const savedPages = requests.filter((request) => new URL(request.url).pathname !== "/");
  while (savedPages.length > MAX_CACHED_PAGES) {
    await cache.delete(savedPages.shift());
  }
}

async function savePageSnapshot(path) {
  let url;
  try {
    url = new URL(path, self.location.origin);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  try {
    const request = new Request(url.href, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "text/html" },
    });
    const response = await fetch(request);
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return;

    const cache = await caches.open(PAGE_CACHE);
    try {
      await cache.put(url.pathname, response.clone());
      await trimPageCache(cache);
    } catch {
      // Storage may be full or the response may be marked as uncacheable.
    }
  } catch {
    // The page is still usable online if a background snapshot fails.
  }
}

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_PAGE" || typeof event.data.path !== "string") return;
  event.waitUntil(savePageSnapshot(event.data.path));
});

async function networkFirstNavigation(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) {
      try {
        await cache.put(request, response.clone());
        await trimPageCache(cache);
      } catch {
        // Keep serving the live response even if the browser declines to cache it.
      }
      return response;
    }
    if (response.status >= 500) {
      return (await cache.match(request, { ignoreSearch: true })) || response;
    }
    return response;
  } catch {
    return (
      (await cache.match(request, { ignoreSearch: true })) ||
      (await caches.match(OFFLINE_URL)) ||
      new Response("You are offline. Reconnect and reload this page.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      })
    );
  }
}

async function cacheFirstAsset(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    try {
      await cache.put(request, response.clone());
    } catch {
      // The asset remains available from the network if storage is unavailable.
    }
  }
  return response;
}

function isCacheableAsset(request, url) {
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/pyodide/")) return true;
  if (url.pathname === "/pyodide-worker.mjs") return true;
  if ([
    "/manifest.webmanifest",
    "/favicon.svg",
    "/pwa-192x192.png",
    "/pwa-512x512.png",
    "/apple-touch-icon.png",
  ].includes(url.pathname)) return true;
  return ["script", "style", "image", "font", "worker"].includes(request.destination);
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;
  if (request.headers.has("RSC") || request.headers.has("Next-Router-Prefetch") || url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isCacheableAsset(request, url)) {
    event.respondWith(cacheFirstAsset(request));
  }
});
