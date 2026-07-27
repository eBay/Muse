import { useCallback, useState } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Form, Input, Button, Select, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseMutation, useMuseQuery } from '../../hooks';

const CreateMspModal = NiceModal.create(() => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus('muse.msp');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const { mutateAsync: addPreset } = useMuseMutation('msp.addPreset');
  const { data: mspData } = useMuseQuery('msp.getMsp');

  const existingPresets = mspData ? Object.keys(mspData) : [];

  const handleFinish = useCallback(
    async (values) => {
      setPending(true);
      setError(null);
      const versions = {};
      (values.packages || []).forEach(({ pkg, version }) => {
        if (pkg && version) versions[pkg] = version;
      });
      const preset = {};
      if (values.extends) preset.extends = values.extends;
      if (values.description) preset.description = values.description;
      if (Object.keys(versions).length > 0) preset.versions = versions;

      try {
        await addPreset({ name: values.name, preset });
        modal.hide();
        modal.resolve();
        message.success(`Preset "${values.name}" created.`);
        await syncStatus();
      } catch (err) {
        setError(err);
      } finally {
        setPending(false);
      }
    },
    [addPreset, syncStatus, modal],
  );

  return (
    <Modal
      {...antdModalV5(modal)}
      title={pending ? 'Creating...' : 'Create MSP Preset'}
      width="640px"
      okText="Create"
      closable={{ mask: false }}
      onOk={() => form.validateFields().then(() => form.submit())}
    >
      <RequestStatus loading={pending} error={error} />
      <Form layout="horizontal" form={form} onFinish={handleFinish} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item
          name="name"
          label="Preset Name"
          required
          rules={[
            { required: true, message: 'Preset name is required.' },
            { pattern: /^[\w-]+$/, message: 'Only letters, numbers, underscores, hyphens.' },
          ]}
        >
          <Input placeholder="e.g. msp2606" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Optional description" />
        </Form.Item>

        <Form.Item name="extends" label="Extends">
          <Select allowClear placeholder="No parent preset" options={existingPresets.map((p) => ({ label: p, value: p }))} />
        </Form.Item>

        <Form.Item label="Packages">
          <Form.List name="packages">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 4 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'pkg']}
                      rules={[{ required: true, message: 'Package name required.' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="@scope/package-name" style={{ width: 260 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'version']}
                      rules={[{ required: true, message: 'Version required.' }]}
                      style={{ marginBottom: 0 }}
                    >
                      <Input placeholder="e.g. 1.2.3" style={{ width: 120 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} style={{ color: '#ff4d4f' }} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} size="small">
                  Add Package
                </Button>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Modal>
  );
});

export default CreateMspModal;
