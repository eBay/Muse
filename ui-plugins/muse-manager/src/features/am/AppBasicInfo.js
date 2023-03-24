// import React from 'react';
import NiceForm from '@ebay/nice-form-react';
import AppIcon from './app-icon/AppIcon';
import utils from '@ebay/muse-lib-antd/src/utils';
import { Form } from 'antd';

export default function AppBasicInfo({ app }) {
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
        label: 'App entry',
        order: 30,
        tooltip: `Which plugin is used to start the Muse app. The default is the only found entry point.`,
        initialValue: 'default',
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
        clear: 'left',
        colSpan: 2,
        order: 1000,
        initialValue: 'No description.',
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

  utils.extendFormMeta(meta, 'museManager.am.appBasicInfo', { meta, app });

  return (
    <Form>
      <NiceForm meta={meta}></NiceForm>
    </Form>
  );
}
