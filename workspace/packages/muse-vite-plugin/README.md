## Dev Guide

1. pnpm link
```
pnpm link -g
```

2. Go to a plugin root folder, and link the plugin
```
pnpm link @ebay/muse-vite-plugin
```

3. Add below script to plugin project's package.json
```
"vite": "NODE_PATH=./node_modules vite --host"
```

4. Start dev server
```
pnpm vite
```