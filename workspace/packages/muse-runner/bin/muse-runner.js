#!/usr/bin/env node
import * as url from 'url';
import path from 'path';
import fs from 'fs-extra';

// Enforce the cwd is the root of the project
// So that it won't use unexpected muse config file.
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
process.chdir(path.join(__dirname, '../'));

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  const pkgJson = fs.readJsonSync('./package.json');
  console.log(pkgJson.version);
  process.exit(0);
}

import('../lib/server.js');
