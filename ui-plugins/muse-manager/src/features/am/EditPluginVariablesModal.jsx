import { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Alert, message, Form, Input, Button, Select, Tooltip, Divider } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseMutation, useAbility, usePollingMuseData } from '../../hooks';
import { DeleteOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import jsPlugin from 'js-plugin';
import NiceForm from '@ebay/nice-form-react';
import utils from '@ebay/muse-lib-antd/src/utils';
const { TextArea } = Input;

const EditPluginVariablesModal = NiceModal.create(({ app, env }) => {
  const user = window.MUSE_GLOBAL?.getUser();
  const ability = useAbility();
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const { data } = usePollingMuseData('muse.plugins');
  const isAppOwner = app?.owners?.includes(user?.username);
  const pluginList = data
    ?.filter((pl) => ability.can('config', 'Plugin', { app, plugin: pl }))
    .map((pl) => {
      return { label: pl.name, value: pl.name };
    });

  const {
    mutateAsync: updateApp,
    error: updateAppError,
    isLoading: updateAppPending,
  } = useMuseMutation('am.updateApp');

  const populateEnvVariablesInputField = (environmentVars) => {
    let propertyVariables = '';
    if (environmentVars) {
      for (const [key, value] of Object.entries(environmentVars)) {
        propertyVariables += `${key}=${value}\n`;
      }
    }
    return propertyVariables;
  };

  const populateInitialPluginVariables = (environmentVars) => {
    let pluginVariables = [];
    if (environmentVars) {
      for (const [key, value] of Object.entries(environmentVars)) {
        pluginVariables.push({ pluginName: key, variables: populateEnvVariablesInputField(value) });
      }
    }
    return { pluginVariables: pluginVariables };
  };

  const initialPluginVariableValues = populateInitialPluginVariables(
    env ? app.envs[env].pluginVariables : app.pluginVariables,
  );

  const handleFinish = useCallback(() => {
    const propertiesToJSON = (str) => {
      const sanitizedLines = str
        // Concat lines that end with '\'.
        .replace(/\\\n( )*/g, '')
        // Split by line breaks and remove empty lines
        .split('\n')
        .filter(Boolean);

      // now for each line, we create a json object with key : value
      const populatedJson = {};
      for (const propline of sanitizedLines) {
        // split key/value by the first occurrence of '=' (additional '=' on the same line may belong to the value itself)
        const firstOccurrenceOfEquals = propline.indexOf('=');
        const currentKey = propline.substring(0, firstOccurrenceOfEquals);
        const currentValue = propline.substring(firstOccurrenceOfEquals + 1, propline.length);
        populatedJson[currentKey] = currentValue;
      }

      return populatedJson;
    };

    const populatePluginVarsForUpdate = (pluginVarFields) => {
      const pluginVariables = {};
      for (const pluginVarField of pluginVarFields) {
        pluginVariables[pluginVarField.pluginName] = propertiesToJSON(pluginVarField.variables);
      }

      return pluginVariables;
    };

    let values = form.getFieldsValue();
    const variablesForEnv = values.pluginVariables;

    if (env) {
      const restOfEnvValues = (({ pluginVariables, ...others }) => others)(app.envs[env]);
      if (!values.envs) {
        values = { envs: {} };
        values.envs[env] = { pluginVariables: {} };
      }
      values.envs[env] = restOfEnvValues;
      delete values.envs[env].plugins;
    }

    env
      ? (values.envs[env].pluginVariables = variablesForEnv
          ? populatePluginVarsForUpdate(variablesForEnv)
          : null)
      : (values.pluginVariables = variablesForEnv
          ? populatePluginVarsForUpdate(variablesForEnv)
          : null);

    const updateSet = values.pluginVariables
      ? Object.entries(values).map(([k, v]) => {
          return {
            path: k,
            value: v,
          };
        })
      : { path: `envs.${env}.pluginVariables`, value: values.envs[env].pluginVariables };
    const payload = {
      appName: app.name,
      changes: {
        set: updateSet,
      },
    };
    jsPlugin.invoke('museManager.editAppVariablesForm.processPayload', { payload, form, env });
    updateApp(payload)
      .then(async () => {
        modal.hide();
        message.success('Update app success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to update', err);
      });
  }, [updateApp, syncStatus, modal, form, app, env]);

  const meta = {
    fields: [],
  };
  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.editPluginVariablesForm', {
    meta: meta,
    form,
    env,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);

  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Edit ${env ? `[${env}]` : '[Default]'} Plugin Variables`}
      width="1024px"
      centered
      okText={updateAppPending ? 'Updating...' : 'Update'}
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <div
        id="scrollableDiv"
        style={{
          height: '60vh',
          overflow: 'auto',
        }}
      >
        <RequestStatus loading={updateAppPending} error={updateAppError} />
        {!isAppOwner && (
          <Alert
            showIcon
            message="Only plugins you are owner of can be selected for editing variables"
            type="info"
            style={{ marginBottom: '20px' }}
          />
        )}
        <Form
          layout="horizontal"
          form={form}
          onFinish={handleFinish}
          initialValues={initialPluginVariableValues}
          onValuesChange={updateOnChange}
        >
          <Form.List name="pluginVariables">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <>
                    <div key={key} align="baseline">
                      <Form.Item
                        {...restField}
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        name={[name, 'pluginName']}
                        label="Plugin Name"
                        rules={[
                          {
                            required: true,
                            message: 'Missing plugin name',
                          },
                        ]}
                      >
                        <Select
                          options={pluginList}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) => (option?.label ?? '').includes(input)}
                          filterSort={(optionA, optionB) =>
                            (optionA?.label ?? '')
                              .toLowerCase()
                              .localeCompare((optionB?.label ?? '').toLowerCase())
                          }
                          placeholder="Plugin Name"
                          style={{ width: '250px' }}
                        />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        labelCol={{ span: 7 }}
                        wrapperCol={{ span: 17 }}
                        label={
                          <span>
                            Plugin Variables{' '}
                            <Tooltip
                              title={
                                'Plugin variables. Enter key/values, one per line, using properties syntax. eg  "var=value"'
                              }
                            >
                              <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                            </Tooltip>
                          </span>
                        }
                        name={[name, 'variables']}
                      >
                        <TextArea
                          style={{ width: '650px' }}
                          rows={8}
                          placeholder="Plugin variables"
                        />
                      </Form.Item>
                      <DeleteOutlined
                        style={{
                          width: '97%',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          color: '#d93026',
                        }}
                        onClick={() => remove(name)}
                      />
                    </div>
                    <Divider />
                  </>
                ))}
                <Form.Item>
                  <Button
                    style={{ width: '180px', float: 'right', marginRight: '30px' }}
                    type="primary"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Plugin Variables
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
          <NiceForm meta={meta}></NiceForm>
        </Form>
      </div>
    </Modal>
  );
});

export default EditPluginVariablesModal;
