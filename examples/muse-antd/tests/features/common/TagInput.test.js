import React from 'react';
import { shallow } from 'enzyme';
import { TagInput } from '../../../src/features/common';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(<TagInput />);
  expect(renderedComponent.find('.common-tag-input').length).toBe(1);
});
