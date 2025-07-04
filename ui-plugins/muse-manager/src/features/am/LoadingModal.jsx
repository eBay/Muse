import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal } from 'antd';
import { Loading3QuartersOutlined } from '@ant-design/icons';
const LoadingModal = NiceModal.create(({ title = 'Please wait', message }) => {
  const modal = useModal();
  return (
    <Modal {...antdModalV5(modal)} closable={false} footer={null} title={title}>
      <Loading3QuartersOutlined spin />
      <span className="ml-2">{message}</span>
    </Modal>
  );
});
export default LoadingModal;
