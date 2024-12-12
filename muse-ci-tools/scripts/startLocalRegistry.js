import debug from 'debug';
import { startNpmRegistry, stopNpmRegistry } from '../src/setup/localNpmRegistry.js';
debug.enable('muse:*');

await startNpmRegistry();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
await delay(1000);
await stopNpmRegistry();
