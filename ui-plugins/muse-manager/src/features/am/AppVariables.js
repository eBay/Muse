import { useState } from 'react';
import { Descriptions, Button, Form, Table, Input, Popconfirm } from 'antd';
import { useAbility, useSyncStatus, useMuseMutation } from '../../hooks';
import _ from 'lodash';
import NiceModal from '@ebay/nice-modal-react';
import LoadingModal from './LoadingModal';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';

const EditableCell = ({ editing, dataIndex, children, allData, record, ...restProps }) => {
  const rules = [];
  if (dataIndex === '_variableName') {
    rules.push(
      { required: true, message: 'Variable name is required' },
      {
        message: 'Name already exists.',
        validator: (rule, value) => {
          if (_.without(allData, record).find((x) => x._variableName === value)) {
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
};

export default function AppVariables({ app }) {
  const envs = app.envs ? Object.keys(app.envs) : [];
  const ability = useAbility();
  const canUpdateApp = ability.can('update', 'App', app);
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const { mutateAsync: updateApp, error: updateAppError } = useMuseMutation('am.updateApp');
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record._variableName === editingKey;
  const [newVarItem, setNewVarItem] = useState(false);

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingKey(record._variableName);
  };

  const handleSave = (record) => {
    form.validateFields().then(async (values) => {
      const updateSet = [];
      const updateUnset = [];
      if (!values._variableName) return;
      let varName = record._variableName;

      // if var name is changed, remove the old var name
      if (varName !== values._variableName) {
        // remove app var
        updateUnset.push(`variables.${varName}`);

        // remove env vars
        envs.forEach((envName) => {
          updateUnset.push(`envs.${envName}.variables.${varName}`);
        });
        varName = values._variableName;
      }

      if (values._defaultVariableValue) {
        updateSet.push({ path: `variables.${varName}`, value: values._defaultVariableValue });
      } else {
        updateUnset.push(`variables.${varName}`);
      }
      envs.forEach((envName) => {
        if (values[envName]) {
          updateSet.push({ path: `envs.${envName}.variables.${varName}`, value: values[envName] });
        } else {
          updateUnset.push(`envs.${envName}.variables.${varName}`);
        }
      });

      const payload = {
        appName: app.name,
        changes: {
          set: updateSet,
          unset: updateUnset,
        },
      };
      try {
        NiceModal.show(LoadingModal, { message: 'Updating variables...' });
        await updateApp(payload);
        NiceModal.show(LoadingModal, { message: 'Syncing data...' });
        await syncStatus();
        NiceModal.hide(LoadingModal);
      } catch (err) {
        NiceModal.hide(LoadingModal);
      }
      setEditingKey('');
      setNewVarItem(false);
    });
  };

  const handleNewVar = () => {
    form.resetFields();
    setNewVarItem(true);
    setEditingKey(undefined);
  };

  const handleCancel = () => {
    setEditingKey('');
    setNewVarItem(false);
  };

  const handleDelete = (record) => {
    (async () => {
      const varName = record._variableName;
      const payload = {
        appName: app.name,
        changes: {
          unset: [
            `variables.${varName}`,
            ...envs.map((envName) => `envs.${envName}.variables.${varName}`),
          ],
        },
      };

      try {
        NiceModal.show(LoadingModal, { message: 'Deleting the variable...' });
        await updateApp(payload);
        NiceModal.show(LoadingModal, { message: 'Syncing data...' });
        await syncStatus();
        NiceModal.hide(LoadingModal);
      } catch (err) {
        NiceModal.hide(LoadingModal);
      }
    })();
  };

  const columns = [
    {
      dataIndex: '_variableName',
      title: 'Name',
      width: '300px',
      fixed: 'left',
      editable: true,
    },
    {
      dataIndex: '_defaultVariableValue',
      title: 'Default',
      editable: true,
    },
  ];

  envs.forEach((env) => {
    columns.push({
      dataIndex: env,
      title: env,
      editable: true,

      // width: 100 / envs.length + '%',
    });
  });

  columns.push({
    dataIndex: '_variableActions',
    title: 'Actions',
    width: '150px',
    fixed: 'right',
    render: (x, record) => {
      return isEditing(record) ? (
        <span>
          <Button type="link" className="p-0 m-0 h-5" onClick={() => handleSave(record)}>
            Save
          </Button>
          <Button type="link" className="p-0 m-0 ml-4 h-5" onClick={() => handleCancel(record)}>
            Cancel
          </Button>
        </span>
      ) : (
        <span>
          <Button type="link" className="p-0 m-0 h-5" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record)}>
            <Button type="link" danger className="p-0 m-0 ml-4 h-5">
              Delete
            </Button>
          </Popconfirm>
        </span>
      );
    },
  });

  const data = _.uniq([
    ...Object.keys(app.variables || {}),
    ..._.flatten(Object.values(app.envs).map((env) => Object.keys(env.variables || {}))),
  ])
    .sort()
    .map((variableName) => {
      const row = {
        _variableName: variableName,
        _defaultVariableValue: app.variables[variableName],
      };

      envs.forEach((env) => {
        row[env] = app.envs[env].variables[variableName];
      });

      return row;
    });

  if (newVarItem) {
    data.push({});
  }

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        allData: data,
        dataIndex: col.dataIndex,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <>
      <Form form={form} component={false}>
        <RequestStatus error={updateAppError} />
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          columns={mergedColumns}
          rowKey="_variableName"
          size="small"
          pagination={false}
          dataSource={data}
          scroll={{ x: 1300 }}
        />
      </Form>
      <Button type="link" className="mt-3" onClick={() => handleNewVar()}>
        + Add Variable
      </Button>
    </>
  );
}
