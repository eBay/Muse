import { useState, useEffect } from 'react';
import { Button, Form, Table, Popconfirm, Modal } from 'antd';
import { useAbility, useSyncStatus, useMuseMutation } from '../../hooks';
import _ from 'lodash';
import NiceModal from '@ebay/nice-modal-react';
import { RequestStatus, DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';
import VarEditableCell from './VarEditableCell';
import { FooterItem } from '../common/ModalFooter';
import jsPlugin from 'js-plugin';

export default function AppVariables({ app }) {
  const envs = app.envs ? Object.keys(app.envs) : [];
  const ability = useAbility();
  const [antdModal, contextHolder] = Modal.useModal();
  const canUpdateApp = ability.can('update', 'App', app);
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const { mutateAsync: updateApp, error: updateAppError } = useMuseMutation('am.updateApp');
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record.variableName === editingKey;
  const [newVarItem, setNewVarItem] = useState(false);

  const extArgs = {
    ability,
    form,
    antdModal,
    syncStatus,
    app,
  };

  const updateVars = async (changes) => {
    try {
      NiceModal.show('muse-lib-antd.loading-modal', { message: 'Updating app variables...' });
      const payload = {
        appName: app.name,
        changes,
      };
      jsPlugin.invoke('museManager.am.appVariables.form.processPayload', {
        payload,
        values: form.getFieldsValue(),
      });
      await updateApp(payload);
      NiceModal.show('muse-lib-antd.loading-modal', { message: 'Syncing data...' });
      await syncStatus();
      NiceModal.hide('muse-lib-antd.loading-modal');
    } catch (err) {
      NiceModal.hide('muse-lib-antd.loading-modal');
    }
  };

  const handleEdit = (record) => {
    form.setFieldsValue(record);
    setEditingKey(record.variableName);
  };

  const handleSave = (record) => {
    form.validateFields().then(async (values) => {
      const updateSet = [];
      const updateUnset = [];
      if (!values.variableName) return;
      let varName = record.variableName;

      // if var name is changed, remove the old var name
      if (varName !== values.variableName) {
        // remove app var
        updateUnset.push(`variables.${varName}`);

        // remove env vars
        envs.forEach((envName) => {
          updateUnset.push(`envs.${envName}.variables.${varName}`);
        });
        varName = values.variableName;
      }

      if (values.defaultVariableValue) {
        updateSet.push({ path: `variables.${varName}`, value: values.defaultVariableValue });
      } else {
        updateUnset.push(`variables.${varName}`);
      }
      envs.forEach((envName) => {
        if (values.envs?.[envName]) {
          updateSet.push({
            path: `envs.${envName}.variables.${varName}`,
            value: values.envs[envName],
          });
        } else {
          updateUnset.push(`envs.${envName}.variables.${varName}`);
        }
      });

      await updateVars({
        set: updateSet,
        unset: updateUnset,
      });
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
      const varName = record.variableName;
      await updateVars({
        unset: [
          `variables.${varName}`,
          ...envs.map((envName) => `envs.${envName}.variables.${varName}`),
        ],
      });
    })();
  };

  // Auto focus the new var name input
  useEffect(() => {
    setTimeout(() => document.getElementById('variableName')?.focus(), 30);
  }, [newVarItem]);
  const columns = [
    {
      dataIndex: 'variableName',
      title: 'Variable Name',
      width: '300px',
      fixed: 'left',
      editable: true,
    },
    {
      dataIndex: 'defaultVariableValue',
      title: 'Default Value',
      editable: true,
    },
  ];

  envs.forEach((env) => {
    columns.push({
      dataIndex: ['envs', env],
      title: _.capitalize(env),
      editable: true,
    });
  });

  columns.push({
    dataIndex: 'variableActions',
    title: 'Actions',
    width: '150px',
    fixed: 'right',
    align: 'center',
    onCell: (record, index) => {
      if (isEditing(record)) {
        return {
          style: {
            verticalAlign: 'top',
          },
        };
      }
      return {};
    },
    render: (x, record) => {
      let items;
      if (isEditing(record)) {
        items = [
          {
            key: 'save',
            order: 10,
            content: (
              <Popconfirm
                title="Are you sure to update the variable?"
                okText="Yes"
                onConfirm={() => handleSave(record)}
              >
                <Button type="primary" className="mt-1" size="small">
                  Save
                </Button>
              </Popconfirm>
            ),
          },
          {
            key: 'cancel',
            order: 20,
            props: {
              size: 'small',
              children: 'Cancel',
              className: 'ml-2 mt-1',
              onClick: () => handleCancel(record),
            },
          },
        ];
      } else {
        items = [
          {
            key: 'edit',
            order: 40,
            icon: 'edit',
            disabled: !canUpdateApp,
            disabledText: 'No permission.',
            highlight: true,
            onClick: () => {
              handleEdit(record);
            },
          },
          {
            key: 'delete',
            order: 40,
            icon: 'delete',
            disabled: !canUpdateApp,
            disabledText: 'No permission.',

            highlight: true,
            danger: true,
            confirm: {
              title: 'Are you sure to delete the variable?',
              okText: 'Delete',
              okButtonProps: {
                danger: true,
              },
              onConfirm: () => {
                handleDelete(record);
              },
            },
          },
        ];
      }
      extendArray(items, 'tableActions', 'museManager.am.appVariables', {
        actions: items,
        record,
        ...extArgs,
      });
      if (isEditing(record)) {
        return (
          <span>
            {items.map((item) => (
              <FooterItem key={item.key} item={item} />
            ))}
          </span>
        );
      } else {
        return <DropdownMenu items={items} />;
      }
    },
  });

  const data = _.uniq([
    ...Object.keys(app.variables || {}),
    ..._.flatten(Object.values(app.envs).map((env) => Object.keys(env.variables || {}))),
  ])
    .sort()
    .map((variableName) => {
      const row = {
        variableName: variableName,
        defaultVariableValue: app.variables?.[variableName],
        envs: _.chain(envs)
          .map((env) => [env, app.envs?.[env]?.variables?.[variableName]])
          .fromPairs()
          .value(),
      };

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
              cell: VarEditableCell,
            },
          }}
          className="mt-3"
          columns={mergedColumns}
          rowKey="variableName"
          size="small"
          pagination={false}
          dataSource={data}
          scroll={{ x: 1300 }}
        />
      </Form>
      <Button
        type="link"
        className="mt-3"
        onClick={() => handleNewVar()}
        title={!canUpdateApp && 'No Permission.'}
        disabled={!canUpdateApp}
      >
        + Add a variable
      </Button>
      {contextHolder}
    </>
  );
}
