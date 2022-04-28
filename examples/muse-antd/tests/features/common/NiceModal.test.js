import React from 'react';
import { shallow } from 'enzyme';
import { NiceModal } from '../../../src/features/common/NiceModal';

describe('common/NiceModal', () => {
  it('renders node with correct class name', () => {
    const props = {
      common: {},
      actions: {},
    };
    const renderedComponent = shallow(
      <NiceModal {...props} />
    );

    expect(
      renderedComponent.find('.common-nice-modal').length
    ).toBe(1);
  });
});
