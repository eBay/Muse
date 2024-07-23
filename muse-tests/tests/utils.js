import fs from 'fs-extra';
import * as config from './config.js';

export const getPkgFolderName = (pkgName) => pkgName.replace('@', '').replace('/', '-');

export const getLocalPackages = async () => {
  const files = fs.readdirSync(config.PACKED_PACKAGES_FOLDER);
  const pkgs = files
    .filter((f) => f.endsWith('.tgz'))
    .map((f) => {
      const i = f.lastIndexOf('-');
      return {
        name: f.substring(0, i).replace(/^ebay-/, '@ebay/'),
        version: f.substring(i + 1, f.length - 4),
        fileName: f,
      };
    });
  console.log(pkgs);
  return pkgs;
};

// Modify pnpm overrides in package.json to use local package
export const overrideLocalPackage = async ({ projectFolder, packageName, localPath }) => {
  //
};
