const { vol } = require('memfs');
const muse = require('../../');
const { registry } = require('../../storage');

describe('muse.msp builder tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('should return null when msp.yaml does not exist', async () => {
    const result = await muse.data.get('muse.msp');
    expect(result).toBeNull();
  });

  it('should return flat msp when no extends', async () => {
    await registry.set(
      '/msp.yaml',
      `
default:
  description: Base preset
  versions:
    "@ebay/muse-core": "1.0.45"
    "@ebay/muse-cli": "1.0.34"
`,
    );

    const result = await muse.data.get('muse.msp');
    expect(result.default.versions).toEqual({
      '@ebay/muse-core': '1.0.45',
      '@ebay/muse-cli': '1.0.34',
    });
  });

  it('should merge parent versions when extends is set', async () => {
    await registry.set(
      '/msp.yaml',
      `
default:
  versions:
    "@ebay/muse-core": "1.0.45"
    "@ebay/muse-lib-react": "1.3.2"
muse-react-260422:
  extends: default
  versions:
    "@ebay/muse-lib-react": "2.0.3"
`,
    );

    const result = await muse.data.get('muse.msp');
    expect(result['muse-react-260422'].versions).toEqual({
      '@ebay/muse-core': '1.0.45',
      '@ebay/muse-lib-react': '2.0.3',
    });
  });

  it('should resolve multi-level extends chain', async () => {
    await registry.set(
      '/msp.yaml',
      `
default:
  versions:
    "@ebay/muse-core": "1.0.45"
    "@ebay/muse-lib-react": "1.3.2"
    "@ebay/muse-lib-antd": "1.3.2"
muse-react-260422:
  extends: default
  versions:
    "@ebay/muse-lib-react": "2.0.3"
muse-react-antd-260422:
  extends: muse-react-260422
  versions:
    "@ebay/muse-lib-antd": "2.0.3"
`,
    );

    const result = await muse.data.get('muse.msp');
    expect(result['muse-react-antd-260422'].versions).toEqual({
      '@ebay/muse-core': '1.0.45',
      '@ebay/muse-lib-react': '2.0.3',
      '@ebay/muse-lib-antd': '2.0.3',
    });
  });

  it('should not modify other fields when flattening', async () => {
    await registry.set(
      '/msp.yaml',
      `
default:
  description: Base preset
  author: Nate Wang
  versions:
    "@ebay/muse-core": "1.0.45"
muse-react-260422:
  extends: default
  description: React preset
  author: Jane
  versions:
    "@ebay/muse-lib-react": "2.0.3"
`,
    );

    const result = await muse.data.get('muse.msp');
    expect(result['muse-react-260422'].description).toBe('React preset');
    expect(result['muse-react-260422'].author).toBe('Jane');
    expect(result['muse-react-260422'].extends).toBe('default');
  });

  it('should not infinite loop on circular extends', async () => {
    await registry.set(
      '/msp.yaml',
      `
a:
  extends: b
  versions:
    "@ebay/muse-core": "1.0.0"
b:
  extends: a
  versions:
    "@ebay/muse-cli": "1.0.0"
`,
    );

    const result = await muse.data.get('muse.msp');
    expect(result).toBeDefined();
  });

  it('should invalidate cache when msp.yaml changes', async () => {
    await registry.set(
      '/msp.yaml',
      `
default:
  versions:
    "@ebay/muse-core": "1.0.45"
`,
    );

    const first = await muse.data.get('muse.msp');
    expect(first.default.versions['@ebay/muse-core']).toBe('1.0.45');

    await registry.set(
      '/msp.yaml',
      `
default:
  versions:
    "@ebay/muse-core": "2.0.0"
`,
    );

    await muse.data.handleDataChange('registry', ['/msp.yaml']);
    const second = await muse.data.get('muse.msp');
    expect(second.default.versions['@ebay/muse-core']).toBe('2.0.0');
  });
});
