import React from 'react';
import NiceForm from '@ebay/nice-form-react';

import { BlockView, TagInput, DateView } from './features/common';

import { config as niceFormConfig } from '@ebay/nice-form-react';
import antdAdaptor from '@ebay/nice-form-react/adaptors/antdAdaptor';

niceFormConfig.adaptor = antdAdaptor;
NiceForm.defineWidget('tag', TagInput);
NiceForm.defineWidget('tag-view', BlockView);
NiceForm.defineWidget('date-view', props => <DateView {...props} dateOnly />);
NiceForm.defineWidget('time-view', props => <DateView {...props} timeOnly />);
NiceForm.defineWidget('datetime-view', DateView);
