/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// Use type assertion instead of declaration to avoid the "Cannot redeclare" error
const sw = self as unknown as ServiceWorkerGlobalScope;

let CACHE_NAME = "cache-" + Date.now();

sw.addEventListener("install", (event) => {
  console.log("Installed SW");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add("/offline.html");
    })
  );
  sw.skipWaiting();
});

sw.addEventListener("activate", (event) => {
  console.log("Activated SW");
  event.waitUntil(
    // Loop through the cache
    caches.keys().then((keys) => {
      // We must return a promise so it gets awaited
      return Promise.all(
        keys.map((k) => {
          // If the key doesn't match the name of the current cache, delete it
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
});

sw.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match("offline.html").then((response) => {
          return response || new Response("Offline page not found in cache.");
        });
      });
    })
  );
});

sw.addEventListener("push", (e) => {
  const data = e.data?.json();
  sw.registration.showNotification(data.title, {
    body: data.body,
    icon: "/favicons/android-chrome-192x192.png",
  });
});
