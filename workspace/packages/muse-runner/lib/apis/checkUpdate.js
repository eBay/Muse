import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import * as url from 'url';
import pkgJson from 'package-json';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// TODO: expose it as rest api in server.js
export default async function checkUpdate() {
  const selfPkg = fs.readJsonSync(path.join(__dirname, '../package.json'));

  const args = {};
  if (process.env.RUNNER_NPM_REGISTRY) {
    args.registryUrl = process.env.RUNNER_NPM_REGISTRY;
  }
  const publishedPkg = await pkgJson(selfPkg.name, args);

  if (semver.lt(selfPkg.version, publishedPkg.version)) {
    return {
      newVersion: publishedPkg.version,
    };
  }
  return {};
}
