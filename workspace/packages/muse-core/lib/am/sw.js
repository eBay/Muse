/* eslint-disable */
const cacheName = 'muse_assets';
const assetsHost = 'static.muse.ebay.com'; // /muse-assets, static.muse.ebay.com
self.addEventListener('install', function(e) {
  console.log('Muse service worker installed.');
  const cacheOpenPromise = caches.open(cacheName);
  e.waitUntil(cacheOpenPromise);
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  console.log('Muse service Worker activated.');
});

self.addEventListener('fetch', function(e) {
  const reqInfo = parseUrl(e.request.url);
  // only cache cdn resource without query string
  if (!reqInfo.isAsset || e.request.url.includes('?')) return false;
  e.respondWith(cacheFirst(e.request, reqInfo));
});

function cacheFirst(request, reqInfo) {
  // only cache cdn resource without query string
  return caches
    .open(cacheName)
    .then((cache) => {
      return cache.match(request).then((res) => {
        return new Promise((resolve, reject) => {
          if (res) {
            cleanCache(cache, reqInfo);
            resolve(res);
          } else {
            const corsRequest = new Request(request.url, { mode: 'cors' });
            fetch(corsRequest)
              .then((realRes) => {
                if (realRes.status === 200) {
                  console.log('Updating cache: ', request.url);
                  cache
                    .put(request, realRes.clone())
                    .then(() => {
                      resolve(realRes);
                    })
                    .catch((err) => {
                      console.log('Failed to update cache: ', request.url);
                      console.log(err);
                      resolve(realRes);
                    });
                } else {
                  reject(realRes);
                }
              })
              .catch((err) => {
                console.log('Failed to fetch', err);
                resolve(fetch(request));
              });
          }
        });
      });
    })
    .catch((err) => {
      console.log(err);
      console.log('Failed to using cache, fallback to network: ', request.url);
      return Promise.resolve(fetch(request));
    });
}

const urlCache = {};
function parseUrl(url) {
  if (urlCache[url]) return urlCache[url];

  // https://static.muse.ebay.com/p/@ebay.muse-lib-react/v1.0.3/dist/main.js
  const m = url.match(/\/p\/([\w@\.\-_]+)\/v(\d+\.\d+\.\d+[\w@\.\-_]*)\/[\w@\.\-_]+\/.*/);
  let result = null;
  if (m) {
    result = {
      isAsset: true,
      filepath: m[0],
      plugin: m[1],
      version: m[2],
    };
  } else {
    result = {
      isAsset: false,
    };
  }
  urlCache[url] = result;
  return result;
}

function cleanCache(cache, reqInfo) {
  // Clean old cache if a different version is deployed
  cache.keys().then((list) => {
    list.forEach((req) => {
      const info = parseUrl(req.url);
      if (info && info.plugin === reqInfo.plugin && info.version !== reqInfo.version) {
        cache
          .delete(req)
          .then((response) => {
            if (response) {
              console.log('Cache cleaned: ' + req.url);
            } else {
              console.log('Failed to delete cache: ' + req.url);
            }
          })
          .catch((err) => {
            console.log('Failed to delete cache: ' + req.url);
          });
      }
    });
  });
}
