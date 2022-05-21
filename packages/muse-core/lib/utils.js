const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const plugin = require('js-plugin');
const jsYaml = require('js-yaml');

async function asyncInvoke(extPoint, ...args) {
  const noThrows = extPoint.endsWith('!');
  extPoint = extPoint.replace(/^!.|!.$/g, '');
  const plugins = plugin.getPlugins(extPoint);
  const res = [];
  for (const p of plugins) {
    try {
      const value = await _.invoke(p, extPoint, ...args);
      res.push(value);
    } catch (err) {
      if (!noThrows) throw err;
      res.push(err);
    }
  }
  return res;
}

async function asyncInvokeFirst(extPoint, ...args) {
  const noThrows = extPoint.endsWith('!');
  extPoint = extPoint.replace(/^!.|!.$/g, '');
  const p = plugin.getPlugins(extPoint)[0];
  if (!p) return;
  try {
    return await _.invoke(p, extPoint, ...args);
  } catch (err) {
    if (!noThrows) throw err;
  }
  return undefined;
}

function getExtPoint(extPath, name) {
  return extPath ? extPath + '.' + name : name;
}

async function wrappedAsyncInvoke(extPath, methodName, ...args) {
  const cMethodName = _.capitalize(methodName);
  const ctx = {};
  await asyncInvoke(getExtPoint(extPath, 'before' + cMethodName), ctx, ...args);
  try {
    ctx.result = await asyncInvokeFirst(getExtPoint(extPath, methodName), ...args);
  } catch (err) {
    ctx.error = err;
    await asyncInvoke(getExtPoint(extPath, 'failed' + cMethodName), ctx, ...args);
    throw err;
  }

  await asyncInvoke(getExtPoint(extPath, 'after' + cMethodName), ctx, ...args);
  return ctx.result;
}

function getPluginId(name) {
  if (name.startsWith('@')) return name.replace('/', '.');
  return name;
}

function getPluginName(pluginId) {
  if (pluginId.startsWith('@')) return pluginId.replace('.', '/');
  return pluginId;
}
function jsonByYamlBuff(b) {
  if (!b) return null;
  return jsYaml.load(Buffer.from(b).toString('utf8'));
}

async function batchAsync(tasks, size = 100, msg = 'Batch async') {
  const chunks = _.chunk(tasks, size);
  const res = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`${msg}: ${i * size + 1}~${Math.min(i * size + size, tasks.length)} of ${tasks.length}`);
    const arr = await Promise.all(chunk.map((c) => c()));
    res.push(...arr);
  }
  return res;
}
function makeRetryAble(executor, times = 3, checker = () => {}) {
  // if checker returns something, it will break retry logic and return the result of checker
  return async (...args) => {
    let finalErr = null;
    for (let i = 0; i < times; i++) {
      try {
        return await executor(...args);
      } catch (err) {
        const c = checker && checker(err);
        if (c !== undefined) return c;
        finalErr = err;
      }
    }
    throw finalErr;
  };
}

const getFilesRecursively = async (dir) => {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? getFilesRecursively(res) : res;
    }),
  );
  return _.flatten(files);
};

const updateJson = (obj, delta) => {
  // set: [{ path, value }, ...]
  // unset: [path1, path2, ...]
  // push: [{ path, value }] // for array
  // remove: [{ path, predicate, value }, ...]
  const { set = [], unset = [], remove = [], push = [] } = delta;
  set.forEach((item) => {
    _.set(obj, item.path, item.value);
  });

  unset.forEach((p) => {
    _.unset(obj, p);
  });

  push.forEach((item) => {
    if (!_.get(obj, item.path)) _.set(obj, item.path, []);
    _.get(obj, item.path).push(item.value);
  });

  remove.forEach((item) => {
    const arr = _.get(obj, item.path);
    if (!arr) return;
    if (item.value) _.pull(arr, item.value);
    if (item.predicate) _.remove(arr, item.predicate);
  });
};

module.exports = {
  getPluginId,
  getPluginName,
  asyncInvoke,
  asyncInvokeFirst,
  wrappedAsyncInvoke,
  jsonByYamlBuff,
  batchAsync,
  makeRetryAble,
  getFilesRecursively,
  getExtPoint,
  updateJson,
  defaultAssetStorage: path.join(os.homedir(), 'muse-storage/assets'),
  defaultRegistryStorage: path.join(os.homedir(), 'muse-storage/registry'),
};
