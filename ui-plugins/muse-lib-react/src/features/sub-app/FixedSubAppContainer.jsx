/**
 * Allows a plugin to easily integrate a sub app. It does below things:
 * - Load sub app
 * - URL sync
 * - SSO Check
 * - Communication
 *
 * FixedSubAppContainer is usually only used programatically, not by configure.
 *
 * The owner should handle the size of the sub app.
 */

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-use';
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

// Fixed sub app container is usualle embeded into some part of an app but not the full page
export default function FixedSubAppContainer({ context = null, subApp }) {
  const iframeWrapper = useRef();
  const [subAppState, setSubAppState] = useState();
  const loc = useLocation();
  // parentFullPath: https://cloud.ebay.com/app/musemanager/ecdx => /app/musemanager/ecdx
  const parentFullPath = loc.href.replace(loc.origin, '');

  // Get the sub app's path
  const subPath = urlUtils.getChildUrlPath(subApp);
  console.log('subPath', subPath);
  const currentIframe = iframeWrapper.current?.firstChild;

  const subUrl = `${urlUtils.getOrigin(subApp.url)}${subPath}`;
  // When context is changed, send message to the child app
  useEffect(() => {
    if (iframeWrapper.current && subAppState === 'app-loaded') {
      msgEngine?.sendToChild(
        {
          type: 'sub-app-context-change',
          data: context,
        },
        currentIframe,
      );
    }
  }, [context, subApp, currentIframe, subAppState]);

  // When sub app is first loaded, set the sub app url
  useEffect(() => {
    if (!subPath || !iframeWrapper.current) return;

    // when first load, create iframe node to load sub app
    let iframe = iframeWrapper.current?.firstChild;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.src = subUrl;
      iframeWrapper.current.appendChild(iframe);
    }
  }, [subUrl, subPath]);

  // Whenever parent path is changed, notify child iframe (sub app)
  useEffect(() => {
    if (!currentIframe || !subPath) return;

    msgEngine?.sendToChild(
      {
        type: 'parent-route-change',
        path: subPath,
        url: subPath, // use url to make it compatible with old muse-react
      },
      currentIframe,
    );
  }, [subPath, currentIframe]);

  // handle sub app messages: route change, app load status, etc...
  const handleSubAppMsg = useCallback(
    msg => {
      if (!msg.type) return;
      // Here msg.path is the full path of sub app
      if (msg.type === 'child-route-change' && msg.path) {
        const newParentFullPath = urlUtils.getParentPath(msg.path, subApp);
        if (newParentFullPath !== parentFullPath && newParentFullPath) {
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

  return (
    <div className="muse-react_sub-app-fixed-sub-app-container">
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
