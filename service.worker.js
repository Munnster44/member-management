/* ==========================================================
   Member Management v2.3.4-PWA
   Service Worker for GitHub Pages
   © 2025 Glen Carruthers
========================================================== */

const CACHE_NAME = "member-mgmt-v2.3.4";
const OFFLINE_FILES = [
  "./",
  "./index.html",
  "./Member-Management_v2.3.4-PWA.html",
  "./xlsx.full.min.js",
  "./icon-192.png",
  "./icon-512.png"
];

/* ----------------------------------------------------------
   INSTALL — cache essential files
---------------------------------------------------------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(OFFLINE_FILES);
    })
  );
  self.skipWaiting();
});

/* ----------------------------------------------------------
   ACTIVATE — remove old caches
---------------------------------------------------------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ----------------------------------------------------------
   FETCH — network first for HTML, cache fallback
---------------------------------------------------------- */
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Only GET methods are cachable
  if (req.method !== "GET") return;

  // HTML files → network first for updates
  if (req.headers.get("Accept")?.includes("text/html")) {
    event.respondWith(
      fetch(req)
        .then(res => {
          // update cache
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
    return;
  }

  // All other files → cache first, fallback to network
  event.respondWith(
    caches.match(req).then(
      cached =>
        cached ||
        fetch(req).then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
          return res;
        })
    )
  );
});
