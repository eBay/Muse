// Patch react-scripts and craco to support development build
const fs = require('fs');

// Patch muse-scripts/scripts/build.js
const markPatched = `// muse_scripts_react_patched\r\n`;
let p, content;

p = require.resolve('react-scripts/scripts/build.js');
content = fs.readFileSync(p).toString('utf-8');

if (!content.startsWith(markPatched)) {
  content = content
    .replace("process.env.BABEL_ENV = 'production';", '')
    .replace(
      "process.env.NODE_ENV = 'production';",
      `
if (process.env.MUSE_DEV_BUILD) {
  process.env.BABEL_ENV = 'development';
  process.env.NODE_ENV = 'development';
} else {
  process.env.BABEL_ENV = 'production';
  process.env.NODE_ENV = 'production';
}
    `,
    )
    .replace("configFactory('production')", `configFactory(process.env.MUSE_DEV_BUILD ? 'development' : 'production')`)
    .replace(
      'Creating an optimized production build...',
      `Creating an ' + (process.env.MUSE_DEV_BUILD ? 'development' : 'optimized production') + ' build...`,
    );

  content = `${markPatched}${content}`;
  fs.writeFileSync(p, content);
}

// Patch @craco/craco/scripts/build.js
p = require.resolve('@craco/craco/scripts/build.js');
content = fs.readFileSync(p).toString('utf-8');

if (!content.startsWith(markPatched)) {
  content = content
    .replace(
      'process.env.NODE_ENV = "production"',
      `process.env.NODE_ENV = process.env.MUSE_DEV_BUILD ? "development" : "production"`,
    )
    .replace(
      `process.env.NODE_ENV = 'production'`,
      `process.env.NODE_ENV = process.env.MUSE_DEV_BUILD ? "development" : "production"`,
    )
    .replace(`{ overrideWebpackProd }`, `{ overrideWebpackProd, overrideWebpackDev }`)
    .replace(`overrideWebpackProd(`, `(process.env.MUSE_DEV_BUILD ? overrideWebpackDev : overrideWebpackProd)(`);

  content = `${markPatched}${content}`;
  fs.writeFileSync(p, content);
}
