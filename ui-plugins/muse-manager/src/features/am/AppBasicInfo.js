import FormBuilder from 'antd-form-builder';

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
      },
      {
        key: 'entry',
        label: 'Entry plugin',
        order: 30,
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
        order: 60,
      },
      {
        key: 'iconId',
        label: 'App icon',
        order: 70,
      },
    ],
  };
  return (
    <div>
      <FormBuilder meta={meta}></FormBuilder>
    </div>
  );
}
