import React from 'react';
import { shallow } from 'enzyme';
import { MainLayout } from '../../../src/features/home';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<MainLayout />);
  expect(renderedComponent.find('.home-main-layout').length).toBe(1);
});
