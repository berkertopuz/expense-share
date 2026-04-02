const CACHE_NAME = "expense-share-v2";
const API_CACHE_NAME = "expense-share-api-v1";

const STATIC_ASSETS = ["/offline.html"];

// Install SW
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

// Activate SW
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME && k !== API_CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

// Network first, cache fallback strategy
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // tRPC API - network first, cache fallback
  if (url.pathname.startsWith("/api/trpc/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(API_CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          return new Response(JSON.stringify({ result: { data: null } }), {
            headers: { "Content-Type": "application/json" },
          });
        })
    );
    return;
  }

  if (url.pathname.startsWith("/api/")) return;

  // Static files - network first, cache fallback with offline page for navigations
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html");
        }
        return new Response("", { status: 503 });
      })
  );
});

// Push Notification
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Expense Share", {
      body: data.body || "Yeni bildirim",
      icon: "/icons/icon-192.png",
      data: { url: data.url || "/dashboard" },
    })
  );
});

// Notification Click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
