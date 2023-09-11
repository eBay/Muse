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
      `process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.BABEL_ENV = process.env.NODE_ENV;
process.env.MUSE_DEV_BUILD = true;`,
    )
    .replace('if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {', 'if (false) {')
    .replace(
      "configFactory('production')",
      `configFactory(process.env.NODE_ENV === 'development' ? 'development' : 'production')`,
    )
    .replace(
      'Creating an optimized production build...',
      `Creating ' + (process.env.NODE_ENV === 'development' ? 'a development' : 'an optimized production') + ' build...`,
    );

  content = `${markPatched}${content}`;
  fs.writeFileSync(p, content);
}
