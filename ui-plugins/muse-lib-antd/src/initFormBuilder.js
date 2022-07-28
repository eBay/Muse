import React from 'react';
import FormBuilder from 'antd-form-builder';
import {
  BlockView,
 
  TagInput,
  DateView,
} from './features/common';

FormBuilder.defineWidget('tag', TagInput);
FormBuilder.defineWidget('tag-view', BlockView);
FormBuilder.defineWidget('date-view', props => <DateView {...props} dateOnly />);
FormBuilder.defineWidget('time-view', props => <DateView {...props} timeOnly />);
FormBuilder.defineWidget('datetime-view', DateView);