const fs = require('fs');
fs.writeFileSync(
  './build/dist/lib.json',
  JSON.stringify(Object.keys(require('./build/dist/lib-manifest.json').content), null, 2),
);

fs.writeFileSync(
  './build/dist/lib.json',
  JSON.stringify(Object.keys(require('./build/dist/lib-manifest.json').content), null, 2),
);
