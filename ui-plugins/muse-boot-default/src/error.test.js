import { describe, it, expect, beforeEach } from 'vitest';
import error from './error.js';

function setupMuseGlobal(overrides = {}) {
  window.MUSE_GLOBAL = { appConfig: {}, ...overrides };
}

describe('error', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    error.errors = [];
    delete error.mountNode;
    setupMuseGlobal();
  });

  describe('init', () => {
    it('appends #muse-error-node to document.body', () => {
      error.init();
      expect(document.getElementById('muse-error-node')).not.toBeNull();
      expect(error.mountNode).toBeDefined();
    });
  });

  describe('showMessage', () => {
    it('accepts a string and adds it to errors', () => {
      error.showMessage('Something went wrong');
      expect(error.errors).toContain('Something went wrong');
    });

    it('accepts an array and spreads all items into errors', () => {
      error.showMessage(['Error A', 'Error B']);
      expect(error.errors).toContain('Error A');
      expect(error.errors).toContain('Error B');
    });

    it('renders error HTML into mountNode', () => {
      error.showMessage('My error message');
      expect(error.mountNode.innerHTML).toContain('My error message');
    });

    it('auto-initializes mountNode if not set', () => {
      delete error.mountNode;
      error.showMessage('Late error');
      expect(document.getElementById('muse-error-node')).not.toBeNull();
    });
  });

  describe('update', () => {
    it('renders a single error as a <div>', () => {
      error.errors = ['Single error'];
      error.init();
      error.update();
      expect(error.mountNode.innerHTML).toContain('<div>Single error</div>');
      expect(error.mountNode.innerHTML).not.toContain('<ul>');
    });

    it('renders multiple errors as a <ul>', () => {
      error.errors = ['Error one', 'Error two'];
      error.init();
      error.update();
      expect(error.mountNode.innerHTML).toContain('<ul>');
      expect(error.mountNode.innerHTML).toContain('<li>Error one</li>');
      expect(error.mountNode.innerHTML).toContain('<li>Error two</li>');
    });

    it('uses supportLink from appConfig in the contact link', () => {
      setupMuseGlobal({ appConfig: { supportLink: 'https://support.example.com' } });
      error.errors = ['oops'];
      error.init();
      error.update();
      expect(error.mountNode.innerHTML).toContain('href="https://support.example.com"');
    });

    it('falls back to # for contact link when supportLink is absent', () => {
      setupMuseGlobal({ appConfig: {} });
      error.errors = ['oops'];
      error.init();
      error.update();
      expect(error.mountNode.innerHTML).toContain('href="#"');
    });
  });
});
