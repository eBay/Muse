/**
 * Allows a plugin to easily integrate a sub app. It does below things:
 * - Load sub app
 * - URL sync
 * - SSO Check
 * - Communication
 * - Cache pages
 * - Auto resize iframe
 *
 * For example:
 * Sub apps configured in muse-react plugin:
 * [
 *   {
 *     path: ['/plugin-manager', '/muse-apps'],
 *     url: 'https://demo.muse.vip.ebay.com',
 *     persist: false,
 *     name: 'musedemo',
 *     env: 'production',
 *   }
 * ]
 */
import React, { useEffect, useCallback, useRef } from 'react';
import { useLocation, usePrevious } from 'react-use';
import _ from 'lodash';
import { pathToRegexp } from 'path-to-regexp';
import history from '../../common/history';
import urlUtils from './urlUtils';
import { useSetSubAppState } from './redux/hooks';
import { LoadingSkeleton, C2SProxyFailed } from './';

const debouncedPush = _.debounce((url) => {
  history.push(url);
});

export default function SubAppContainerController({ context = null, subApps = [], app }) {
  // TODO: do some cache for sub apps
  const loc = useLocation();
  const fullPath = loc.href.replace(loc.origin, '');

  // find the current app info by url
  let currentApp = null;
  subApps.forEach((app) => {
    const re = pathToRegexp(app.path, [], { end: false });
    if (re.test(fullPath)) {
      const s = fullPath.replace(re, '');
      if (!s || /^[/#?]/.test(s)) {
        // "/abc" should not match "/abcde"
        currentApp = app;
      }
    }
  });
  console.log('current sub app: ', currentApp);
  if (!currentApp) return null;
  return <SubAppContainer context={context} subApps={subApps} currentApp={currentApp} />;
}

// Map a url pattern to load another muse app in iframe
// For example: /groot-ui => https://grootapp.muse.vip.ebay.com
// It will sync path, querystring, hash between the parent and iframe
function SubAppContainer({ context = null, subApps = [], currentApp }) {
  const cache = useRef({});
  const iframeWrapperNode = useRef();
  const { subAppState, setSubAppState, clearSubAppState } = useSetSubAppState();
  const loc = useLocation();
  const fullPath = loc.href.replace(loc.origin, '');

  // When context is changed, send message to the child app
  useEffect(() => {
    if (cache.current[currentApp.url]?.iframe && subAppState[currentApp.url] === 'app-loaded') {
      window.MUSE_GLOBAL?.msgEngine?.sendToChild(
        {
          type: 'sub-app-context-change',
          data: context,
        },
        cache.current[currentApp.url].iframe,
      );
    }
  }, [context, currentApp, subAppState]);

  useEffect(() => {
    // whenever url change, notify sub app to sync the url
    if (!cache.current[currentApp.url]) return; // when first load, current app is null
    const subUrl = urlUtils.toSubApp(fullPath, currentApp.path, currentApp.url);
    window.MUSE_GLOBAL?.msgEngine?.sendToChild(
      {
        type: 'parent-route-change',
        url: subUrl,
      },
      cache.current[currentApp.url].iframe,
    );
  }, [fullPath, subApps, currentApp]);

  // useEffect(() => {
  //   iframeLoadStatus[currentApp.url] = 0;
  // }, [currentApp]);

  useEffect(() => {
    // when unmounted, clear app state
    return clearSubAppState;
  }, [clearSubAppState]);

  // When current sub app is changed
  // If not persist, delete old app:
  //   - delete iframe
  //   - delete app state
  // If persist:
  //   - cache iframe and state: but the post message will pause?

  const handleIframeOnload = async (evt) => {
    try {
      console.log('on load.', cache.current[currentApp.url].iframe.contentWindow);

      console.log('assert it is muse app');
      const app = await window.MUSE_GLOBAL?.msgEngine.assertMuseApp(
        cache.current[currentApp.url].iframe,
      );
      console.log('It is a muse app: ', app);
    } catch (err) {
      console.log('Not a muse app: ', err);
      setSubAppState({
        ...subAppState,
        [currentApp.url]: 'login-page',
      });
      // window.MUSE_GLOBAL?.login && window.MUSE_GLOBAL?.login();
    }
  };
  const prevApp = usePrevious(currentApp);
  useEffect(() => {
    // clean up state of prev app if necessary
    if (prevApp && !prevApp.persist) {
      const s = { ...subAppState };
      delete s[prevApp.url];
      setSubAppState(s);
      delete cache.current[prevApp.url];
    }

    // clean up iframe placeholder, seems only to remove prevApp's iframe node
    if (iframeWrapperNode.current) {
      _.forEach(iframeWrapperNode.current.childNodes, (n) => {
        iframeWrapperNode.current.removeChild(n);
      });
    }

    // create iframe node if neccessary
    const subUrl = urlUtils.toSubApp(fullPath, currentApp.path, currentApp.url);
    if (!cache.current[currentApp.url]) {
      const iframe = document.createElement('iframe');
      iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';
      iframe.src = `${urlUtils.getBaseUrl(currentApp.url)}${subUrl}`;
      iframe.onload = handleIframeOnload;
      iframeWrapperNode.current?.appendChild(iframe);
      cache.current[currentApp.url] = {
        key: currentApp.url,
        app: currentApp.name,
        env: currentApp.env,
        iframe,
      };
    } else {
      iframeWrapperNode.current?.appendChild(cache.current[currentApp.url].iframe);
      window.MUSE_GLOBAL?.msgEngine?.sendToChild(
        {
          type: 'parent-route-change',
          url: subUrl,
        },
        cache.current[currentApp.url].iframe,
      );
    }
  }, [currentApp]); // eslint-disable-line

  // handle sub app messages: route change, app load status, etc...
  const handleSubAppMsg = useCallback(
    (msg) => {
      console.log('handle msg: ', msg);
      if (!msg.type || !msg.url) return;
      const item = subApps.find((app) => msg.url.startsWith(app.url));
      if (!item) return;
      if (msg.type === 'child-route-change' && msg.url) {
        if (item) {
          let subFullPath = msg.url.replace(item.url, '');
          if (!subFullPath.startsWith('/')) subFullPath = '/' + subFullPath;
          const newFullPath = item.path + subFullPath;
          if (newFullPath !== fullPath) {
            // Need debounce because there maybe quick redirect of the sub app which may cause endless loop
            debouncedPush(newFullPath);
          }
        }
      }
      if (msg.type === 'app-state-change') {
        setSubAppState({
          ...subAppState,
          [item.url]: msg.state,
        });

        if (msg.state === 'app-loaded' && currentApp && cache.current[currentApp.url]) {
          // for first load, need to set context to child
          window.MUSE_GLOBAL?.msgEngine?.sendToChild(
            {
              type: 'sub-app-context-change',
              data: context,
            },
            cache.current[currentApp.url].iframe,
          );
        }
      }
    },
    [subApps, fullPath, subAppState, setSubAppState, context, currentApp],
  );

  const listenerKey = subApps.map((a) => a.name + '@' + a.env).join('-');
  useEffect(() => {
    window.MUSE_GLOBAL?.msgEngine?.addListener(listenerKey, handleSubAppMsg);
    return () => window.MUSE_GLOBAL?.msgEngine?.removeListener(listenerKey);
  }, [listenerKey, handleSubAppMsg]);

  const appState = subAppState[currentApp.url];

  return (
    <div className="sub-app-sub-app-container">
      {appState !== 'app-loaded' &&
        appState !== 'app-failed' &&
        appState !== 'login-page' &&
        appState !== 'check-c2s-proxy-failed' && <LoadingSkeleton state={appState} />}
      {appState === 'app-failed' && (
        <div className="sub-app-sub-app-failed">
          Failed to start sub app: {currentApp.path} => {currentApp.url}.
        </div>
      )}
      {appState === 'check-c2s-proxy-failed' && <C2SProxyFailed />}

      {
        <div
          ref={iframeWrapperNode}
          style={{
            visibility: ['app-loaded', 'login-page'].includes(appState) ? 'visible' : 'hidden',
          }}
          className="sub-app-iframe-wrapper"
        />
      }
    </div>
  );
}
