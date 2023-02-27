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
 *     path: '/muse-apps', // no array
 *     url: 'https://demo.muse.vip.ebay.com/muse-apps',
 *     persist: false,
 *     name: 'musedemo',
 *     env: 'production',
 *   }
 * ]
 */
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, usePrevious } from 'react-use';
import _ from 'lodash';
import { pathToRegexp } from 'path-to-regexp';
import history from '../../common/history';
import urlUtils from './urlUtils';
import { useSetSubAppState } from './redux/hooks';
import { LoadingSkeleton, C2SProxyFailed } from './';

const debouncedPush = _.debounce(url => {
  history.push(url);
});

const subAppCache = {};

// export default function SubAppContainerController({ context = null, subApps = [], subApp }) {
//   // TODO: do some cache for sub apps
//   const loc = useLocation();
//   const parentFullPath = loc.href.replace(loc.origin, '');

//   // find the current app info by url
//   let currentApp = null;
//   subApps.forEach(subApp => {
//     const re = pathToRegexp(subApp.path, [], { end: false });
//     if (re.test(parentFullPath)) {
//       const s = parentFullPath.replace(re, '');
//       if (!s || /^[/#?]/.test(s)) {
//         // "/abc" should not match "/abcde"
//         currentApp = subApp;
//       }
//     }
//   });

//   if (!currentApp) return null;
//   return <SubAppContainer context={context} subApps={subApps} currentApp={currentApp} />;
// }

// Map a url pattern to load another muse app in iframe
// For example: /groot-ui => https://grootapp.muse.vip.ebay.com
// It will sync path, querystring, hash between the parent and iframe
const msgEngine = window.MUSE_GLOBAL.msgEngine;
export default function SubAppContainer({ context = null, subApp }) {
  const iframeWrapperNode = useRef();
  const iframeNode = useRef();
  const [subAppState, setSubAppState] = useState();
  const [iframeMounted, setIframeMounted] = useState(false);
  const loc = useLocation();
  const parentFullPath = loc.href.replace(loc.origin, '');
  const subPath = urlUtils.toSubApp(parentFullPath, subApp.path, subApp.url);
  const subUrl = `${urlUtils.getBaseUrl(subApp.url)}${subPath}`;
  // When context is changed, send message to the child app
  useEffect(() => {
    // const iframe = iframeWrapperNode.current?.firstChild;
    if (iframeNode.current && subAppState === 'app-loaded') {
      msgEngine?.sendToChild(
        {
          type: 'sub-app-context-change',
          data: context,
        },
        iframeNode.current,
      );
    }
  }, [context, subApp, subAppState]);

  // Whenever parent url is changed, notify sub app to sync the url
  useEffect(() => {
    if (!iframeNode.current) return;
    msgEngine?.sendToChild(
      {
        type: 'parent-route-change',
        url: subPath,
      },
      iframeNode.current,
    );
  }, [parentFullPath, subPath]);

  // When current sub app is changed
  // If not persist, delete old app:
  //   - delete iframe
  //   - delete app state
  // If persist:
  //   - cache iframe and state: but the post message will pause?

  // while iframe is loaded, ensure it's a muse app
  const handleIframeOnload = useCallback(
    async evt => {
      console.log('iframe loaded');
      if (!iframeMounted) {
        setIframeMounted(true);
      } else {
        try {
          await window.MUSE_GLOBAL?.msgEngine.assertMuseApp(iframeNode.current);
          // setIframeMounted(true);
        } catch (err) {
          console.log('Not a muse app: ', err);
          setSubAppState('not-a-muse-app');
        }
      }
    },
    [iframeMounted],
  );

  useEffect(() => {
    // console.log('load sub app by url', iframeMounted, subUrl);
    if (iframeMounted) {
      console.log('load sub app by url', iframeNode.current, subPath);
      iframeNode.current.src = subUrl; //`${urlUtils.getBaseUrl(subApp.url)}${subPath}`;
    } else {
      msgEngine?.sendToChild(
        {
          type: 'parent-route-change',
          url: subPath,
        },
        iframeNode.current,
      );
    }
  }, [iframeMounted, subUrl, subPath]);

  // handle sub app messages: route change, app load status, etc...
  // const handleSubAppMsg = useCallback(
  //   msg => {
  //     console.log('handle msg: ', msg);
  //     if (!msg.type || !msg.url) return;
  //     const item = subApps.find(app => msg.url.startsWith(app.url));
  //     if (!item) return;
  //     if (msg.type === 'child-route-change' && msg.url) {
  //       if (item) {
  //         let subFullPath = msg.url.replace(item.url, '');
  //         if (!subFullPath.startsWith('/')) subFullPath = '/' + subFullPath;
  //         const newFullPath = item.path + subFullPath;
  //         if (newFullPath !== parentFullPath) {
  //           // Need debounce because there maybe quick redirect of the sub app which may cause endless loop
  //           debouncedPush(newFullPath);
  //         }
  //       }
  //     }
  //     if (msg.type === 'app-state-change') {
  //       setSubAppState({
  //         ...subAppState,
  //         [item.url]: msg.state,
  //       });

  //       if (msg.state === 'app-loaded' && currentApp && cache.current[currentApp.url]) {
  //         // for first load, need to set context to child
  //         msgEngine?.sendToChild(
  //           {
  //             type: 'sub-app-context-change',
  //             data: context,
  //           },
  //           cache.current[currentApp.url].iframe,
  //         );
  //       }
  //     }
  //   },
  //   [subApps, parentFullPath, subAppState, setSubAppState, context, currentApp],
  // );

  // const listenerKey = subApps.map(a => a.name + '@' + a.env).join('-');
  // useEffect(() => {
  //   msgEngine?.addListener(listenerKey, handleSubAppMsg);
  //   return () => msgEngine?.removeListener(listenerKey);
  // }, [listenerKey, handleSubAppMsg]);

  // const appState = subAppState[currentApp.url];

  return (
    <div className="muse-react_sub-app-sub-app-container">
      {subAppState !== 'app-loaded' &&
        subAppState !== 'app-failed' &&
        subAppState !== 'login-page' &&
        subAppState !== 'check-c2s-proxy-failed' && <LoadingSkeleton state={subAppState} />}
      {subAppState === 'app-failed' && (
        <div className="sub-app-sub-app-failed">
          Failed to start sub app {subApp.name}: /{subApp.path} =&gt; {subApp.url}.
        </div>
      )}
      {subAppState === 'check-c2s-proxy-failed' && <C2SProxyFailed />}

      <div
        ref={iframeWrapperNode}
        style={{
          visibility: ['app-loaded', 'login-page'].includes(subAppState) ? 'visible' : 'hidden',
        }}
        className="sub-app-iframe-wrapper"
      >
        <iframe
          ref={iframeNode}
          title="Muse Sub App"
          sandbox="allow-scripts allow-same-origin allow-forms"
          onLoad={handleIframeOnload}
        />
      </div>
    </div>
  );
}
