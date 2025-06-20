import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

vi.stubGlobal('MUSE_GLOBAL', {
  getUser: () => ({ username: 'test' }),
});

afterEach(() => {
  cleanup();
});
