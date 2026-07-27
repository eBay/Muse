import { useCallback, useState } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Form, Input, Button, Select, Space } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseMutation, useMuseQuery } from '../../hooks';

const EditMspModal = NiceModal.create(({ preset }) => {
  const modal = useModal();
  const syncStatus = useSyncStatus('muse.msp');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const { mutateAsync: deletePreset } = useMuseMutation('msp.deletePreset');
  const { mutateAsync: addPreset } = useMuseMutation('msp.addPreset');
  const { data: mspData } = useMuseQuery('msp.getMsp');

  const existingPresets = mspData
    ? Object.keys(mspData).filter((p) => p !== preset.name)
    : [];

  // Convert raw versions map to list for Form.List, using own-versions only (not inherited)
  // We fetch raw versions from mspData directly to avoid showing inherited ones
  const rawPreset = mspData?.[preset.name] || preset;
  const ownVersions = rawPreset.versions
    ? Object.entries(rawPreset.versions).map(([pkg, version]) => ({ pkg, version }))
    : [];

  const initialValues = {
    description: rawPreset.description || '',
    extends: rawPreset.extends || undefined,
    packages: ownVersions,
  };

  const [form] = Form.useForm();

  const handleFinish = useCallback(
    async (values) => {
      setPending(true);
      setError(null);

      const versions = {};
      (values.packages || []).forEach(({ pkg, version }) => {
        if (pkg && version) versions[pkg] = version;
      });

      const updatedPreset = {
        creation: rawPreset.creation,
        author: rawPreset.author,
      };
      if (values.extends) updatedPreset.extends = values.extends;
      if (values.description) updatedPreset.description = values.description;
      if (Object.keys(versions).length > 0) updatedPreset.versions = versions;

      try {
        // Delete then recreate to update the preset
        await deletePreset({ name: preset.name });
        await addPreset({ name: preset.name, preset: updatedPreset });
        modal.hide();
        modal.resolve();
        message.success(`Preset "${preset.name}" updated.`);
        await syncStatus();
      } catch (err) {
        setError(err);
      } finally {
        setPending(false);
      }
    },
    [deletePreset, addPreset, syncStatus, modal, preset.name, rawPreset],
  );

  return (
    <Modal
      {...antdModalV5(modal)}
      title={pending ? 'Saving...' : `Edit MSP Preset: ${preset.name}`}
      width="640px"
      okText="Save"
      closable={{ mask: false }}
      onOk={() => form.validateFields().then(() => form.submit())}
    >
      <RequestStatus loading={pending} error={error} />
      <Form
        layout="horizontal"
        form={form}
        initialValues={initialValues}
        onFinish={handleFinish}
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
      >
        <Form.Item label="Preset Name">
          <Input value={preset.name} disabled />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} placeholder="Optional description" />
        </Form.Item>

        <Form.Item name="extends" label="Extends">
          <Select
            allowClear
            placeholder="No parent preset"
            options={existingPresets.map((p) => ({ label: p, value: p }))}
          />
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

export default EditMspModal;
