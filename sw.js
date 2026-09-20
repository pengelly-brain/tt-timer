/* Beach Sprint TT Timer — offline shell.
   Bump CACHE whenever the shell changes. */
var CACHE = "ttt-v3";
var ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c){ return c.addAll(ASSETS); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys()
      .then(function(keys){
        return Promise.all(keys.map(function(k){
          return k === CACHE ? null : caches.delete(k);
        }));
      })
      .then(function(){ return self.clients.claim(); })
  );
});

/* Fetch with a deadline. At the water there may be one bar of signal, and a
   page that hangs waiting for the network is worse than a slightly old one. */
function fetchWithin(req, ms){
  return new Promise(function(resolve, reject){
    var settled = false;
    var timer = setTimeout(function(){
      if (!settled){ settled = true; reject(new Error("too slow")); }
    }, ms);
    fetch(req).then(
      function(res){ if (!settled){ settled = true; clearTimeout(timer); resolve(res); } },
      function(err){ if (!settled){ settled = true; clearTimeout(timer); reject(err); } }
    );
  });
}

self.addEventListener("fetch", function(e){
  var req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;

  /* The page itself: try the network first, but only briefly, then fall back
     to the saved copy. Cache-first here meant every update landed a refresh
     late, because the saved page was served before the new one was even
     fetched. */
  if (req.mode === "navigate"){
    e.respondWith(
      fetchWithin(req, 2500).then(function(res){
        if (res && res.ok){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put("./index.html", copy); });
        }
        return res;
      }).catch(function(){
        return caches.match("./index.html").then(function(hit){
          return hit || caches.match("./");
        });
      })
    );
    return;
  }

  /* Everything else is versioned by the cache name, so the saved copy wins
     and the screen never waits on the network. */
  e.respondWith(
    caches.match(req).then(function(hit){
      if (hit) return hit;
      return fetch(req).then(function(res){
        if (res && res.ok){
          var copy = res.clone();
          caches.open(CACHE).then(function(c){ c.put(req, copy); });
        }
        return res;
      }).catch(function(){
        throw new Error("offline");
      });
    })
  );
});
