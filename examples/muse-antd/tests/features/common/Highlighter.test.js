import React from 'react';
import { shallow } from 'enzyme';
import { Highlighter } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<Highlighter />);
  expect(renderedComponent.find('.common-highlighter').length).toBe(1);
});
