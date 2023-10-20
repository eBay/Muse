import React from 'react';
import { render, screen } from '@testing-library/react';
import * as testUtils from '../../test-utils';
import { Header } from '../../../src/features/home';

describe('home/Header', () => {
  beforeEach(() => {
    testUtils.resetStore();
  });

  it('renders default Header', () => {
    testUtils.renderWithProviders(<Header />);
  });
});
