import error from './error';
const noop = () => {};

export function load(plugin, callback) {
  callback = callback || noop;
  if (plugin.then && plugin.catch) {
    plugin.then(callback);
    return;
  }

  if (plugin.url) {
    return new Promise((resolve, reject) => {
      const head = document.querySelector('head');
      const script = document.createElement('script');
      script.setAttribute('crossorigin', 'anonymous');
      // script.crossOrigin = 'anonymous';
      script.src = plugin.url;
      if (1 || plugin.esModule) script.type = 'module';
      head.appendChild(script);
      script.onload = () => {
        callback();
        resolve();
      };
      // from unit tests, we resolve this Promise immediately. This is needed, as jest will never run the script.onload() function,
      // as it's not a real browser, making the Promise never resolve.
      if (process.env.NODE_ENV === 'test') {
        resolve();
      }
      script.onerror = () => {
        error.showMessage(`Failed to load resource: ${plugin.url} .`);
        reject();
      };
    });
  }
}

export async function loadInParallel(items, callback = noop) {
  let count = 0;
  await Promise.all(
    items.map(async (item) => {
      await load(item);
      callback(++count);
    }),
  );
}

export async function loadInSerial(items, callback = noop) {
  let count = 0;
  for (const item of items) {
    await load(item);
    // await new Promise((resolve) => setTimeout(resolve, 1000)); // This is to ensure the UI gets a chance to update between plugin loads.
    callback(++count);
  }
}

export function joinPath(p1, p2) {
  if (!p1.endsWith('/')) p1 += '/';
  if (p2.startsWith('/')) p2 = p2.replace(/^\/+/, '');
  return p1 + p2;
}

export function getPluginId(name) {
  if (name.startsWith('@')) return name.replace('/', '.');
  return name;
}
