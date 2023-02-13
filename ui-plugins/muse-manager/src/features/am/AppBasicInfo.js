// import React from 'react';
import FormBuilder from 'antd-form-builder';
import NiceForm from '@ebay/nice-form-react';
import AppIcon from './app-icon/AppIcon';
import jsPlugin from 'js-plugin';
import { Form } from 'antd';
import _ from 'lodash';

export default function AppBasicInfo({ app }) {
  console.log('render');
  const meta = {
    viewMode: true,
    initialValues: app,
    columns: 2,
    fields: [
      {
        key: 'name',
        label: 'Name',
        order: 10,
      },
      {
        key: 'title',
        label: 'Title',
        order: 20,
        tooltip: 'The title displayed on the browser tab.',
      },
      {
        key: 'config.entry',
        label: 'Entry plugin',
        order: 30,
        tooltip: `Which plugin is used to start the Muse app.`,
        getInitialValue: (ele, item) => {
          return _.get(item, 'config.entry') || 'muse-react';
        },
      },
      {
        key: 'createdBy',
        label: 'Created by',
        order: 40,
      },
      {
        key: 'createdAt',
        label: 'Created at',
        order: 50,
      },
      {
        key: 'description',
        label: 'Description',
        order: 1000,
      },
      {
        clear: 'left',
        key: 'iconId',
        label: 'App Icon',
        order: 1100,
        viewWidget: AppIcon,
        viewWidgetProps: { app },
      },
    ],
  };

  jsPlugin.invoke('museManager.appBasicInfo.processMeta', { meta, app });
  jsPlugin.sort(meta.fields);
  return (
    <Form>
      <NiceForm meta={meta}></NiceForm>
    </Form>
  );
}
