import { pathToRegexp, match } from 'path-to-regexp';
import _ from 'lodash';

export default {
  // Map a parent path to the sub app's url based on sub app declaration
  getChildUrlPath(subApp) {
    const parentPath = document.location.href.replace(document.location.origin, '');

    // The subApp.path means under which path pattern it loads the sub app.
    // It needs to extract params from subApp.path and used to construct the final sub app url.
    const res = match(subApp.path, { decode: decodeURIComponent, end: false })(parentPath);
    console.log(subApp.path, parentPath, res);
    if (res) {
      // Join childUrl with parent path
      // Example:
      //   subApp.url: https://cloud.ebay.com/full-ecdx-page/<%=appName%>
      //   subApp.path: /app/:appName/ecdx
      //   parentPath: /app/musemanager/ecdx/sub-tab?query=1
      //   => childBaseUrl: https://cloud.ebay.com/full-ecdx-page/musemanager
      //   => childUrlPath: /full-ecdx-page/musemanager/sub-tab?query=1

      // Get the sub app base url
      const childBaseUrl = _.template(subApp.url)(res.params);

      // const urlInstance = new URL(childBaseUrl);

      let u = parentPath.replace(pathToRegexp(subApp.path, [], { end: false }), '');
      // if (!u.startsWith('/')) u = '/' + u;
      const arr = childBaseUrl.split('/');
      arr.splice(0, 3);
      let s = arr.join('/').replace(/\/*$/, '') + u;
      if (!s.startsWith('/')) s = '/' + s;
      console.log('childUrlPath: ', s);
      return s;
    }
    return null;
  },

  /*
    Get the parent full path by the sub app's full path. Only supports one sub app a time.
    Example:
      parentUrl: https://admin.musejs.com/app/musemanager/ecdx/sub-tab?query=1
      subApp.path: /app/:appName/ecdx
      subApp.url: https://local.musejs.com:3030/full-ecdx-page/:appName
      childFullPath: /fullpage-ecdx-page/musemanager/sub-tab?query=1
      parentPath: /app/musemanager/ecdx/sub-tab?query=1
  */
  getParentPath(childFullPath, subApp) {
    const parentPath = document.location.href.replace(document.location.origin, '');
    const res = match(subApp.path, { decode: decodeURIComponent, end: false })(parentPath);

    // The parent path must match subApp.path
    if (!res) return null;
    const childBaseUrl = _.template(subApp.url)(res.params);

    // mountedSubPath is the path defined in subApp.url, for example:
    //   - https://subapp.musejs.org/foo/bar => /foo/bar
    //   - https://subapp.musejs.org => '/'
    console.log('child full path: ', childFullPath, subApp);
    // TODO: get the real child url which has processed params
    const mountedSubPath = '/' + childBaseUrl.split('/').slice(3).join('/');
    console.log('mountedSubPath: ', mountedSubPath);
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
        ['', '?', '/', '#'].includes(childFullPath.charAt(mountedSubPath.length)));
    if (!isPathValid) return;
    const re = pathToRegexp(subApp.path, [], { end: false });
    const pathname = document.location.pathname;
    if (!re.test(pathname)) return;
    const m = pathname.match(re);
    console.log('parent register path: ', m[0]);
    const newParentFullPath = (
      m[0] +
      // '/' +
      // childFullPath = '/', mountedSubPath='/' => ''
      // childFullPath = '/abc', mountedSubPath='/' => 'abc'
      // childFullPath = '/abc', mountedSubPath='/abc' => ''
      // childFullPath = '/abc/def', mountedSubPath='/abc' => '/def'
      childFullPath.replace(mountedSubPath, '')
    )
      .replace(/\/+/g, '/')
      .replace(/\/$/, '');
    console.log('newParentFullPath: ', newParentFullPath);
    return newParentFullPath;
  },
  getOrigin(url) {
    const arr = url.split('/');
    arr.length = 3;
    return arr.join('/');
  },
};
