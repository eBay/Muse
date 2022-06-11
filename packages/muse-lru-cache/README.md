# Muse LRU Cache

Two layers lru cache. When get data:
1. Try to get it from memory cache (lru-cache). If found, return the data.
2. Try to get it from disk cache, if found, write it to memory cache and return the data.
3. Try to get it from data provider (a callback function), if found, write it to disk and memory cache, return the data.

Whenever write data, check LRU policy (by size and last accessed) and delete unused content.

This should be only used when the data source is readonly.

## Usage
```js
const MuseLruCache = require('muse-lru-cache');

const cache = new MuseLruCache({
  maxMemorySize: 3 * 1000 * 1000, // default to 3 Gb
  maxMemoryAge:0,
  maxDiskAge: 0,
  diskLocation: '<homedir>/muse-storage/disk-cache', // default value
})
```

## Example Usage Scenario
For Muse local development, it may need to load remote plugins. To improve the network performance, Muse dev server acts as cache based proxy to fetch remote plugin assets. So once a plugin is loaded, it will not need to load again.