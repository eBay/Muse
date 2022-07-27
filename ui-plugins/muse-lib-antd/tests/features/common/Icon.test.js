import React from 'react';
import { shallow } from 'enzyme';
import { Icon } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<Icon />);
  expect(renderedComponent.find('.common-icon').length).toBe(1);
});
