import React from 'react';
import { shallow } from 'enzyme';
import { MetaMenu } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<MetaMenu />);
  expect(renderedComponent.find('.common-meta-menu').length).toBe(1);
});
