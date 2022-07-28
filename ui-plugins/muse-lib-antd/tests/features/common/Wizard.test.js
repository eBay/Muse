import React from 'react';
import { shallow } from 'enzyme';
import { Wizard } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<Wizard />);
  expect(renderedComponent.find('.common-wizard').length).toBe(1);
});
