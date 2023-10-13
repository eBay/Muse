import React from 'react';
import { render, screen, act, waitFor, within } from '@testing-library/react';
import NiceModal from '@ebay/nice-modal-react';
import LoadingModal from '../../../src/features/common/LoadingModal';
import '../../../src/modals';

describe('common/LoadingModal', () => {
  it('renders default LoadingModal', async () => {
    render(<NiceModal.Provider><LoadingModal id="loadingModal" message="loading..." /></NiceModal.Provider>);

    act(() => {
      NiceModal.show('loadingModal');
    });

    const modalWindow = await screen.getByRole('dialog');
    await waitFor(
      () => expect(within(modalWindow).getByText('loading...')).toBeTruthy(),
      {
        timeout: 3000,
      },
    );
  });
});