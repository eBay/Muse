const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const semver = require('semver');
const _ = require('lodash');
const plugin = require('js-plugin');
const jsYaml = require('js-yaml');
const archiver = require('archiver');
const Ajv = require('ajv');

const ajv = new Ajv({ strictTypes: false });
const logger = require('./logger').createLogger('muse.utils');

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
  if (name?.startsWith('@')) return name?.replace('/', '.');
  return name;
}

function getPluginName(pluginId) {
  if (pluginId?.startsWith('@')) return pluginId?.replace('.', '/');
  return pluginId;
}
function jsonByYamlBuff(b) {
  if (!b) return null;
  return jsYaml.load(Buffer.from(b).toString('utf8'));
}

async function batchAsync(tasks, { size = 100, msg = 'Batch async' } = {}) {
  const chunks = _.chunk(tasks, size);
  const res = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    logger.verbose(
      `${msg}: ${i * size + 1}~${Math.min(i * size + size, tasks.length)} of ${tasks.length}`,
    );
    const arr = await Promise.all(chunk.map((c) => c()));
    res.push(...arr);
  }
  return res;
}

function makeRetryAble(executor, { times = 3, checker = () => {}, msg = '' } = {}) {
  // if checker returns something, it will break retry logic and return the result of checker
  return async (...args) => {
    let finalErr = null;
    for (let i = 0; i < times; i++) {
      if (i > 0) logger.warn(`Retrying at time ${i}/${times - 1} for ${msg}`);
      try {
        return await executor(...args);
      } catch (err) {
        const c = checker && checker(err);
        if (c !== undefined) return c;
        if (err.message) logger.warn(err.message);
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
      const res = path.resolve(dir, dirent.name).replace(/\\/g, '/');
      return dirent.isDirectory() ? getFilesRecursively(res) : res;
    }),
  );
  return _.flatten(files);
};

const updateJson = (obj, changes) => {
  // set: [{ path, value }, ...]
  // unset: [path1, path2, ...]
  // push: [{ path, value }] // for array
  // remove: [{ path, predicate, value }, ...]
  const { set = [], unset = [], remove = [], push = [] } = changes;

  _.castArray(set).forEach((item) => {
    _.set(obj, item.path, item.value);
  });

  _.castArray(unset).forEach((p) => {
    _.unset(obj, p);
  });

  _.castArray(push).forEach((item) => {
    if (!_.get(obj, item.path)) _.set(obj, item.path, []);
    _.get(obj, item.path).push(item.value);
  });

  _.castArray(remove).forEach((item) => {
    const arr = _.get(obj, item.path);
    if (!arr) return;
    if (item.value) _.pull(arr, item.value);
    if (item.predicate) _.remove(arr, item.predicate);
  });
  return obj;
};

const genNewVersion = (oldVersion, verionType = 'patch') => {
  if (semver.valid(verionType)) return verionType;
  if (!oldVersion) return '1.0.0';
  if (!semver.valid(oldVersion)) throw new Error(`Invalid existing version: ${oldVersion}.`);
  const args = verionType.split('-');
  const newVersion = semver.inc(oldVersion, ...args);
  if (!newVersion) throw new Error(`Invalid version: ${verionType}.`);
  return newVersion;
};

const getMuseGlobal = (app, envName) => {
  const plugins = app.envs?.[envName]?.plugins;

  const bootPlugin = plugins.find((p) => p.type === 'boot');

  return {
    appName: app.name,
    envName: envName,
    plugins,
    bootPlugin: bootPlugin?.name,
  };
};

const doZip = (sourceDir, zipFile) => {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(zipFile);
    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.directory(sourceDir, false);
    archive.pipe(output);
    archive.on('error', (err) => reject(err));
    output.on('close', () => {
      resolve();
    });
    archive.finalize();
  });
};

const parseRegistryKey = (key) => {
  const arr = key.split('/').filter(Boolean);

  if (arr[0] === 'apps' && arr[2] === `${arr[1]}.yaml`) {
    // validate app yaml with keypath pattern: /apps/myapp/myapp.yaml
    return {
      type: 'app',
      appName: arr[1],
    };
  } else if (arr[0] === 'plugins' && arr[1].endsWith('.yaml')) {
    // validate plugin.yaml with keypath pattern: /plugins/myplugin.yaml
    return {
      type: 'plugin',
      pluginName: getPluginName(arr[1].replace('.yaml', '')),
    };
  } else if (arr[0] === 'apps' && arr[3].endsWith('.yaml')) {
    // validate deployed plugin.yaml with keypath pattern: /apps/myapp/staging/myplugin.yaml
    return {
      type: 'deployed-plugin',
      pluginName: getPluginName(arr[3].replace('.yaml', '')),
      appName: arr[1],
      envName: arr[2],
    };
  } else if (arr[0] === 'plugins' && arr[1] === 'releases' && arr[2].endsWith('.yaml')) {
    // validate releases.yaml with keypath pattern: /plugins/releases/myplugin.yaml
    return {
      type: 'releases',
      pluginName: getPluginName(arr[2].replace('.yaml', '')),
    };
  } else if (arr[0] === 'requests' && arr[1].endsWith('.yaml')) {
    // validate request yaml with keypath pattern: /requests/req-id.yaml
    return {
      type: 'request',
      id: arr[1].replace('.yaml', ''),
    };
  }
  return null;
};

const ajvCache = new WeakMap();
const validate = (schema, data) => {
  let validateRes;
  if (!ajvCache.has(schema)) {
    validateRes = ajv.compile(schema);
    ajvCache.set(schema, validateRes);
  } else {
    validateRes = ajvCache.get(schema);
  }
  if (!validateRes(data)) {
    throw new Error(JSON.stringify(validateRes.errors));
  }
};

module.exports = {
  getPluginId,
  getPluginName,
  syncInvoke: (...args) => plugin.invoke(...args),
  asyncInvoke,
  asyncInvokeFirst,
  wrappedAsyncInvoke,
  jsonByYamlBuff,
  batchAsync,
  makeRetryAble,
  getFilesRecursively,
  getExtPoint,
  genNewVersion,
  updateJson,
  getMuseGlobal,
  doZip,
  parseRegistryKey,
  validate,
  osUsername: (() => {
    try {
      return os.userInfo().username;
    } catch (error) {
      return 'unknown';
    }
  })(),
  defaultAssetStorageLocation: path.join(os.homedir(), 'muse-storage/assets'),
  defaultRegistryStorageLocation: path.join(os.homedir(), 'muse-storage/registry'),
};
