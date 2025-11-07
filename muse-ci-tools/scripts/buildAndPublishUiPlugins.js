import debug from 'debug';
import buildAndPublishUiPlugins from '../src/setup/buildAndPublishUiPlugins.js';

console.log('using debug mode');
debug.enable('muse:*');

await buildAndPublishUiPlugins();
