import { Form, Input } from 'antd';
import _ from 'lodash';

export default function VarEditableCell({
  editing,
  dataIndex,
  children,
  allData,
  record,
  ...restProps
}) {
  const rules = [];
  if (dataIndex === 'variableName') {
    rules.push(
      { required: true, message: 'Variable name is required.' },
      {
        message: 'Name already exists.',
        validator: (rule, value) => {
          if (_.without(allData, record).find((x) => x.variableName === value)) {
            return Promise.reject();
          }
          return Promise.resolve();
        },
      },
      {
        message: `Name should not include '.'`,
        validator: (rule, value) => {
          if (value.includes('.')) {
            return Promise.reject();
          }
          return Promise.resolve();
        },
      },
    );
  }
  if (editing && restProps.style) {
    restProps.style.verticalAlign = 'top';
  }

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item name={dataIndex} rules={rules} className="m-0">
          <Input />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
}
