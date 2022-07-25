import { useCallback } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import FormBuilder from 'antd-form-builder';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseApi, useMuse, usePollingMuseData } from '../../hooks';
import { getPluginId } from '../../utils';
import VersionSelect from './VersionSelect';
import semver from 'semver';

const BuildPluginModal = NiceModal.create(({ plugin }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus('muse.requests');
  const { data: latestReleases } = usePollingMuseData('muse.plugins.latest-releases');

  const {
    action: createRequest,
    error: createRequestError,
    pending: createRequestPending,
  } = useMuseApi('req.createRequest');

  const { data: branches, error: fetchBranchesError, pending: fetchBranchesPending } = useMuse(
    'ebay.git.getBranches',
    plugin.repo
      ?.split('/')
      .slice(0, 2)
      .join('/'),
  );

  const modalReady = branches && latestReleases;

  const latestVersion = latestReleases[plugin.name]?.version;
  const meta = {
    columns: 1,
    elements: [
      {
        key: 'pluginName',
        label: 'Plugin name',
        viewMode: true,
        initialValue: plugin.name,
      },
      {
        key: 'currentVersion',
        label: 'Current Version',
        viewMode: true,
        initialValue: latestVersion,
      },
      {
        key: 'version',
        label: 'New version',
        widget: VersionSelect,
        initialValue: latestVersion ? semver.inc(latestVersion, 'patch') : '1.0.0',
        widgetProps: {
          baseVersion: latestVersion || '1.0.0',
        },
        tooltip: `The version number is automatically generated according to the Semantic Versioning,
            if it already exists, it can only be customized`,
        rules: [
          () => ({
            validator(rule, value) {
              if (!semver.valid(value)) {
                return Promise.reject(
                  new Error(`Invalid version. A normal version number must take the form X.Y.Z. or
                a pre-release version by appending a hyphen and a identifier(named 'alpha', 'beta' or 'rc')
                immediately following the patch version.`),
                );
              }
              return Promise.resolve();
            },
          }),
        ],
      },
      {
        key: 'branch',
        label: 'Branch to build',
        widget: 'select',
        widgetProps: {
          disabled: !branches,
          loading: !branches,
          placeholder: !branches ? 'Loading...' : 'Select the branch',
        },
        required: true,
        options: branches?.map(b => b.name).sort((a, b) => a.localeCompare(b)),
        initialValue: 'main',
      },
      // {
      //   key: 'autoDeploy',
      //   label: 'Auto Deploy',
      //   widget: 'checkbox',
      // },
    ],
  };

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    createRequest({
      id: `build-plugin_${getPluginId(plugin.name)}`,
      type: 'build-plugin',
      msg: `Build plugin ${plugin.name}`,
      payload: {
        pluginName: plugin.name,
        buildBranch: values.branch || 'main',
        newVersion: values.version,
      },
    })
      .then(async () => {
        modal.hide();
        message.success('Trigger build success.');
        await syncStatus();
      })
      .catch(err => {
        console.log('failed to deploy', err);
      });
  }, [createRequest, plugin.name, syncStatus, modal, form]);

  return (
    <Modal
      {...antdModal(modal)}
      title={`Build Plugin`}
      width="600px"
      okText="Build"
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
      okButtonProps={{
        disabled: !modalReady,
      }}
    >
      <RequestStatus error={fetchBranchesError} errorArgs={{ title: 'Failed to fetch branches' }} />
      <RequestStatus loading={createRequestPending} error={createRequestError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish}>
        <FormBuilder form={form} meta={meta} />
      </Form>
    </Modal>
  );
});

export default BuildPluginModal;
