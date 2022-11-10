import FormBuilder from 'antd-form-builder';
import AppIcon from './app-icon/AppIcon';
import jsPlugin from 'js-plugin';
import _ from 'lodash';

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
        key: 'owners',
        label: 'Owners',
        order: 60,
      },
      {
        key: 'description',
        label: 'Description',
        order: 1000,
      },
      {
        clear: 'left',
        key: 'iconId',
        label: 'App icon',
        order: 1100,
        renderView: () => {
          return <AppIcon app={app} />;
        },
      },
    ],
  };

  jsPlugin.invoke('museManager.viewAppInfoForm.processMeta', { meta, app });
  jsPlugin.sort(meta.fields);
  return (
    <div>
      <FormBuilder meta={meta}></FormBuilder>
    </div>
  );
}
