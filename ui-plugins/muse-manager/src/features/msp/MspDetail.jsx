import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Modal,
  message,
  Tag,
  Select,
  Form,
  Input,
  Space,
  Descriptions,
  Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, ArrowLeftOutlined, SyncOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { usePollingMuseQuery, useMuseMutation, useSyncStatus } from '../../hooks';

function PackageEditModal({ visible, record, onSave, onCancel, pending }) {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSave(values);
    });
  };

  return (
    <Modal
      open={visible}
      title={record ? `Edit Package: ${record.pkg}` : 'Add Package'}
      okText="Save"
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={pending}
      maskClosable={false}
    >
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={record || {}}
        key={record?.pkg || '__new__'}
      >
        <Form.Item
          name="pkg"
          label="Package Name"
          rules={[{ required: true, message: 'Package name is required.' }]}
        >
          <Input placeholder="@scope/package-name" disabled={!!record} />
        </Form.Item>
        <Form.Item
          name="version"
          label="Version"
          rules={[{ required: true, message: 'Version is required.' }]}
        >
          <Input placeholder="e.g. 1.2.3" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default function MspDetail() {
  const { name } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: mspData, error } = usePollingMuseQuery('msp.getMsp');
  const syncStatus = useSyncStatus('muse.msp');
  const { mutateAsync: deletePreset } = useMuseMutation('msp.deletePreset');
  const { mutateAsync: addPreset } = useMuseMutation('msp.addPreset');
  const { mutateAsync: syncLatest } = useMuseMutation('msp.syncLatest');

  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [savePending, setSavePending] = useState(false);
  const [syncPending, setSyncPending] = useState(false);

  const refetchMspData = useCallback(
    () => queryClient.refetchQueries({ queryKey: ['muse-query', 'msp.getMsp'], exact: true }),
    [queryClient],
  );

  const handleSyncLatest = async () => {
    setSyncPending(true);
    try {
      await syncLatest({ name, registry: 'https://npm.corp.ebay.com' });
      await refetchMspData();
      message.success('Packages synced to latest versions.');
    } catch (err) {
      message.error(err.message || 'Failed to sync latest packages.');
    } finally {
      setSyncPending(false);
    }
  };

  const preset = mspData?.[name];
  const ownVersions = preset?.versions || {};
  const packageList = Object.entries(ownVersions).map(([pkg, version]) => ({ pkg, version }));
  const allMspNames = mspData ? Object.keys(mspData).sort() : [];

  const persistPreset = useCallback(
    async (updatedVersions) => {
      if (!preset) return;
      const updatedPreset = {
        creation: preset.creation,
        author: preset.author,
      };
      if (preset.extends) updatedPreset.extends = preset.extends;
      if (preset.description) updatedPreset.description = preset.description;
      if (Object.keys(updatedVersions).length > 0) updatedPreset.versions = updatedVersions;

      await deletePreset({ name });
      await addPreset({ name, preset: updatedPreset });
      await syncStatus();
    },
    [preset, name, deletePreset, addPreset, syncStatus],
  );

  const handleAddPackage = () => {
    setEditingRecord(null);
    setModalVisible(true);
  };

  const handleEditPackage = (record) => {
    setEditingRecord(record);
    setModalVisible(true);
  };

  const handleDeletePackage = async (pkg) => {
    const updatedVersions = { ...ownVersions };
    delete updatedVersions[pkg];
    setSavePending(true);
    try {
      await persistPreset(updatedVersions);
      message.success(`Package "${pkg}" removed.`);
    } catch (err) {
      message.error(err.message || 'Failed to remove package.');
    } finally {
      setSavePending(false);
    }
  };

  const handleSavePackage = async ({ pkg, version }) => {
    const updatedVersions = { ...ownVersions, [pkg]: version };
    setSavePending(true);
    try {
      await persistPreset(updatedVersions);
      message.success(editingRecord ? `Package "${pkg}" updated.` : `Package "${pkg}" added.`);
      setModalVisible(false);
      setEditingRecord(null);
    } catch (err) {
      message.error(err.message || 'Failed to save package.');
    } finally {
      setSavePending(false);
    }
  };

  const columns = [
    {
      dataIndex: 'pkg',
      title: 'Package',
      sorter: (a, b) => a.pkg.localeCompare(b.pkg),
      render: (pkg) => <code>{pkg}</code>,
    },
    {
      dataIndex: 'version',
      title: 'Version',
      width: '160px',
      render: (v) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      dataIndex: 'actions',
      title: 'Actions',
      width: '120px',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditPackage(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title={`Remove package "${record.pkg}"?`}
            okText="Remove"
            okType="danger"
            onConfirm={() => handleDeletePackage(record.pkg)}
          >
            <Button size="small" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const loading = !mspData && !error;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/msp')}
        >
          MSP List
        </Button>
        <Select
          value={name}
          style={{ width: 220 }}
          onChange={(val) => navigate(`/msp/${val}`)}
          options={allMspNames.map((n) => ({ label: n, value: n }))}
          placeholder="Switch MSP..."
          showSearch
        />
      </div>

      <RequestStatus loading={loading} error={!mspData && error} loadingMode="skeleton" />

      {mspData && !preset && (
        <div style={{ color: '#ff4d4f' }}>MSP preset &quot;{name}&quot; not found.</div>
      )}

      {preset && (
        <>
          <Descriptions
            title={<span style={{ fontSize: 18, fontWeight: 600 }}>{name}</span>}
            bordered
            size="small"
            style={{ marginBottom: 24 }}
            column={2}
          >
            <Descriptions.Item label="Description" span={2}>
              {preset.description || <span style={{ color: '#999' }}>—</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Extends">
              {preset.extends ? <Tag color="blue">{preset.extends}</Tag> : <span style={{ color: '#999' }}>—</span>}
            </Descriptions.Item>
            <Descriptions.Item label="Created By">
              {preset.author || <span style={{ color: '#999' }}>—</span>}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>Own Packages ({packageList.length})</h3>
            <Space>
              <Button icon={<SyncOutlined />} loading={syncPending} onClick={handleSyncLatest}>
                Sync Latest
              </Button>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddPackage}>
                Add Package
              </Button>
            </Space>
          </div>

          <Table
            rowKey="pkg"
            columns={columns}
            dataSource={packageList}
            size="middle"
            loading={savePending}
            pagination={{ hideOnSinglePage: true, size: 'small', pageSize: 50 }}
          />

          <PackageEditModal
            visible={modalVisible}
            record={editingRecord}
            pending={savePending}
            onSave={handleSavePackage}
            onCancel={() => {
              setModalVisible(false);
              setEditingRecord(null);
            }}
          />
        </>
      )}
    </div>
  );
}
