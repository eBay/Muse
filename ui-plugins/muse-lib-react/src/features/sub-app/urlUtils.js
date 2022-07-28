import { pathToRegexp } from 'path-to-regexp';

export default {
  toSubApp(url, path, subAppUrl) {
    const re = pathToRegexp(path, [], { end: false });
    if (re.test(path)) {
      let u = url.replace(re, '');
      if (!u.startsWith('/')) u = '/' + u;
      // https://abc.com/ab/def
      const arr = subAppUrl.split('/');
      arr.splice(0, 3);
      let s = arr.join('/').replace(/\/*$/, '') + u;
      if (!s.startsWith('/')) s = '/' + s;
      return s;
    }
    return null;
    // if (url.startsWith(path)) {
    //   let u = url.replace(path, '');
    //   if (!u.startsWith('/')) u = '/' + u;
    //   // https://abc.com/ab/def
    //   const arr = subAppUrl.split('/');
    //   arr.splice(0, 3);
    //   let s = arr.join('/').replace(/\/*$/, '') + u;
    //   if (!s.startsWith('/')) s = '/' + s;
    //   return s;
    // }
    // return null;
  },
  getBaseUrl(url) {
    const arr = url.split('/');
    arr.length = 3;
    return arr.join('/');
  },
};
