import { $ } from 'zx';
$.verbose = true;
await $`node -v`;
// await $`node`;
// await $`export http_proxy=http://den-entbc-001:80`;
// await $`export https_proxy=http://den-entbc-001:80`;

await $`mkdir /testprj`;
await $`cd /testprj`;
await $`cd /testprj && pnpm init`;
await $`cd /testprj && pnpm add node-pty --registry=https://npm.corp.ebay.com`;
