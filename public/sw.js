var CACHE_STATIC_NAME = 'static-v17';
var CACHE_DYNAMIC_NAME = 'dynamic-v4';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll(STATIC_FILES)
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  if (array && array.length > 0) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] === string) {
        return true;
      }
    }
  }
  return false;
}

self.addEventListener('fetch', function (event) {
  var url = 'https://pwagram-9f12c-default-rtdb.firebaseio.com/posts.json';

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function (cache) {
          return fetch(event.request)
            .then(function (res) {
              cache.put(event.request, res.clone());
              return res;
            })
        })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request)
    )
  }
  else {
    event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
            .then(function (res) {
              caches.open(CACHE_DYNAMIC_NAME)
                .then(function (cache) {
                  cache.put(event.request.url, res.clone())
                  return res;
                })
            })
            .catch(() => {
              return caches.open(CACHE_STATIC_NAME)
                .then(function (cache) {
                  if (event.request.url.indexOf('/help')) {
                    return cache.match('/offline.html')  
                  }
                })
            })
        }
      }))
  }
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function (response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function (res) {
//               caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function (cache) {
//                   cache.put(event.request.url, res.clone())
//                   return res;
//                 })
//             })
//             .catch(() => {
//               // do nothing
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function (cache) {
//                   return cache.match('/offline.html')
//                 })
//             })
//         }
//       })
//   );
// });