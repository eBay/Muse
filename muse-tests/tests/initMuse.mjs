export default async function initMuse() {
  await $`muse init --registry=https://npm.corp.ebay.com`;
}
