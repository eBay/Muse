import { useState } from 'react';
import { Descriptions, Button, Form, Table, Popconfirm } from 'antd';
import { RequestStatus, DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import NiceModal from '@ebay/nice-modal-react';
import _ from 'lodash';
import { useAbility, useSyncStatus, useMuseMutation, useMuseData } from '../../hooks';
import VarEditableCell from './VarEditableCell';

export default function PluginVariables({ app }) {
  const envs = app.envs ? Object.keys(app.envs) : [];
  const defaultPluginVars = app.pluginVariables ? Object.keys(app.pluginVariables) : [];
  const [editingKey, setEditingKey] = useState('');
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const isEditing = (record) => record.key === editingKey;
  const [newVarItem, setNewVarItem] = useState(false);
  const ability = useAbility();
  const [form] = Form.useForm();

  const { mutateAsync: updateApp, error: updateAppError } = useMuseMutation('am.updateApp');
  const { data: plugins } = useMuseData('muse.plugins');

  const updateVars = async (changes, isDelete) => {
    try {
      NiceModal.show('muse-lib-antd.loading-modal', {
        message: `${isDelete ? 'Deleting' : 'Updating'} plugin variables...`,
      });
      await updateApp({
        appName: app.name,
        changes,
      });
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
      setNewVarItem(false);
    });
  };
  const handleEdit = (record) => {
    setEditingKey(record.key);
    form.setFieldsValue(record);
  };
  const handleCancel = () => {
    setEditingKey('');
    setNewVarItem(false);
  };
  const handleNewVar = (pluginName) => {
    form.resetFields();
    setNewVarItem(true);
    setEditingKey(undefined);
  };

  const handleNewPlugin = () => {
    form.resetFields();
    setNewVarItem(true);
    setEditingKey(undefined);
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

  const columns = [
    {
      title: 'Plugin Name',
      dataIndex: 'pluginName',
      fixed: 'left',
      width: '220px',
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
      title: env,
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
      if (isEditing(record)) {
        return (
          <span>
            <Popconfirm
              title="Are you sure to update the variable?"
              okText="Yes"
              onConfirm={() => handleSave(record)}
            >
              <Button type="link" className="p-1 m-0 h-5">
                Save
              </Button>
            </Popconfirm>
            <Button type="link" className="p-1 m-0 ml-4 h-5" onClick={() => handleCancel(record)}>
              Cancel
            </Button>
          </span>
        );
      }
      const items = [
        {
          key: 'edit',
          order: 40,
          icon: 'edit',
          // disabled: !canUpdateApp,
          disabledText: 'No permission.',
          highlight: true,
          onClick: () => {
            console.log('handleEdit', record);
            handleEdit(record);
          },
        },
        {
          key: 'delete',
          order: 40,
          icon: 'delete',
          // disabled: !canUpdateApp,
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
      return <DropdownMenu items={items} />;
    },
  });

  const data = _.chain([app, ...Object.values(app.envs || {})])
    .map((target) => Object.keys(target?.pluginVariables || {}))
    .flatten()
    .uniq()
    .sort()
    // here are all plugin names, get all vars under each plugin
    .map((pluginName) =>
      _.chain([app, ...Object.values(app.envs || {})])
        .map((target) => Object.keys(target?.pluginVariables?.[pluginName] || {}))
        .flatten()
        .uniq()
        .sort()
        // here are all plugin vars, get all values under each var for each env
        .map((varName, i, arr) => {
          return {
            pluginNameRowSpan: i === 0 ? arr.length : 0,
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
      <Button type="link" className="mt-3" onClick={() => handleNewPlugin()}>
        + Add Plugin
      </Button>
      <div>
        <h3 className="p-2 px-3 my-2">
          [Default] Plugin variables
          <Button
            type="link"
            onClick={() =>
              NiceModal.show('muse-manager.edit-plugin-variables-modal', { app, env: null })
            }
            size="small"
            className="float-right"
          >
            Edit
          </Button>
        </h3>
        <Descriptions
          column={1}
          bordered
          labelStyle={{ width: '30%' }}
          contentStyle={{ width: '70%' }}
        >
          {defaultPluginVars.map((defPluginVar) => {
            return (
              <Descriptions.Item
                label={defPluginVar}
                labelStyle={{ width: '30%' }}
                contentStyle={{ width: '70%', padding: '5px 5px' }}
                key={defPluginVar}
              >
                <Descriptions column={1} bordered>
                  {Object.keys(app.pluginVariables[defPluginVar]).map((defPluginVarValue) => {
                    return (
                      <Descriptions.Item
                        contentStyle={{ width: '70%', padding: '5px 10px' }}
                        label={defPluginVarValue}
                        labelStyle={{ width: '30%' }}
                        key={`${defPluginVar}-${defPluginVarValue}`}
                      >
                        {app.pluginVariables[defPluginVar][defPluginVarValue]}
                      </Descriptions.Item>
                    );
                  })}
                </Descriptions>
              </Descriptions.Item>
            );
          })}
        </Descriptions>
      </div>
      {envs.map((env) => {
        const currentEnvVariables = app.envs[env].pluginVariables
          ? Object.keys(app.envs[env].pluginVariables)
          : [];
        return (
          <div key={env}>
            <h3 className="p-2 px-3 my-2">
              [{env}] Plugin variables
              <Button
                type="link"
                onClick={() =>
                  NiceModal.show('muse-manager.edit-plugin-variables-modal', { app, env: env })
                }
                size="small"
                className="float-right"
              >
                Edit
              </Button>
            </h3>
            <Descriptions
              column={1}
              bordered
              labelStyle={{ width: '30%' }}
              contentStyle={{ width: '70%' }}
            >
              {currentEnvVariables.map((defPluginVar) => {
                return (
                  <Descriptions.Item
                    labelStyle={{ width: '30%' }}
                    label={defPluginVar}
                    contentStyle={{ width: '70%', padding: '5px 5px' }}
                    key={`${env}-${defPluginVar}`}
                  >
                    <Descriptions
                      column={1}
                      bordered
                      labelStyle={{ width: '30%' }}
                      contentStyle={{ width: '70%' }}
                    >
                      {Object.keys(app.envs[env].pluginVariables[defPluginVar]).map(
                        (defPluginVarValue) => {
                          return (
                            <Descriptions.Item
                              label={defPluginVarValue}
                              contentStyle={{ width: '70%', padding: '5px 10px' }}
                              labelStyle={{ width: '30%' }}
                              key={`${env}-${defPluginVar}-${defPluginVarValue}`}
                            >
                              {app.envs[env].pluginVariables[defPluginVar][defPluginVarValue]}
                            </Descriptions.Item>
                          );
                        },
                      )}
                    </Descriptions>
                  </Descriptions.Item>
                );
              })}
            </Descriptions>
          </div>
        );
      })}
    </>
  );
}
