import React from 'react';
import { shallow } from 'enzyme';
import { Homepage } from '../../../src/features/home';

describe('home/Homepage', () => {
  it('renders node with correct class name', () => {
    const props = {
      home: {},
      actions: {},
    };
    const renderedComponent = shallow(<Homepage {...props} />);

    expect(renderedComponent.find('.home-welcome-page').length).toBe(1);
  });
});
