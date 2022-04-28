import React from 'react';
import { shallow } from 'enzyme';
import { Sider } from '../../../src/features/home';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<Sider />);
  expect(renderedComponent.find('.home-sider').length).toBe(1);
});
