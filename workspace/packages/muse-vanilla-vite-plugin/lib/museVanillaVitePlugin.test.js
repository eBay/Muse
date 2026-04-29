import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
    existsSync: vi.fn(),
  },
}));

import fs from 'fs';
import museVanillaVitePlugin from './museVanillaVitePlugin.js';

const ENV_KEYS = ['PORT', 'HTTPS', 'MUSE_LOCAL_HOST_NAME', 'SSL_CRT_FILE', 'SSL_KEY_FILE'];

function runConfigHook(plugin, userConfig = {}) {
  plugin.config(userConfig);
  return userConfig;
}

function makePkgJson(museType = 'init') {
  return JSON.stringify({ name: 'my-plugin', muse: { type: museType } });
}

describe('museVanillaVitePlugin', () => {
  const savedEnv = {};

  beforeEach(() => {
    vi.clearAllMocks();

    vi.spyOn(process, 'cwd').mockReturnValue('/test/project');

    fs.readFileSync.mockImplementation((filePath) => {
      if (typeof filePath === 'string' && filePath.endsWith('package.json')) {
        return makePkgJson('init');
      }
      return 'cert-or-key-content';
    });
    fs.existsSync.mockReturnValue(false);

    ENV_KEYS.forEach((key) => {
      savedEnv[key] = process.env[key];
      delete process.env[key];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();

    ENV_KEYS.forEach((key) => {
      if (savedEnv[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = savedEnv[key];
      }
    });
  });

  it('returns a plugin with the correct name', () => {
    const plugin = museVanillaVitePlugin();
    expect(plugin.name).toBe('muse-vanilla-vite-plugin');
  });

  describe('build config', () => {
    it('sets outDir to build/dist', () => {
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.build.outDir).toBe('build/dist');
    });

    it('enables sourcemap', () => {
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.build.sourcemap).toBe(true);
    });

    it('sets rollupOptions input to src/main.js', () => {
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.build.rollupOptions.input).toBe('src/main.js');
    });

    it('sets output format to iife', () => {
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.build.rollupOptions.output.format).toBe('iife');
    });

    it('outputs main.js for init plugins', () => {
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.build.rollupOptions.output.entryFileNames).toBe('main.js');
    });

    it('outputs main.js for normal plugins', () => {
      fs.readFileSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.endsWith('package.json')) {
          return makePkgJson('normal');
        }
        return 'cert-or-key-content';
      });
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.build.rollupOptions.output.entryFileNames).toBe('main.js');
    });

    it('outputs boot.js for boot plugins', () => {
      fs.readFileSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.endsWith('package.json')) {
          return makePkgJson('boot');
        }
        return 'cert-or-key-content';
      });
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.build.rollupOptions.output.entryFileNames).toBe('boot.js');
    });
  });

  describe('server config', () => {
    it('defaults host to localhost', () => {
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.server.host).toBe('localhost');
    });

    it('uses MUSE_LOCAL_HOST_NAME for host', () => {
      process.env.MUSE_LOCAL_HOST_NAME = 'myhost.local';
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.server.host).toBe('myhost.local');
    });

    it('does not set origin when PORT is not set', () => {
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.server.origin).toBeUndefined();
    });

    it('sets port and strictPort when PORT is set', () => {
      process.env.PORT = '3000';
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.server.port).toBe('3000');
      expect(config.server.strictPort).toBe(true);
    });

    it('sets http origin when PORT is set', () => {
      process.env.PORT = '3000';
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.server.origin).toBe('http://localhost:3000');
    });

    it('sets https origin when PORT and HTTPS=true are set', () => {
      process.env.PORT = '3000';
      process.env.HTTPS = 'true';
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.server.origin).toBe('https://localhost:3000');
    });

    it('includes host from MUSE_LOCAL_HOST_NAME in origin', () => {
      process.env.PORT = '4000';
      process.env.MUSE_LOCAL_HOST_NAME = 'myhost.local';
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.server.origin).toBe('http://myhost.local:4000');
    });
  });

  describe('HTTPS config', () => {
    it('does not enable https when HTTPS env var is not set', () => {
      fs.existsSync.mockReturnValue(true);
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.server.https).toBeFalsy();
    });

    it('does not enable https when cert files do not exist', () => {
      process.env.HTTPS = 'true';
      fs.existsSync.mockReturnValue(false);
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.server.https).toBeFalsy();
    });

    it('enables https when HTTPS=true and cert files exist', () => {
      process.env.HTTPS = 'true';
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.endsWith('package.json')) {
          return makePkgJson('init');
        }
        if (typeof filePath === 'string' && filePath.endsWith('.crt')) return 'cert-content';
        if (typeof filePath === 'string' && filePath.endsWith('.key')) return 'key-content';
        return '';
      });
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.server.https).toMatchObject({ cert: 'cert-content', key: 'key-content' });
    });

    it('uses SSL_CRT_FILE and SSL_KEY_FILE env vars for cert paths', () => {
      process.env.HTTPS = 'true';
      process.env.SSL_CRT_FILE = '/custom/cert.crt';
      process.env.SSL_KEY_FILE = '/custom/cert.key';
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.endsWith('package.json')) {
          return makePkgJson('init');
        }
        return `content:${filePath}`;
      });
      runConfigHook(museVanillaVitePlugin());
      expect(fs.existsSync).toHaveBeenCalledWith('/custom/cert.crt');
      expect(fs.existsSync).toHaveBeenCalledWith('/custom/cert.key');
    });

    it('reads cert files from default paths when env vars are not set', () => {
      process.env.HTTPS = 'true';
      fs.existsSync.mockReturnValue(true);
      fs.readFileSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.endsWith('package.json')) {
          return makePkgJson('init');
        }
        return 'content';
      });
      runConfigHook(museVanillaVitePlugin());
      expect(fs.existsSync).toHaveBeenCalledWith(
        '/test/project/node_modules/.muse/certs/muse-dev-cert.crt',
      );
      expect(fs.existsSync).toHaveBeenCalledWith(
        '/test/project/node_modules/.muse/certs/muse-dev-cert.key',
      );
    });
  });

  describe('user config merging', () => {
    it('user build.outDir takes precedence over plugin default', () => {
      const config = runConfigHook(museVanillaVitePlugin(), { build: { outDir: 'custom/output' } });
      expect(config.build.outDir).toBe('custom/output');
    });

    it('user server.host takes precedence over MUSE_LOCAL_HOST_NAME', () => {
      process.env.MUSE_LOCAL_HOST_NAME = 'env-host';
      const config = runConfigHook(museVanillaVitePlugin(), { server: { host: 'user-host' } });
      expect(config.server.host).toBe('user-host');
    });

    it('merges user config alongside plugin defaults', () => {
      const config = runConfigHook(museVanillaVitePlugin(), { build: { minify: false } });
      expect(config.build.minify).toBe(false);
      expect(config.build.outDir).toBe('build/dist');
    });

    it('merges arrays from user config and plugin defaults', () => {
      const config = runConfigHook(museVanillaVitePlugin(), { plugins: ['user-plugin'] });
      expect(config.plugins).toContain('user-plugin');
    });
  });

  describe('package.json read failure', () => {
    it('falls back to main.js output when package.json cannot be read', () => {
      fs.readFileSync.mockImplementation((filePath) => {
        if (typeof filePath === 'string' && filePath.endsWith('package.json')) {
          throw new Error('ENOENT');
        }
        return 'cert-content';
      });
      const config = runConfigHook(museVanillaVitePlugin());
      expect(config.build.rollupOptions.output.entryFileNames).toBe('main.js');
    });
  });
});
