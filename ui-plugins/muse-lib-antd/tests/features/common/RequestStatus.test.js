import React from 'react';
import { shallow } from 'enzyme';
import { RequestStatus } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<RequestStatus />);
  expect(renderedComponent.find('.common-request-status').length).toBe(1);
});
