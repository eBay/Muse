// Patch react-scripts and craco to support development build
const fs = require('fs');
const resolveCwd = require('resolve-cwd');

const markPatched = `// _muse_scripts_react_patched_\r\n`;
let p, content;
// Patch react-scripts/scripts/start.js

p = resolveCwd('react-scripts/scripts/start.js');
content = fs.readFileSync(p).toString('utf-8');

if (!content.startsWith(markPatched)) {
  content = content.replace(
    'if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {',
    'if (false) {',
  );

  content = `${markPatched}${content}`;
  fs.writeFileSync(p, content);
}

// Patch react-scripts/scripts/build.js

p = resolveCwd('react-scripts/scripts/build.js');
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
    .replace('if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {', 'if (false) {')
    .replace(
      "configFactory('production')",
      `configFactory(process.env.MUSE_DEV_BUILD ? 'development' : 'production')`,
    )
    .replace(
      'Creating an optimized production build...',
      `Creating ' + (process.env.MUSE_DEV_BUILD ? 'a development' : 'an optimized production') + ' build...`,
    );

  content = `${markPatched}${content}`;
  fs.writeFileSync(p, content);
}

// Patch @craco/craco/scripts/build.js
p = resolveCwd('@craco/craco/dist/scripts/build.js');
content = fs.readFileSync(p).toString('utf-8');

if (!content.startsWith(markPatched)) {
  content = content.replace(
    `process.env.NODE_ENV = process.env.NODE_ENV || 'production';`,
    `process.env.NODE_ENV = process.env.NODE_ENV || 'production';
if (process.env.MUSE_DEV_BUILD) { process.env.NODE_ENV = 'development'; } // remove this line after official muse v2 launch
if (process.env.NODE_ENV === 'development') { process.env.MUSE_DEV_BUILD = true; }`,
  );

  content = `${markPatched}${content}`;
  fs.writeFileSync(p, content);
}
