import React from 'react';
import logo from '../../images/logo.png';

export default function Homepage() {
  return (
    <div className="home-homepage">
      <header className="app-header">
        <img src={logo} className="app-logo" alt="logo" />
        <h1 className="app-title">Welcome to Muse3232!</h1>
      </header>
      <div className="app-intro">
        <p className="memo">This is the default homepage of a Muse application.</p>
        <h3>To get started:</h3>
        <ul>
          <li>
            <a href="https://go/muse">Read docs</a> for Muse.
          </li>
          <li>
            Join the slack channel{' '}
            <a href="https://ebay-eng.slack.com/archives/C0194Q1V8G1">#muse</a>.
          </li>
          <li>
            <a href="https://pages.github.corp.ebay.com/muse/muse-site/docs/get-started/first-plugin">
              Create a plugin
            </a>{' '}
            and{' '}
            <a href="https://pages.github.corp.ebay.com/muse/muse-site/docs/get-started/customize-the-layout">
              define the layout/homepage
            </a>{' '}
            for the application.
          </li>
          <li>
            <a href="https://pages.github.corp.ebay.com/muse/muse-site/docs/muse-management/build-plugin">
              Build
            </a>{' '}
            and{' '}
            <a href="https://pages.github.corp.ebay.com/muse/muse-site/docs/muse-management/deploy-plugin">
              deploy
            </a>{' '}
            the Muse plugin to the application.
          </li>
        </ul>
      </div>
    </div>
  );
}
