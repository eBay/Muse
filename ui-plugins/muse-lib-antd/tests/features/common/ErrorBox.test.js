import React from 'react';
import { shallow } from 'enzyme';
import { ErrorBox } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<ErrorBox />);
  expect(renderedComponent.find('.common-erro-box').length).toBe(1);
});
