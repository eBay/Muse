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
import { useLocation, useEvent } from 'react-use';
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
const iframeCache = {};

export default function SubAppContainer({ context = null, subApp }) {
  const iframeWrapper = useRef();
  const [subAppState, setSubAppState] = useState();
  const loc = useLocation();
  const parentFullPath = loc.href.replace(loc.origin, '');
  const subPath = urlUtils.getChildUrlPath(subApp);
  const currentIframe = iframeCache[subApp.url];

  const subUrl = `${urlUtils.getOrigin(subApp.url)}${subPath}`;
  // When context is changed, send message to the child app
  useEffect(() => {
    if (iframeWrapper.current && subAppState === 'app-loaded') {
      msgEngine?.sendToChild(
        {
          type: 'sub-app-context-change',
          data: context,
        },
        currentIframe, //iframeWrapper.current.firstChild,
      );
    }
  }, [context, subApp, currentIframe, subAppState]);

  // When current sub app is changed
  // If not persist, delete old app:
  //   - delete iframe
  //   - delete app state
  // If persist:
  //   - cache iframe and state: but the post message will pause?

  // while iframe is loaded, ensure it's a muse app
  const assertMuseApp = useCallback(async ifr => {
    try {
      await window.MUSE_GLOBAL?.msgEngine.assertMuseApp(ifr);
    } catch (err) {
      console.log('Not a muse app: ', err);
      setSubAppState('not-a-muse-app');
    }
  }, []);

  // Handle subapp iframe visibility
  useEffect(() => {
    if (!subPath || !iframeWrapper.current) return;

    // when first load, create iframe node to load sub app
    let iframe = iframeCache[subApp.url];
    const rect = iframeWrapper.current.getBoundingClientRect();
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.src = subUrl;
      iframe.onload = () => assertMuseApp(iframe);
      iframeCache[subApp.url] = iframe;
      Object.assign(iframe.style, {
        position: 'fixed',
        top: rect.top + 'px',
        left: rect.left + 'px',
        width: rect.width + 'px',
        height: rect.height + 'px',
        border: 'none',
        zIndex: 1000,
        margin: 0,
      });
      document.body.appendChild(iframe);
    } else {
      iframe.style.left = rect.left + 'px';
    }
  }, [subUrl, assertMuseApp, subPath, subApp.url]);

  // Whenever parent path is changed, notify child iframe (sub app)
  useEffect(() => {
    if (!currentIframe) return;
    msgEngine?.sendToChild(
      {
        type: 'parent-route-change',
        path: subPath,
      },
      currentIframe,
    );
  }, [subPath, currentIframe]);

  useEffect(() => {
    return () => {
      const iframe = iframeCache[subApp.url];
      if (iframe) {
        iframe.style.left = '-100000px';
      }
    };
  }, [subApp.url]);

  const onWindowResize = useCallback(() => {
    const iframe = iframeCache[subApp.url];

    if (iframe && iframeWrapper.current) {
      const rect = iframeWrapper.current.getBoundingClientRect();
      Object.assign(iframe.style, {
        width: rect.width + 'px',
        height: rect.height + 'px',
      });
    }
  }, [subApp.url]);

  useEvent('resize', onWindowResize);

  // handle sub app messages: route change, app load status, etc...
  const handleSubAppMsg = useCallback(
    msg => {
      if (!msg.type) return;
      // Here msg.path is the full path of sub app
      if (msg.type === 'child-route-change' && msg.path) {
        const newParentFullPath = urlUtils.getParentPath(msg.path, subApp);
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
            currentIframe,
          );
          currentIframe.museLoaded = true;
        }
      }
    },
    [subApp, parentFullPath, setSubAppState, context, currentIframe],
  );

  useEffect(() => {
    const k = Math.random();
    msgEngine?.addListener(k, handleSubAppMsg);
    return () => msgEngine?.removeListener(k);
  }, [handleSubAppMsg]);

  if (!subPath) {
    return 'Error: can not detect a sub app. Are you using sub app container correctly?';
  }
  return (
    <div className="muse-react_sub-app-sub-app-container">
      {!currentIframe?.museLoaded &&
        subAppState !== 'app-loaded' &&
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
