# Shared Module Registration — Problem & Solution

## Background

MUSE lib plugins (e.g. `muse-lib-react`) bundle shared dependencies (e.g. React) and expose them at runtime via `MUSE_GLOBAL.__shared__.register()`. Normal plugins then consume them via `MUSE_GLOBAL.__shared__.require()` instead of bundling their own copy, avoiding duplicate dependencies across micro-frontends.

During a production build (`vite build`), the lib plugin must:
1. Bundle all its source modules
2. Call `MUSE_GLOBAL.__shared__.register(allModules)` at startup, passing namespace objects for every module so consumers can access them at runtime

---

## Key Problem: Registration Requires Static Imports

To pass module namespace objects to `register()`, the code must use static ESM imports:

```js
import * as m0 from '/abs/path/to/moduleA.js';
import * as m1 from '/abs/path/to/moduleB.js';

MUSE_GLOBAL.__shared__.register({
  'pkg@1.0.0/moduleA.js': m0,
  'pkg@1.0.0/moduleB.js': m1,
});
```

Static `import * as m` is the only way to obtain a module namespace object that Rolldown will bundle. Alternatives like `generateBundle` or `renderChunk` run after the module graph is closed and cannot introduce new bundled imports.

---

## Architecture: Virtual Entry + Virtual Register Module

To avoid a circular self-import (the entry importing itself to register its own modules), the build input is redirected to a virtual entry:

```
Build input: \0muse-virtual-entry
    │
    ├─ import actualEntry          (the real src/index.ts)
    └─ import \0muse-shared-register
```

The virtual entry's `load` hook returns:

```js
import "/abs/path/to/src/index.ts";
import "\0muse-shared-register";
```

The `\0muse-shared-register` virtual module's `load` hook generates all the static imports and the register call dynamically, based on a `sharedModules` map that is populated during `transform`.

---

## The Race Condition

Rolldown resolves the two imports in `\0muse-virtual-entry` **concurrently**. This means:

- `\0muse-shared-register`'s `load` hook fires at roughly the same time as the first `transform` calls for `actualEntry`'s dependency graph
- `sharedModules` is populated incrementally as each module passes through `transform`
- When `\0muse-shared-register`'s `load` hook reads `sharedModules`, it is not yet complete

The static imports emitted by `\0muse-shared-register`'s `load` hook must be correct and complete at the time they are returned, because Rolldown uses them to build the module graph — they cannot be added or changed later.

### Timeline of the race

```
\0muse-virtual-entry load()
  ├─ resolves actualEntry → transform(moduleA) → sharedModules[A] = ...
  ├─ resolves moduleB     → transform(moduleB) → sharedModules[B] = ...   ← still running
  └─ resolves \0muse-shared-register → load() fires HERE
                                        sharedModules may be incomplete
```

---

## Failed / Interim Approaches

### 1. `setTimeout` (10 seconds)

```js
await new Promise((r) => setTimeout(r, 10000));
```

Pauses the `load` hook for 10 seconds, hoping all transforms complete in that time. This works in practice but is:
- Fragile: a large project or slow machine could exceed 10 seconds
- Slow: always waits the full 10 seconds regardless of actual build speed

### 2. Debounced Promise (50ms idle)

```js
// In transform:
clearTimeout(debounceTimer);
debounceTimer = setTimeout(resolveReady, 50);

// In load for \0muse-shared-register:
await readyPromise;
```

Resolves 50ms after the last `transform` call, assuming silence means the graph is done. More adaptive than a fixed wait, but still a timing assumption — technically a race condition under load.

### 3. `buildStart` + `this.load()`

```js
async buildStart() {
  await this.load({ id: path.resolve(process.cwd(), entryFile) });
  resolveSharedModules();
}
```

Intended to eagerly process the entire entry module graph before the build proper starts. Does not work because `this.load()` loads a single module; transitive imports are scheduled asynchronously, not awaited inline. By the time `buildStart` resolves, sub-module transforms have not all completed.

---

## Final Solution: `moduleParsed` Hook + Graph Traversal

### Core idea

The `moduleParsed` hook fires once per module, after its `load` and `transform` hooks have both completed. At that point, `this.getModuleInfo(id)` returns the module's resolved `importedIds`.

By tracking which modules have been parsed and walking the graph from `actualEntry` after each `moduleParsed` call, it is possible to detect precisely when the entire dependency graph is fully processed — with no timers.

