import React, { useState, useCallback } from 'react';
import { Button, Modal, Upload, message, Tooltip, Spin } from 'antd';
import { UploadOutlined, EditOutlined } from '@ant-design/icons';
import _ from 'lodash';
import './style.less';
import defaultIcon from './defaultIcon.png';
import { useSyncStatus } from '../../../hooks';
// import pmApi from '../../pmApi';

function beforeUpload(file) {
  if (file.type !== 'image/png') {
    message.error('You can only upload PNG image.');
    return false;
  }

  if (file.size > 50000) {
    message.error('Image must smaller than 50KB.');
    return false;
  }
  return true;
}

export default function AppIcon({ app, form }) {
  const syncApp = useSyncStatus(`muse.app.${app.name}`);

  const initials = _.words(app.title || app.name)
    .slice(0, 2)
    .map(s => s[0])
    .join('');

  const [uploading, setUploading] = useState(false);

  const handleUploadChange = useCallback(
    info => {
      if (info.file.status === 'uploading') {
        setUploading(true);
        return;
      }
      if (info.file.status === 'done') {
        syncApp().then(() => {
          message.success('App icon was changed successfully.');
          setUploading(false);
        });
      }
      if (info.file.status === 'error') {
        setUploading(false);
        Modal.error({
          title: 'Failed to change icon',
          content: _.get(info.file, 'error.message', 'Unexpected exception'),
        });
      }
    },
    [setUploading, syncApp],
  );
  const imgUrl = app.iconId
    ? `${window.MUSE_GLOBAL.cdn}/p/app-icon.${app.name}/v0.0.${app.iconId}/dist/icon.png`
    : defaultIcon;
  return (
    <>
      <div className="hidden">
        <span className="font-['Leckerli_One']">a</span>
        <span className="font-['Aclonica']">a</span>
        <span className="font-['Asap']">a</span>
        <span className="font-['Lemonada']">a</span>
        <span className="font-['Niconne']">a</span>
      </div>

      <div className="grid grid-cols-6 gap-4 max-w-[200px] min-w-[100px]">
        <div className="col-span-5 row-span-2 aspect-square p-2">
          {uploading ? (
            <div className="grid h-full w-full content-center bg-slate-100">
              <Spin tip="Uploading..." />
            </div>
          ) : (
            <img src={imgUrl} alt="App icon" className="w-full" />
          )}
        </div>
        <div className="self-end">
          <Upload
            name="icon"
            action={`http://localhost:6070/api/v2/am/set-app-icon`}
            headers={{
              authorization: window.MUSE_GLOBAL.getUser().museSession,
            }}
            data={{ appName: app.name }}
            className="logo-uploader"
            showUploadList={false}
            beforeUpload={beforeUpload}
            onChange={handleUploadChange}
          >
            <Tooltip title="Upload a new icon.">
              <Button shape="circle">
                <UploadOutlined />
              </Button>
            </Tooltip>
          </Upload>
        </div>
        <div>
          <Tooltip title="Generate a new icon online.">
            <Button
              onClick={() => {
                // setGenerateLogoModalVisible(true);
              }}
              shape="circle"
            >
              <EditOutlined />
            </Button>
          </Tooltip>
        </div>
      </div>
    </>
  );
}
