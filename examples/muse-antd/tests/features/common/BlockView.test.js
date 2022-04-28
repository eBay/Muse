import React from 'react';
import { shallow } from 'enzyme';
import { BlockView } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<BlockView />);
  expect(renderedComponent.find('.common-block-view').length).toBe(1);
});
