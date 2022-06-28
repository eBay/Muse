import React from 'react';
import { shallow } from 'enzyme';
import { StatusLabel } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<StatusLabel />);
  expect(renderedComponent.find('.common-status-label').length).toBe(1);
});
