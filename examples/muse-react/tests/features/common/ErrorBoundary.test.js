import React from 'react';
import { shallow } from 'enzyme';
import { ErrorBoundary } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<ErrorBoundary />);
  expect(renderedComponent.find('.common-error-boundary').length).toBe(1);
});
