/* 
E2E Testing Guide:
https://pages.github.corp.ebay.com/muse/muse-site/docs/e2e-test/e2e-test-overview

Some quick notes:
  1. Do NOT use arrow functions in before/after hooks and test cases
  2. Always use helper.openPage in your first test case to open Altus
  3. Always use helper.pushState to do no-refresh navigation in test cases
*/
const { expect } = require('chai');
const PageHelper = require('muse-e2e-test/lib/PageHelper');

describe('Main test', function() {
  let failed = false;
  let page = null;
  const helper = new PageHelper(null, this.file);

  beforeEach(function() {
    // By default, skip other tests if any failed
    if (failed) this.skip();
  });

  afterEach(function() {
    failed = failed || this.currentTest.state === 'failed';
  });

  after('Close page and create report.', async function() {
    await helper.complete(failed, this.currentTest);
  });

  // Always open Altus in your first test case
  it('Open page for testing', async function() {
    page = await helper.openPage();
    await page.waitForSelector('.muse-app');
  });

  it('This is your test case', async function() {
    expect(true).to.be.true;
  });
});
