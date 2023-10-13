#!/usr/bin/env zx

import initMuse from './initMuse.mjs';
import createApp from './createApp.mjs';

await initMuse();

// await $`muse manager`;

// Create a simple app1 with basic plugins
await $`muse create-app app1`;
await $`muse deploy-plugin app1 staging @ebay/muse-boot-default @ebay/muse-lib-react`;

await $`muse serve app1`;

console.log('hello');

// TODO: test the app1 renders with welcome page

// await $`muse deploy-plugin app1 staging @ebay/muse-lib-antd @ebay/muse-layout-antd`;

// TODO: test antd layout renders correctly.

// await $`muse deploy-plugin app1 staging @ebay/muse-dashboard`;
