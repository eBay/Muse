import { useCallback } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Form, Modal, message, Input, Divider, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import FormBuilder from 'antd-form-builder';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseApi } from '../../hooks';
import plugin from 'js-plugin';

const { TextArea } = Input;

const user = window.MUSE_GLOBAL.getUser();

const EditEnvironmentModal = NiceModal.create(({ env, app }) => {
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const propertiesToJSON = str => {
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

  const populateEnvVariablesInputField = () => {
    let propertyVariables = '';
    // we check if we have "variables" section, and transform the js object into "properties" string format
    if (env.variables) {
      for (const [key, value] of Object.entries(env.variables)) {
        propertyVariables += `${key}=${value}\n`;
      }
    }
    return propertyVariables;
  };

  const initialEnvVariables = populateEnvVariablesInputField();

  const modal = useModal();
  const [form] = Form.useForm();

  console.log(env);
  const {
    action: updateEnv,
    error: updateEnvError,
    pending: updateEnvPending,
  } = useMuseApi('am.updateEnv');

  const meta = {
    columns: 1,
    initialValues: { ...env, envName: env.name },
    fields: [],
  };

  plugin.invoke('museManager.editEnvForm.processMeta', { meta, form, env });

  meta.fields.push({
    render: () => {
      return (
        <>
          <Divider style={{ marginTop: '30px' }}>
            Configuration Variables
            <Tooltip
              overlayStyle={{ maxWidth: '500px' }}
              title={
                <span>
                  Env. specific variables that can be accessed from any deployed plugin on this
                  application. Enter key/values, one per line, using properties syntax. eg
                  "var=value"
                </span>
              }
            >
              <QuestionCircleOutlined
                className="antd-form-builder-question-icon"
                style={{ marginLeft: '8px', color: '#40a9ff' }}
              />
            </Tooltip>
          </Divider>
          <Form.Item name="variables" initialValue={initialEnvVariables}>
            <TextArea rows={4} />
          </Form.Item>
        </>
      );
    },
  });

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    const transformedVariables = propertiesToJSON(values.variables);
    updateEnv({
      changes: {
        set: Object.entries({ ...values, variables: transformedVariables }).map(item => {
          return { path: item[0], value: item[1] };
        }),
      },
      appName: app.name,
      envName: env.name,
      author: user.username,
    })
      .then(async () => {
        modal.hide();
        message.success('Update environment success.');
        await syncStatus();
      })
      .catch(err => {
        console.log('failed to update environment', err);
      });
  }, [updateEnv, modal, form, syncStatus, app, env]);

  return (
    <Modal
      {...antdModal(modal)}
      title={`Edit Environment`}
      width="600px"
      okText="Update"
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={updateEnvPending} error={updateEnvError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish}>
        <FormBuilder form={form} meta={meta} />
      </Form>
    </Modal>
  );
});

export default EditEnvironmentModal;
