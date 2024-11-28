/* eslint jsx-a11y/heading-has-content: 0*/
import React from 'react';
import { ReactComponent as LoadingSvg } from './subAppLoading2.svg';
const stateMap = {
  'app-starting': 'Loading sub app...',
  'app-loading': 'Starting sub app...',
  'fetch-user-info': 'Fetching user info...',
  'app-begin-login': 'Checking authentication...',
  'check-c2s-proxy': 'Checking c2s proxy...',
  // 'redirect-login': 'Redirecting to login page...',
};
export default function LoadingSkeleton({ state }) {
  return (
    <div className="sub-app-loading-skeleton">
      <div className="sub-app-loading-center-container">
        {LoadingSvg ? React.createElement(LoadingSvg) : <></>}
        <label>{stateMap[state] || 'Loading sub app...'}</label>
      </div>
    </div>
  );
}
