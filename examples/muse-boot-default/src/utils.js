// import { fatalError } from './loading';

const noop = () => {};
export const queries = document.location.search
  .replace(/^\?/, '')
  .split('&')
  .reduce((p, c) => {
    const arr = c.split('=');
    p[arr[0]] = decodeURIComponent(arr[1]);
    return p;
  }, {});

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

export function injectCss(css) {
  const head = document.getElementsByTagName('head')[0];
  const style = document.createElement('style');
  head.appendChild(style);
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
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
        reject();
      };
    });
  } else if (resource.endsWith('.css')) {
    const head = document.getElementsByTagName('head')[0];
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = resource;
    head.appendChild(link);
  }
}

export function loadInParallel(items, callback) {
  return new Promise((resolve) => {
    callback = callback || noop;
    let count = items.length;
    if (count === 0) {
      resolve();
      callback([]);
    }
    const arr = [];
    items.forEach((url, idx) => {
      load(url, (data) => {
        count--;
        arr[idx] = data;
        if (count === 0) {
          callback(arr);
          resolve(arr);
        }
      });
    });
  });
}

export function loadSerialized(items, callback) {
  callback = callback || noop;
  function loadAndNext() {
    if (!items.length) {
      callback();
      return;
    }
    const url = items.shift();
    if (url.push && url.pop && url.shift) {
      // is array
      loadInParallel(url, loadAndNext);
    } else {
      load(url, loadAndNext);
    }
  }
  loadAndNext();
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
