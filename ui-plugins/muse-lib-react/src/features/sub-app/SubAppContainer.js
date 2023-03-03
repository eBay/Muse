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
 *     path: '/muse-apps', // no array. Support regex: /app/.* /someapp
 *     url: 'https://demo.muse.vip.ebay.com/muse-apps',
 *     persist: false,
 *     name: 'musedemo',
 *     env: 'production',
 *   }
 * ]
 */
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useLocation, usePrevious } from 'react-use';
import _ from 'lodash';
import history from '../../common/history';
import urlUtils from './urlUtils';
import { LoadingSkeleton, C2SProxyFailed } from './';

const debouncedPush = _.debounce(url => {
  history.push(url);
});

// Map a url pattern to load another muse app in iframe
// For example: /groot-ui => https://grootapp.muse.vip.ebay.com
// It will sync path, querystring, hash between the parent and iframe
const msgEngine = window.MUSE_GLOBAL.msgEngine;

export default function SubAppContainer({ context = null, subApp }) {
  const iframeWrapper = useRef();
  // const iframeNode = useRef();
  const [subAppState, setSubAppState] = useState();
  // const [iframeMounted, setIframeMounted] = useState(false);
  const loc = useLocation();
  // let urlPath = loc.href.replace(`${loc.protocol}//${loc.host}`);
  // if (!urlPath.startsWith('/') urlPath = '/' + urlPath;
  const parentFullPath = loc.href.replace(loc.origin, '');
  const subPath = urlUtils.toSubApp(parentFullPath, subApp.path, subApp.url);
  const subUrl = `${urlUtils.getBaseUrl(subApp.url)}${subPath}`;
  // When context is changed, send message to the child app
  useEffect(() => {
    // const iframe = iframeWrapperNode.current?.firstChild;
    if (iframeWrapper.current && subAppState === 'app-loaded') {
      msgEngine?.sendToChild(
        {
          type: 'sub-app-context-change',
          data: context,
        },
        iframeWrapper.current.firstChild,
      );
    }
  }, [context, subApp, subAppState]);

  // When current sub app is changed
  // If not persist, delete old app:
  //   - delete iframe
  //   - delete app state
  // If persist:
  //   - cache iframe and state: but the post message will pause?

  // while iframe is loaded, ensure it's a muse app
  const handleIframeOnload = useCallback(async evt => {
    // if (!iframeMounted) {
    //   // The first time
    //   setIframeMounted(true);
    // } else {
    try {
      await window.MUSE_GLOBAL?.msgEngine.assertMuseApp(iframeWrapper.current.firstChild);
      // setIframeMounted(true);
    } catch (err) {
      console.log('Not a muse app: ', err);
      setSubAppState('not-a-muse-app');
    }
    // }
  }, []);

  useEffect(() => {
    if (!iframeWrapper.current?.firstChild) {
      // when first load, create iframe node to load sub app
      const iframe = document.createElement('iframe');
      iframe.src = subUrl;
      // iframe.sandbox = 'allow-scripts allow-same-origin allow-forms';
      iframe.onload = handleIframeOnload;
      iframeWrapper.current?.appendChild(iframe);
    } else {
      // otherwise it means the parent url path is changed
      // need to notify the sub app to navigate
      // The sub app must handle the route change msg
      // By default it's implemented in @ebay/muse-lib-react/src/features/common/routeConfig.js
      msgEngine?.sendToChild(
        {
          type: 'parent-route-change',
          pathname: subPath,
        },
        iframeWrapper.current.firstChild,
      );
    }
  }, [subUrl, handleIframeOnload, subPath]);

  // handle sub app messages: route change, app load status, etc...
  const handleSubAppMsg = useCallback(
    msg => {
      console.log('handle msg: ', msg);
      if (!msg.type) return;
      if (msg.type === 'child-route-change' && msg.pathname) {
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
          (msg.pathname.startsWith(mountedSubPath) &&
            ['', '?', '/', '#'].includes(msg.pathname.chartAt(mountedSubPath.length)));
        if (!isPathValid) return;
        const newParentFullPath = (
          subApp.path +
          '/' +
          // msg.pathname = '/', mountedSubPath='/' => ''
          // msg.pathname = '/abc', mountedSubPath='/' => 'abc'
          // msg.pathname = '/abc', mountedSubPath='/abc' => ''
          // msg.pathname = '/abc/def', mountedSubPath='/abc' => '/def'
          msg.pathname.replace(mountedSubPath, '')
        )
          .replace('//', '/')
          .replace(/\/$/, '');
        // const newFullPath = subApp.path + msg.pathname;
        console.log(msg.pathname, newParentFullPath, mountedSubPath);

        if (newParentFullPath !== parentFullPath) {
          // Need debounce because there maybe quick redirect of the sub app which may cause endless loop
          debouncedPush(newParentFullPath);
        }
      } else if (msg.type === 'app-state-change') {
        setSubAppState(msg.state);
        if (msg.state === 'app-loaded') {
          // for first load, need to set context to child
          msgEngine?.sendToChild(
            {
              type: 'sub-app-context-change',
              data: context,
            },
            iframeWrapper.current.firstChild,
          );
        }
      }
    },
    [subApp, parentFullPath, setSubAppState, context],
  );

  useEffect(() => {
    const k = Math.random();
    msgEngine?.addListener(k, handleSubAppMsg);
    return () => msgEngine?.removeListener(k);
  }, [handleSubAppMsg]);

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
        ref={iframeWrapper}
        style={{
          visibility: ['app-loaded', 'login-page'].includes(subAppState) ? 'visible' : 'hidden',
        }}
        className="sub-app-iframe-wrapper"
      />
    </div>
  );
}
