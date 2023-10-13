import React from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal } from 'antd';
import { Loading3QuartersOutlined } from '@ant-design/icons';

const LoadingModal = NiceModal.create(({ title = 'Please wait', icon, message }) => {
  const modal = useModal();
  return (
    <Modal {...antdModalV5(modal)} closable={false} footer={null} title={title}>
      {icon || <Loading3QuartersOutlined spin />}
      <span className="ml-2">{message}</span>
    </Modal>
  );
});
export default LoadingModal;
