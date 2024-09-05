import { $ } from 'zx';
import { expect } from 'chai';

describe('muse-cli tests at start', function () {
  it('"muse -v" should print the version', async function () {
    const { stdout } = await $`muse -v`;
    expect(stdout).to.match(/\d\.\d\.\d/);
  });

  it('"muse -h" should print the help', async function () {
    const { stdout } = await $`muse -h`;
    expect(stdout).to.contain('Usage:');
  });

  it('"muse info" should print the info', async function () {
    const { stdout } = await $`muse info`;
    expect(stdout).to.contain('Muse CLI version:');
    expect(stdout).to.contain('Muse core version:');
  });

  it('"muse view-config" should print no config by default', async function () {
    const { stdout } = await $`muse view-config`;
    expect(stdout).to.contain('No config');
  });

  it('"muse view-config" should print config if created', async function () {
    await $`echo "module.exports = {};" > ~/muse-cli.config.js`;
    const { stdout } = await $`muse view-config`;
    expect(stdout).to.contain('Config file:');
    expect(stdout).to.contain('module.exports = {};');
    await $`rm ~/muse-cli.config.js`;
  });
});
