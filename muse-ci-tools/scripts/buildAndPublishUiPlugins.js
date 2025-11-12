import debug from 'debug';
import { $ } from 'zx';
import buildAndPublishUiPlugins from '../src/setup/buildAndPublishUiPlugins.js';

console.log('using debug mode');
debug.enable('muse:*');

$.verbose = true;

await buildAndPublishUiPlugins();
