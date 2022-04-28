import React from 'react';
import { shallow } from 'enzyme';
import { TableBar } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<TableBar />);
  expect(renderedComponent.find('.common-table-bar').length).toBe(1);
});
