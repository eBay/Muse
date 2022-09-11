import FormBuilder from 'antd-form-builder';

import Environments from './Environments';

export default function Overview({ app }) {
  const meta = {
    viewMode: true,
    initialValues: app,
    columns: 2,
    fields: [
      {
        key: 'name',
        label: 'Name',
      },
      {
        key: 'createdBy',
        label: 'Created by',
      },
    ],
  };
  return (
    <div>
      <h3>Basic Information</h3>
      <FormBuilder meta={meta}></FormBuilder>

      <h3>Environments:</h3>
      <Environments app={app} />
    </div>
  );
}
