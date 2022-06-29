import React from 'react';
import { shallow } from 'enzyme';
import { GlobalErrorBox } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<GlobalErrorBox />);
  expect(renderedComponent.find('.common-global-error-box').length).toBe(1);
});
