import React from 'react';
import { shallow } from 'enzyme';
import { HeaderItem } from '../../../src/features/home';

it('renders node with correct class name', () => {
  const renderedComponent = shallow(
    <HeaderItem
      meta={{
        label: 'label',
        link: 'link',
        linkTarget: 'linkTarget',
        onClick: jest.fn(),
        icon: '',
        className: '',
      }}
    />,
  );
  expect(renderedComponent.find('.home-header-item').length).toBe(1);
});
