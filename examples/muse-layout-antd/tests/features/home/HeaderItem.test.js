import React from 'react';
import { shallow } from 'enzyme';
import { HeaderItem } from '../../../src/features/home';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<HeaderItem />);
  expect(renderedComponent.find('.home-header-item').length).toBe(1);
});