### Deferred Promise

A promise is created whose resolve function is stored externally so it can be triggered from a different hook:

```js
let makeSharedModulesReady;
const sharedModulesReady = new Promise((r) => {
  makeSharedModulesReady = r;
});
```

- `\0muse-shared-register`'s `load` hook awaits `sharedModulesReady`
- `moduleParsed` calls `makeSharedModulesReady()` once the graph is confirmed complete

### `moduleParsed` implementation

```js
const parsedModules = new Set();

moduleParsed(info) {
  parsedModules.add(info.id);

  // BFS from actualEntry through importedIds
  const queue = [path.resolve(process.cwd(), entryFile)];
  const visited = new Set();
  let complete = true;

  while (queue.length) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);

    if (!parsedModules.has(id)) { complete = false; break; }

    const moduleInfo = this.getModuleInfo(id);
    if (!moduleInfo) { complete = false; break; }

    for (const imp of moduleInfo.importedIds) queue.push(imp);
  }

  if (complete && visited.size > 0) makeSharedModulesReady();
},
```

After every module parse, this walks the full reachable graph from `actualEntry`. If every node in that graph is present in `parsedModules`, the graph is complete and the deferred promise is resolved.

### `load` hook for `\0muse-shared-register`

```js
if (id === MUSE_SHARED_REGISTER) {
  await sharedModulesReady;  // suspends until moduleParsed signals completion

  const entries = Object.entries(sharedModules);
  const lines = ['const _all = {};'];
  entries.forEach(([, filePath], i) => {
    lines.push(`import * as m${i} from ${JSON.stringify(filePath)};`);
    lines.push(`_all['${getMuseIdByPath(filePath)}'] = m${i};`);
  });
  lines.push(`MUSE_GLOBAL.__shared__.register(_all, (id) => _all[id]);`);
  return lines.join('\n');
}
```

By the time `await sharedModulesReady` resolves, every module reachable from `actualEntry` has passed through `transform`, so `sharedModules` is fully populated.

---

## Why This Works

| Property | Explanation |
|---|---|
| `moduleParsed` fires after `transform` | `sharedModules` is populated in `transform`, so each entry in `parsedModules` guarantees the corresponding `sharedModules` entry exists |
| BFS only traverses `importedIds` | `\0muse-shared-register` and `\0muse-virtual-entry` are not reachable from `actualEntry`, so they don't appear in the traversal and don't cause false-positive completion |
| Promise resolves exactly once | `makeSharedModulesReady()` is idempotent after the first call; subsequent `moduleParsed` calls after the graph is complete are harmless |
| No timers | Correctness depends on graph state, not wall-clock time |

---

## Data Flow Summary

```
Build input: \0muse-virtual-entry
│
├── import actualEntry
│     └── [Rolldown traverses module graph]
│           transform(moduleA) → sharedModules['pkg@1.0.0/a.js'] = '/abs/a.js'
│           transform(moduleB) → sharedModules['pkg@1.0.0/b.js'] = '/abs/b.js'
│           ...
│           moduleParsed(moduleA) → BFS check → not complete yet
│           moduleParsed(moduleB) → BFS check → not complete yet
│           moduleParsed(lastLeaf) → BFS check → ALL nodes in parsedModules → makeSharedModulesReady()
│
└── import \0muse-shared-register
      load() → await sharedModulesReady  ← unblocked by moduleParsed
      returns:
        import * as m0 from '/abs/a.js';
        import * as m1 from '/abs/b.js';
        const _all = { 'pkg@1.0.0/a.js': m0, 'pkg@1.0.0/b.js': m1 };
        MUSE_GLOBAL.__shared__.register(_all, id => _all[id]);
```

---

## Caveats

- **Dynamic imports**: `moduleInfo.importedIds` only covers static imports. If the lib plugin uses dynamic `import()`, those modules appear in `dynamicallyImportedIds` and would need to be included in the BFS to ensure completeness.
- **Performance**: The BFS runs on every `moduleParsed` call, making it O(n²) in the number of modules. For typical lib plugin sizes this is negligible. Could be optimized by tracking a pending-import counter instead.
- **Rolldown compatibility**: `moduleParsed` is a standard Rollup plugin hook. Rolldown implements it, but behavior should be verified on Rolldown version upgrades.
