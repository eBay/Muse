import React from 'react';
import { render, screen } from '@testing-library/react';
import { DateView } from '../../../src/features/common';

describe('common/DateView', () => {

  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-10-11 00:00:00').getTime());
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders DateView with full date', () => {
    render(<DateView value={new Date()} />);
    expect(screen.getByText('2023-10-11 00:00:00')).toBeTruthy();
  });

  it('renders DateView with date onlt', () => {
    render(<DateView value={new Date()} dateOnly />);
    expect(screen.getByText('2023-10-11')).toBeTruthy();
  });

  it('renders DateView with time onlt', () => {
    render(<DateView value={new Date()} timeOnly />);
    expect(screen.getByText('00:00:00')).toBeTruthy();
  });
});
