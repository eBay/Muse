import { useState, useEffect } from 'react';
import { Button, Form, Table, Popconfirm, Select } from 'antd';
import { RequestStatus, DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';
import NiceModal from '@ebay/nice-modal-react';
import _ from 'lodash';
import { useAbility, useSyncStatus, useMuseMutation, useMuseData } from '../../hooks';
import VarEditableCell from './VarEditableCell';
import { FooterItem } from '../common/ModalFooter';
import jsPlugin from 'js-plugin';

export default function PluginVariables({ app }) {
  const envs = app.envs ? Object.keys(app.envs) : [];
  const [editingKey, setEditingKey] = useState('');

  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const isEditing = (record) => record.key === editingKey;
  const [newVarPlugin, setNewVarPlugin] = useState(false);
  const ability = useAbility();
  const [form] = Form.useForm();
  const extArgs = {
    ability,
    form,
    syncStatus,
    app,
  };
  const { mutateAsync: updateApp, error: updateAppError } = useMuseMutation('am.updateApp');
  const { data: plugins } = useMuseData('muse.plugins');

  const updateVars = async (changes, isDelete) => {
    try {
      NiceModal.show('muse-lib-antd.loading-modal', {
        message: `${isDelete ? 'Deleting' : 'Updating'} plugin variables...`,
      });
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
  const handleSave = (record) => {
    form.validateFields().then(async (values) => {
      const updateSet = [];
      const updateUnset = [];
      if (!values.variableName) return;
      let varName = record.variableName;

      // if var name is changed, remove the old var name
      if (varName !== values.variableName) {
        // remove app plugin var
        updateUnset.push(`pluginVariables.${record.pluginName}.${varName}`);

        // remove env plugin vars
        envs.forEach((envName) => {
          updateUnset.push(`envs.${envName}.pluginVariables.${record.pluginName}.${varName}`);
        });
        varName = values.variableName;
      }

      const varPath = `pluginVariables.${record.pluginName}.${varName}`;
      // set app plugin variable
      if (values.defaultVariableValue) {
        updateSet.push({
          path: `${varPath}`,
          value: values.defaultVariableValue,
        });
      } else {
        updateUnset.push(`${varPath}`);
      }

      // set env plugin variables
      envs.forEach((envName) => {
        if (values.envs?.[envName]) {
          updateSet.push({
            path: `envs.${envName}.${varPath}`,
            value: values.envs[envName],
          });
        } else {
          updateUnset.push(`envs.${envName}.${varPath}`);
        }
      });

      await updateVars({
        set: updateSet,
        unset: updateUnset,
      });
      setEditingKey('');
      setNewVarPlugin(false);
    });
  };
  const handleEdit = (record) => {
    setEditingKey(record.key);
    form.setFieldsValue(record);
  };
  const handleCancel = () => {
    setEditingKey('');
    setNewVarPlugin(false);
  };

  const handleNewVar = (pluginName) => {
    console.log(pluginName);
    form.resetFields();
    setNewVarPlugin(pluginName);
    setEditingKey(`${pluginName}.`);
  };
  const handleDelete = (record) => {
    (async () => {
      const varPath = `pluginVariables.${record.pluginName}.${record.variableName}`;
      await updateVars(
        {
          unset: [varPath, ...envs.map((envName) => `envs.${envName}.${varPath}`)],
        },
        'delete',
      );
    })();
  };

  // Auto focus the new var name input
  useEffect(() => {
    setTimeout(() => document.getElementById('variableName')?.focus(), 30);
  }, [newVarPlugin]);

  const columns = [
    {
      title: 'Plugin Name',
      dataIndex: 'pluginName',
      fixed: 'left',
      width: '220px',
      render: (name) => <b>{name}</b>,
      onCell: (record, index) => {
        return {
          rowSpan: record.pluginNameRowSpan,
          style: {
            verticalAlign: 'top',
          },
        };
      },
    },
    {
      title: 'Variable Name',
      dataIndex: 'variableName',
      fixed: 'left',
      width: '220px',
      editable: true,
    },
    {
      title: 'Default Value',
      dataIndex: 'defaultVariableValue',
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
        const canConfigPlugin = ability.can('config', 'Plugin', {
          app,
          plugin: plugins?.find((p) => p.name === record.pluginName),
        });
        items = [
          {
            key: 'add',
            order: 30,
            icon: 'plus',
            label: 'Add a variable',
            disabled: !canConfigPlugin,
            disabledText: 'No permission.',
            style: {
              visibility: record.isLast ? 'visible' : 'hidden',
            },
            highlight: true,
            onClick: () => {
              handleNewVar(record.pluginName);
            },
          },
          {
            key: 'edit',
            order: 40,
            icon: 'edit',
            label: 'Edit',
            disabled: !canConfigPlugin,
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
            disabled: !canConfigPlugin,
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

  const data = _.chain([app, ...Object.values(app.envs || {})])
    .map((target) => Object.keys(target?.pluginVariables || {}))
    .flatten()
    .uniq()
    .sort()
    .concat(newVarPlugin ? [newVarPlugin] : [])
    .uniq()
    // here are all plugin names, get all vars under each plugin
    .map((pluginName) =>
      _.chain([app, ...Object.values(app.envs || {})])
        .map((target) => Object.keys(target?.pluginVariables?.[pluginName] || {}))
        .flatten()
        .uniq()
        .sort()
        // here are all plugin vars, get all values under each var for each env
        .concat(pluginName === newVarPlugin ? [''] : [])
        .map((varName, i, arr) => {
          return {
            pluginNameRowSpan: i === 0 ? arr.length : 0,
            isLast: i === arr.length - 1,
            pluginName: pluginName,
            variableName: varName,
            defaultVariableValue: app.pluginVariables?.[pluginName]?.[varName],
            key: `${pluginName}.${varName}`,
            envs: _.chain(envs)
              .map((env) => [env, app.envs?.[env]?.pluginVariables?.[pluginName]?.[varName]])
              .fromPairs()
              .value(),
          };
        })
        .value(),
    )
    .flatten()
    .value();

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        allData: data.filter((x) => x.pluginName === record.pluginName),
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
          columns={mergedColumns}
          dataSource={data}
          pagination={false}
          bordered
          className="mt-3"
          rowKey="key"
          size="small"
          scroll={{ x: 1300 }}
        />
      </Form>
      <Select
        className="mt-3 w-52 text-blue-600"
        showSearch
        value={null}
        popupMatchSelectWidth={false}
        placeholder={<span>Add a plugin</span>}
        options={plugins
          ?.filter((p) => ability.can('config', 'Plugin', { app, plugin: p }))
          ?.map((p) => ({ value: p.name, label: p.name }))}
        onChange={handleNewVar}
      />
    </>
  );
}
