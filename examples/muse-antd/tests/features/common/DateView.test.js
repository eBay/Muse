import React from 'react';
import { shallow } from 'enzyme';
import { DateView } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<DateView />);
  expect(renderedComponent.find('.common-date-view').length).toBe(1);
});
