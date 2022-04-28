import React from 'react';
import { shallow } from 'enzyme';
import { CodeViewer } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<CodeViewer />);
  expect(renderedComponent.find('.common-code-viewer').length).toBe(1);
});
