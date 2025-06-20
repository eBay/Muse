import fs from 'fs-extra';
import path from 'path';
import jsPlugin from 'js-plugin';
import _ from 'lodash';
import { $ } from 'zx';
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

export async function asyncInvoke(extPoint, ...args) {
  extPoint = extPoint.replace(/^!.|!.$/g, '');
  const plugins = jsPlugin.getPlugins(extPoint);
  const res = [];
  for (const p of plugins) {
    const value = await _.invoke(p, extPoint, ...args);
    res.push(value);
  }
  return res;
}

export const asyncInvokeInParrellel = async (extPoint, ...args) => {
  extPoint = extPoint.replace(/^!.|!.$/g, '');
  const plugins = jsPlugin.getPlugins(extPoint);
  const res = await Promise.all(plugins.map((p) => _.invoke(p, extPoint, ...args)));
  return res;
};
