const LruMemoryCache = require('lru-cache');
const _ = require('lodash');

(async () => {
  const memoryCache = new LruMemoryCache({
    maxSize: 100,
    sizeCalculation: (value, key) => {
      return (value ? value.length : 1) + key.length;
    },
    ttl: 1000 * 300,
    updateAgeOnGet: true,
  });

  memoryCache.set('a', _.repeat('20', 10));
  memoryCache.set('b', _.repeat('30', 15));
  memoryCache.set('c', _.repeat('40', 20));
  memoryCache.set('d', _.repeat('50', 25));

  console.log('a', memoryCache.has('a'));
  console.log('b', memoryCache.has('b'));
  console.log('c', memoryCache.has('c'));
  console.log('d', memoryCache.has('d'));

  memoryCache.set('a', _.repeat('20', 10));
  memoryCache.set('b', _.repeat('30', 15));
  memoryCache.set('c', _.repeat('40', 20));
  memoryCache.set('d', _.repeat('50', 25));

  console.log('a', memoryCache.get('a'));
  console.log('b', memoryCache.get('b'));
  console.log('c', memoryCache.get('c'));
  console.log('d', memoryCache.get('d'));
})();
