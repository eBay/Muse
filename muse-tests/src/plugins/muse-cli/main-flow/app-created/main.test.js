import { $ } from 'zx';
import os from 'os';
import path from 'path';
import { expect } from 'chai';

describe('cli tests after app created', function () {
  it('"muse create-app" with same name should throw error', async function () {
    const { stdout } = await $`muse create-app app1`;
    expect(stdout).to.contain('App app1 already exists');
  });

  it('"muse view-app" should print the app info', async function () {
    const { stdout } = await $`muse view-app app1`;
    const appJson = JSON.parse(stdout.replace(/✨.+/, ''));
    expect(appJson).to.have.property('name', 'app1');
  });

  it('"muse view-full-app" should print the app info', async function () {
    const { stdout } = await $`muse view-full-app app1`;
    const appJson = JSON.parse(stdout.replace(/✨.+/, ''));
    expect(appJson).to.have.property('name', 'app1');
    expect(appJson).to.have.nested.property('envs.staging.plugins');
  });

  it('"muse set-app-var" should set the app default vars', async function () {
    await $`muse set-app-var app1 --vars foo=bar`;
    const { stdout } = await $`muse view-app app1`;
    const appJson = JSON.parse(stdout.replace(/✨.+/, ''));
    expect(appJson).to.have.nested.property('variables.foo', 'bar');
  });

  it('"muse set-app-var -e" should set the app env vars', async function () {
    await $`muse set-app-var app1 --vars foo=bar2 -e staging`;
    const { stdout } = await $`muse view-app app1`;
    const appJson = JSON.parse(stdout.replace(/✨.+/, ''));
    expect(appJson).to.have.nested.property('envs.staging.variables.foo', 'bar2');
  });
});
