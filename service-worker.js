const CACHE_NAME="x19-game-playable-v1";
const FILES=["./","./index.html","./style.css","./game.js","./manifest.json"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(FILES)));});
self.addEventListener("fetch",event=>{event.respondWith(caches.match(event.request).then(response=>response||fetch(event.request)));});
