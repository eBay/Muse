import React from 'react';
import { shallow } from 'enzyme';
import { LoadingMask } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<LoadingMask />);
  expect(renderedComponent.find('.common-loading-mask').length).toBe(1);
});
