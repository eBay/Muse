import error from './error';
const noop = () => {};

export function xhr(url, options = {}) {
  const request = new XMLHttpRequest();
  request.withCredentials = !!options.withCredentials;

  return new Promise((resolve, reject) => {
    request.onload = () => {
      if (request.status !== 200) {
        console.log('Reqeust failed', request);
        reject(request);
        return;
      }
      const text = request.responseText;
      resolve(options.text ? text : JSON.parse(text));
    };
    request.onerror = () => {
      reject(new Error(`Failed to get: ${url}`));
    };
    request.open('get', url, true);

    if (options.headers) {
      Object.entries(options.headers).forEach(([name, value]) => {
        request.setRequestHeader(name, value);
      });
    }

    request.send();
  });
}

export function load(resource, callback) {
  callback = callback || noop;
  if (resource.then && resource.catch) {
    resource.then(callback);
    return;
  }

  if (resource.endsWith('.js')) {
    return new Promise((resolve, reject) => {
      const head = document.querySelector('head');
      const script = document.createElement('script');
      head.appendChild(script);
      script.src = resource;
      script.onload = () => {
        callback();
        resolve();
      };
      script.onerror = () => {
        // fatalError('Failed to load resource: ' + resource);
        error.showMessage(`Failed to load resource: ${resource} .`);
        reject();
      };
    });
  }
}

export async function loadInParallel(items, callback = noop) {
  let count = 0;
  await Promise.all(
    items.map(async item => {
      await load(item);
      callback(++count);
    }),
  );
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
