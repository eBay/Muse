import { useCallback } from 'react';
import { Modal, Form, Button, Alert } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import NiceForm from '@ebay/nice-form-react';
import { useMuseMutation, useSyncStatus } from '../../hooks';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import utils from '@ebay/muse-lib-antd/src/utils';
import jsPlugin from 'js-plugin';

export default NiceModal.create(function AddEnvModal({ app }) {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const {
    mutateAsync: addAppEnv,
    error: addAppEnvError,
    isLoading: addAppEnvPending,
  } = useMuseMutation('am.createEnv');

  const hideModal = useCallback(() => {
    modal.hide();
  }, [modal]);

  const handleAddAppEnv = useCallback(() => {
    form.validateFields().then((values) => {
      values.baseEnv = `${app.name}/${values.baseEnv}`;
      const payload = Object.assign({ appName: app.name }, values);
      jsPlugin.invoke('museManager.am.addEnvironmentModal.form.processPayload', {
        payload,
        values,
      });
      addAppEnv(payload)
        .then((res) => {
          let content = '';
          if (values.type === 'production') {
            content = (
              <span>
                The <strong>{values.envName}</strong> environment was successfully created. Please
                ask for approval in Muse slack channel: #muse.
              </span>
            );
          } else {
            content = (
              <span>
                The <strong>{values.envName}</strong> environment was successfully created.
              </span>
            );
          }
          syncStatus(app.name);
          Modal.success({
            title: 'Success',
            content,
            onOk() {
              hideModal();
              return Promise.resolve();
            },
          });
        })
        .catch((err) => {
          return;
        });
    });
  }, [form, app, addAppEnv, hideModal, syncStatus]);

  const footer = (
    <>
      {!addAppEnvPending && <Button onClick={hideModal}>Cancel</Button>}
      {!addAppEnvPending && (
        <Button type="primary" onClick={handleAddAppEnv}>
          Submit
        </Button>
      )}
      {addAppEnvPending && <Button>Cancel</Button>}
      {addAppEnvPending && <Button>Submiting...</Button>}
    </>
  );

  const meta = {
    columns: 1,
    fields: [
      {
        order: 10,
        key: 'envName',
        label: 'Environment Name',
        widget: 'input',
        disabled: form.getFieldValue('type') === 'production',
        required: true,
        rules: [
          {
            pattern: /^[a-z-0-9]+$/,
            message: 'Environment name contains only lowercase, numbers, or "-"',
          },
          () => ({
            validator(rule, value) {
              if (app.envs && Object.keys(app.envs).includes(value)) {
                return Promise.reject(`The envName "${value}" already exist.`);
              } else {
                return Promise.resolve();
              }
            },
          }),
        ],
        tooltip: `Custom environment name.`,
      },
      {
        key: 'baseEnv',
        label: 'Copy From',
        widget: 'select',
        tooltip: `Copy plugin list from an existing environment. Muse template means a blank environment.`,
        options: Object.keys(app.envs),
        required: true,
        order: 15,
      },
    ].filter(Boolean),
  };

  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.addEnvForm', {
    meta,
    app,
    form,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);
  return (
    <Modal
      {...antdModalV5(modal)}
      className="muse-app-manager_home-add-env-modal"
      title={`Add Environment for: ${app.name}`}
      width="600px"
      okText="Create"
      footer={footer}
    >
      <RequestStatus
        loading={addAppEnvPending}
        loadingMode={'container'}
        error={addAppEnvError}
        errorMode={'inline'}
        errorProps={{ title: 'Failed to add env.' }}
      />
      {form.getFieldValue('type') === 'production' ? (
        <Alert
          message="NOTE: after creating the production environment here. Please request the approval in Muse slack channel #muse."
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />
      ) : null}
      <Form
        form={form}
        style={{ marginLeft: '-20px', width: '100%' }}
        onValuesChange={updateOnChange}
      >
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});
