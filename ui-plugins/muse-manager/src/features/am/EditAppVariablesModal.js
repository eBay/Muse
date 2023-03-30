import { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import utils from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';
import { useSyncStatus, useMuseApi } from '../../hooks';

const EditAppVariablesModal = NiceModal.create(({ app, env }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  const {
    mutateAsync: updateApp,
    error: updateAppError,
    isLoading: updateAppPending,
  } = useMuseApi('am.updateApp');

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

  const populateEnvVariablesInputField = (environmentVars) => {
    let propertyVariables = '';
    // we check if we have "variables" section, and transform the js object into "properties" string format
    if (environmentVars) {
      for (const [key, value] of Object.entries(environmentVars)) {
        propertyVariables += `${key}=${value}\n`;
      }
    }
    return propertyVariables;
  };

  const sectionMeta = {
    columns: 2,
    formItemLayout: [10, 14],
    fields: [
      {
        key: `variables`,
        label: 'Variables',
        widget: 'textarea',
        widgetProps: { rows: 10 },
        initialValue: populateEnvVariablesInputField(env ? app.envs[env].variables : app.variables),
        colSpan: 2,
        tooltip:
          'App. variables. Enter key/values, one per line, using properties syntax. eg  "var=value"',
      },
    ].filter(Boolean),
  };

  const handleFinish = useCallback(() => {
    let values = form.getFieldsValue();
    const variablesForEnv = values.variables;

    if (env) {
      const restOfEnvValues = (({ variables, ...others }) => others)(app.envs[env]);
      if (!values.envs) {
        values = { envs: {} };
        values.envs[env] = { variables: {} };
      }
      values.envs[env] = restOfEnvValues;
      delete values.envs[env].plugins;
    }

    env
      ? (values.envs[env].variables = variablesForEnv ? propertiesToJSON(variablesForEnv) : null)
      : (values.variables = variablesForEnv ? propertiesToJSON(variablesForEnv) : null);

    updateApp({
      appName: app.name,
      changes: {
        set: Object.entries(values).map(([k, v]) => {
          return {
            path: k,
            value: v,
          };
        }),
      },
    })
      .then(async () => {
        modal.hide();
        message.success('Update app success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to update', err);
      });
  }, [updateApp, syncStatus, modal, form, app, env]);

  const { watchingFields } = utils.extendFormMeta(sectionMeta, 'museManager.editAppVariablesForm', {
    meta: sectionMeta,
    form,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);

  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Edit ${env ? `[${env}]` : '[Default]'} Application Variables`}
      width="800px"
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
          height: '40vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <RequestStatus loading={updateAppPending} error={updateAppError} />
        <Form
          layout="horizontal"
          form={form}
          onValuesChange={updateOnChange}
          onFinish={handleFinish}
        >
          <NiceForm meta={sectionMeta} />
        </Form>
      </div>
    </Modal>
  );
});

export default EditAppVariablesModal;
