import { pathToRegexp } from 'path-to-regexp';

export default {
  // Map a parent path to the sub app's url
  getChildUrl(subApp) {
    // Example: https://developer.mozilla.org:8080/en-US/search?q=URL#search-results-close-container
    // => /en-US/search?q=URL#search-results-close-container
    const fullPath = document.location.href.replace(document.location.origin, '');
    const re = pathToRegexp(subApp.path, [], { end: false });
    if (re.test(fullPath)) {
      let u = fullPath.replace(re, '');
      if (!u.startsWith('/')) u = '/' + u;
      // https://abc.com/ab/def
      const arr = subApp.url.split('/');
      arr.splice(0, 3);
      let s = arr.join('/').replace(/\/*$/, '') + u;
      if (!s.startsWith('/')) s = '/' + s;
      return s;
    }
    return null;
  },

  // Get the parent full path by the sub app's full path.
  // Only supports one sub app a time
  getParentPath(childFullPath, subApp) {
    // mountedSubPath is the path defined in subApp.url, for example:
    //   - https://subapp.musejs.org/foo/bar => /foo/bar
    //   - https://subapp.musejs.org => '/'
    const mountedSubPath = '/' + subApp.url.split('/').slice(3).join('/');
    // If the sub app go out of the registered mounted path, do nothing. This is usually due to a un-well design.
    // /foo - '/' => valid
    // /foo - /foo => valid
    // /foo?query - /foo => valid
    // /foo#hash - /foo => valid
    // /foo/bar - /foo => valid
    // /xxx - /foo => invalid
    // /foo/bar - /foo => valid
    // /bar - /foo => invalid
    const isPathValid =
      mountedSubPath === '/' ||
      (childFullPath.startsWith(mountedSubPath) &&
        ['', '?', '/', '#'].includes(childFullPath.chartAt(mountedSubPath.length)));
    if (!isPathValid) return;
    const re = pathToRegexp(subApp.path, [], { end: false });
    const pathname = document.location.pathname;
    if (!re.test(pathname)) return;
    const m = pathname.match(re);
    const newParentFullPath = (
      m[0] +
      '/' +
      // childFullPath = '/', mountedSubPath='/' => ''
      // childFullPath = '/abc', mountedSubPath='/' => 'abc'
      // childFullPath = '/abc', mountedSubPath='/abc' => ''
      // childFullPath = '/abc/def', mountedSubPath='/abc' => '/def'
      childFullPath.replace(mountedSubPath, '')
    )
      .replace('//', '/')
      .replace(/\/$/, '');
    return newParentFullPath;
  },
  getOrigin(url) {
    const arr = url.split('/');
    arr.length = 3;
    return arr.join('/');
  },
};
