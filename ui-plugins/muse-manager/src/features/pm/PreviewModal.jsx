import { useState } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, Form, Alert } from 'antd';
import utils from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';
import MultiPluginSelector from './MultiPluginSelector';
import _ from 'lodash';
import jsPlugin from 'js-plugin';

const PreviewModal = NiceModal.create(({ app }) => {
  const { envs } = app || {};
  const envNames = Object.keys(envs || {});
  const [form] = Form.useForm();
  const modal = useModal();
  const [deployedPlugins, setDeployedPlugins] = useState(
    app.envs[Object.keys(app.envs)[0]].plugins,
  );
  const {
    hooks: { useMuseData },
  } = jsPlugin.getPlugin('@ebay/muse-manager').exports || {};
  const { data: allPlugins } = useMuseData('muse.plugins');

  const meta = {
    formItemLayout: [6, 18],
    fields: [
      {
        key: 'environment',
        label: 'Environment',
        widget: 'radio-group',
        options: envNames,
        initialValue: envNames?.[0],
        required: true,
        widgetProps: {
          onChange: (e) => {
            const deployedPlugins = envs?.[e.target.value]?.plugins || [];
            const selectedRemovedPlugins = form.getFieldValue('pluginsToRemove');
            setDeployedPlugins(deployedPlugins);
            form.setFieldsValue({
              pluginsToRemove: selectedRemovedPlugins.filter((name) =>
                deployedPlugins.find((d) => d.name === name),
              ),
            });
          },
        },
      },
      {
        key: 'pluginToAdd',
        label: 'Plugins to specify',
        widget: MultiPluginSelector,
        widgetProps: {
          app,
        },
      },
      {
        key: 'pluginsToRemove',
        label: 'Plugins to exclude',
        widget: 'select',
        placeholder: 'Select which plugins to remove',
        widgetProps: { mode: 'multiple', allowClear: true },
        options: deployedPlugins?.map((p) => ({ value: p.name, label: p.name })),
      },
      {
        key: 'link',
        label: 'Preview Link',
        viewMode: true,
        tooltip: 'Use this link to load specified versions of plugins',
        viewWidget: () => {
          const {
            pluginToAdd,
            environment = envNames?.[0],
            pluginsToRemove,
          } = form.getFieldsValue();
          if (!pluginToAdd?.length && !pluginsToRemove?.length && !environment) return 'N/A';
          const forcePlugins = (pluginToAdd || []).concat(
            pluginsToRemove?.map((pName) => ({ name: pName, version: null })) || [],
          );
          const host =
            'https://' +
            _.castArray(envs?.[environment].url)[0] +
            `?clientCode=${window.MUSE_GLOBAL.museClientCode}&forcePlugins=` +
            forcePlugins
              .map(({ name, version }) => {
                const type = allPlugins?.find((p) => p.name === name)?.type;
                return `${name}!${type}@${version}`;
              })
              .join(';');
          return (
            <a
              href={host}
              target="_blank"
              rel="noreferrer"
              style={{ lineHeight: 1.2, display: 'inline-block', marginTop: 12 }}
            >
              {host}
            </a>
          );
        },
      },
    ],
  };
  utils.extendFormMeta(meta, 'museManager.previewModalForm', {
    meta,
    form,
    app,
  });
  const updateOnChange = NiceForm.useUpdateOnChange('*');
  return (
    <Modal
      {...antdModalV5(modal)}
      className="plugin-manager-ebay_preview-modal"
      title={`Preview Link Generator`}
      maskClosable={false}
      width="880px"
      okText="Close"
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <div style={{ display: 'flex', rowGap: '30px', flexFlow: 'column wrap' }}>
        <Alert
          message="If you want to verify a release (usually for new release) manually, or send other for
          review, you can use the generated link to load plugins with specific versions."
          type="info"
        />
        <Form layout="horizontal" form={form} onValuesChange={updateOnChange}>
          <NiceForm meta={meta} />
        </Form>
      </div>
    </Modal>
  );
});

export default PreviewModal;
