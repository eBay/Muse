import { useState } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, Form } from 'antd';
import FormBuilder from 'antd-form-builder';
import MultiPluginSelector from './MultiPluginSelector';
import _ from 'lodash';
import jsPlugin from 'js-plugin';

const PreviewModal = NiceModal.create(({ app }) => {
  const { envs } = app || {};
  const envNames = Object.keys(envs || {});
  const [form] = Form.useForm();
  const modal = useModal();
  const forceUpdate = FormBuilder.useForceUpdate();
  const [deployedPlugins, setDeployedPlugins] = useState(
    app.envs[Object.keys(app.envs)[0]].plugins,
  );
  const {
    hooks: { useMuseData },
  } = jsPlugin.getPlugin('@ebay/muse-manager').exports || {};
  const { data: allPlugins } = useMuseData('muse.plugins');

  const meta = {
    formItemLayout: [6, 18],
    elements: [
      {
        key: 'environment',
        label: 'Environment',
        widget: 'radio-group',
        options: envNames,
        initialValue: envNames?.[0],
        required: true,
        widgetProps: {
          onChange: e => {
            const deployedPlugins = envs?.[e.target.value]?.plugins || [];
            const selectedRemovedPlugins = form.getFieldValue('pluginsToRemove');
            setDeployedPlugins(deployedPlugins);
            form.setFieldsValue({
              pluginsToRemove: selectedRemovedPlugins.filter(name =>
                deployedPlugins.find(d => d.name === name),
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
        options: deployedPlugins?.map(p => ({ value: p.name, label: p.name })),
      },
      {
        key: 'link',
        label: 'Preview Link',
        viewMode: true,
        tooltip: 'Use this link to load specified versions of plugins',
        renderView: () => {
          const {
            pluginToAdd,
            environment = envNames?.[0],
            pluginsToRemove,
          } = form.getFieldsValue();
          if (!pluginToAdd?.length && !pluginsToRemove?.length && !environment) return 'N/A';
          const forcePlugins = (pluginToAdd || []).concat(
            pluginsToRemove?.map(pName => ({ name: pName, version: null })) || [],
          );
          const host =
            'https://' +
            _.castArray(envs?.[environment].url)[0] +
            `?clientCode=${window.MUSE_GLOBAL.museClientCode}&forcePlugins=` +
            forcePlugins
              .map(({ name, version }) => {
                const type = allPlugins?.find(p => p.name === name)?.type;
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

  return (
    <Modal
      {...antdModal(modal)}
      className="plugin-manager-ebay_preview-modal"
      title={`Preview Link Generator`}
      maskClosable={false}
      width="880px"
      okText="Close"
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <p className="p-5 bg-gray-50 text-neutral-500">
        If you want to verify a release (usually for new release) manually, or send other for
        review, you can use the generated link to load plugins with specific versions.
      </p>
      <Form layout="horizontal" form={form} onValuesChange={forceUpdate}>
        <FormBuilder form={form} meta={meta} />
      </Form>
    </Modal>
  );
});

export default PreviewModal;
