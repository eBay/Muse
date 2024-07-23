#!/usr/bin/env zx
import debug from 'debug';
import * as config from './config.js';
import fs from 'fs-extra';
import setupEnv from './setup-env/setupEnv.js';

if (!process.env.DEBUG) {
  // we use debug as logger
  debug.enable('*');
}

await fs.emptyDir(config.TEMP_FOLDER);

await setupEnv();
