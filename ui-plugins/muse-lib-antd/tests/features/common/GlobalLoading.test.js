import React from 'react';
import { shallow } from 'enzyme';
import { GlobalLoading } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<GlobalLoading />);
  expect(renderedComponent.find('.common-global-loading').length).toBe(1);
});
