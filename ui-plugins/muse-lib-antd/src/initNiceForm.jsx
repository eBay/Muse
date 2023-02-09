import React from 'react';
import NiceForm from '@ebay/nice-form-react';

import { BlockView, TagInput, DateView } from './features/common';

import { config as niceFormConfig } from '@ebay/nice-form-react';
import antdAdaptor from '@ebay/nice-form-react/adaptors/antdAdaptor';

niceFormConfig.adaptor = antdAdaptor;

niceFormConfig.defineWidget('tag', TagInput);
niceFormConfig.defineWidget('tag-view', BlockView);
niceFormConfig.defineWidget('date-view', props => <DateView {...props} dateOnly />);
niceFormConfig.defineWidget('time-view', props => <DateView {...props} timeOnly />);
niceFormConfig.defineWidget('datetime-view', DateView);
