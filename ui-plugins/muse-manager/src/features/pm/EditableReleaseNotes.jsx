import { useCallback, useState } from 'react';
import { Button, Input, message, Form } from 'antd';
import { EditTwoTone, InfoCircleOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useAbility, useMuseMutation, useSyncStatus } from '../../hooks';

const EditableReleaseNotes = ({ release, plugin }) => {
  const [releaseObj, setReleaseObj] = useState(release);
  const { description: releaseNotes, pluginName, version } = releaseObj || {};
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState([]);
  const ability = useAbility();
  const [form] = Form.useForm();
  const editedDescription = Form.useWatch('editedDescription', form) || releaseNotes;
  const canEditRelease = ability.can('update', 'Plugin', plugin);
  const syncStatus = useSyncStatus(`muse.plugin-releases.${plugin.name}`);

  const {
    mutateAsync: updateRelease,
    error: updateReleaseError,
    isLoading: updateReleasePending,
    reset,
  } = useMuseMutation('pm.updateRelease');

  const handleSave = (e) => {
    // Call the onSave function passed as a prop to save the updated description
    updateRelease({
      pluginName: pluginName,
      version,
      changes: {
        set: [
          {
            path: 'description',
            value: editedDescription,
          },
        ],
      },
    })
      .then(async () => {
        message.success('Update release notes success.');
        setEditing(false);
        setReleaseObj({ ...release, description: editedDescription });
        syncStatus();
      })
      .catch((err) => {
        message.error(`Failed to update: ${err.message}`);
      });
  };

  const handleCancel = () => {
    // remove updateReleaseError
    reset();
    // Reset the form fields
    form.resetFields();
    setEditing(false);
  };

 const handleValueChange = useCallback(() => {
  form.validateFields(['editedDescription']).catch(() => {
    setErrors(form.getFieldError('editedDescription'));
  })
 }, []);

  return (
    <div className="mb-2">
      <RequestStatus error={updateReleaseError} loading={updateReleasePending} />
      {!editing ? (
        <div className="pl-4 max-h-[300px] overflow-y-auto">
          <div className="[&>ul]:pl-0">
            {editedDescription ? (
              <ReactMarkdown>{editedDescription}</ReactMarkdown>
            ) : (
              <p className="italic text-gray-400">No release notes provided.</p>
            )}
          </div>
          {canEditRelease && (
            <EditTwoTone
              className="cursor-pointer"
              span="Edit Release Notes"
              onClick={() => {
                setEditing(true);
              }}
            />
          )}
        </div>
      ) : (
        <Form form={form} onValuesChange={handleValueChange} className="pl-1">
          <p className=" text-zinc-400 mb-1"><InfoCircleOutlined />{' '}Markdown is supported</p>
          <Form.Item
            className="mb-0"
            name="editedDescription"
            initialValue={releaseNotes}
            rules={[{ max: 2000, message: 'Release notes cannot exceed 2000 characters.' }]}
          >
            <Input.TextArea autoSize={false} showCount count={{ max: 2000 }} rows={10}  />
          </Form.Item>
          <div className="mt-2">
            <Button
              onClick={handleSave}
              type="primary"
              className="mr-2"
              disabled={releaseNotes?.trim() === editedDescription?.trim() || !editedDescription || errors.length > 0}
            >
              Save
            </Button>
            <Button onClick={handleCancel} type="default">
              Cancel
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default EditableReleaseNotes;
