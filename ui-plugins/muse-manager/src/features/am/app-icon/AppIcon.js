import React, { useState, useCallback } from 'react';
import { Button, Modal, Upload, message, Tooltip } from 'antd';
import { Loading3QuartersOutlined, UploadOutlined, EditOutlined } from '@ant-design/icons';
import _ from 'lodash';
import './style.less';
import defaultIcon from './defaultIcon.png';
import { useSyncStatus } from '../../../hooks';
// import pmApi from '../../pmApi';

function beforeUpload(file) {
  const is = file.type === 'image/png';
  if (!is) {
    message.error('You can only upload PNG image.');
  }
  const isLt2M = file.size < 50000;
  if (!isLt2M) {
    message.error('Image must smaller than 50KB.');
  }
  return is && isLt2M;
}

export default function AppIcon({ app, form }) {
  const syncApp = useSyncStatus(`muse.app.${app.name}`);
  console.log(app);
  const initials = _.words(app.title || app.name)
    .slice(0, 2)
    .map(s => s[0])
    .join('');

  const [uploading, setUploading] = useState(false);

  // const { iconHash, setIconHash } = useSetIconHash(1);

  const handleUploadChange = useCallback(() => null, []);
  // info => {
  //   if (info.file.status === 'uploading') {
  //     setUploading(true);
  //     return;
  //   }
  //   if (info.file.status === 'done') {
  //     setUploading(false);
  //     setIconHash(Date.now());
  //     message.success('App logo was updated successfully.');
  //   }
  //   if (info.file.status === 'error') {
  //     setUploading(false);
  //     Modal.error({
  //       title: 'Failed to change icon',
  //       content: _.get(info.file, 'error.message', 'Unexpected exception'),
  //     });
  //   }
  // },
  // [setUploading, setIconHash],
  const imgUrl = app.iconId
    ? `${window.MUSE_GLOBAL.cdn}/p/app-icon.${app.name}/v0.0.${app.iconId}/dist/icon.png`
    : defaultIcon;
  return (
    <div className="grid grid-cols-6 gap-4 max-w-[200px] min-w-[100px]">
      <div className="col-span-5 row-span-2">
        <div className="hidden">
          <span className="font-loader-f1">a</span>
          <span className="font-loader-f2">a</span>
          <span className="font-loader-f3">a</span>
          <span className="font-loader-f4">a</span>
          <span className="font-loader-f5">a</span>
        </div>
        {uploading ? (
          <Loading3QuartersOutlined spin className="spinner" />
        ) : (
          <img src={imgUrl} alt="App icon" className="aspect-square w-full" />
        )}
      </div>
      <div className="self-end">
        <Upload
          name="icon"
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
  );
}
