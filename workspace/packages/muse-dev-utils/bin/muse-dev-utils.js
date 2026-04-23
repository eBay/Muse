#!/usr/bin/env node

process.on('unhandledRejection', (err) => {
  throw err;
});

const args = process.argv.slice(2);

switch (args[0]) {
  case 'sync-muse-types':
    require('../scripts/syncExtPointsTypes.js')();
    break;

  case 'check-updates':
    require('../scripts/checkUpdates.js')();
    break;

  default:
    throw new Error(`Unknown argument: ${args[0]}`);
}
