// Service Worker para permitir la instalación de la App
self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  e.respondWith(fetch(e.request));
});