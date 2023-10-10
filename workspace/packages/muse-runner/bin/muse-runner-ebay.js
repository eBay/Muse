#!/usr/bin/env node
import * as url from 'url';
import path from 'path';
import fs from 'fs-extra';
import checkUpdate from '../lib/checkUpdate.js';

// Enforce the cwd is the root of the project
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
process.chdir(path.join(__dirname, '../'));

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  const pkgJson = fs.readJsonSync('./package.json');
  console.log(pkgJson.version);
  process.exit(0);
}

if (!process.argv.includes('--no-update')) {
  await checkUpdate();
}

// This is necessary after update, no idea why.
process.chdir(path.join(__dirname, '../'));

import('../lib/server.js');
