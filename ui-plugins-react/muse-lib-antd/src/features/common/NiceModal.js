import React, { useState, useCallback } from 'react';
import { Modal } from 'antd';
import { useSetNiceModalVisible } from './redux/hooks';

const noop = () => {};
/*
  NiceModal is a wrapper of antd Modal.
    - It connects to redux store for visibility of the modal.
    - Easy to show/hide modal inside/outside of modal.
    - It ensures animation for show/hide.
 */
export default function NiceModal({
  children,
  id,
  forceVisible,
  onClose = noop,
  loading,
  noCancelButton = false,
  noOkButton = false,
  loadingText = 'Loading...',
  okText = 'Ok',
  ...rest
}) {
  // Visible state is used to ensure animation when close modal
  const [visible, setVisible] = useState(true);
  const hideModal = useCallback(() => setVisible(false), []);

  const { setVisible: setNiceModalVisible, visible: niceModalVisible } = useSetNiceModalVisible(id);
  // Close modal means set it invisible in the redux store to return null
  const closeModal = useCallback(() => {
    setNiceModalVisible(false);
    onClose();
  }, [setNiceModalVisible, onClose]);

  const okButtonProps = { loading, disabled: loading };
  if (noOkButton) okButtonProps.style = { display: 'none' };
  const cancelButtonProps = { disabled: loading };
  if (noCancelButton) cancelButtonProps.style = { display: 'none' };

  return forceVisible || niceModalVisible ? (
    <Modal
      visible={visible}
      afterClose={closeModal}
      className="muse-antd_common-nice-modal"
      onCancel={hideModal}
      onOk={hideModal}
      maskClosable={false}
      title="Nice Modal"
      width="800px"
      okText={loading ? loadingText : okText}
      destroyOnClose
      okButtonProps={okButtonProps}
      cancelButtonProps={cancelButtonProps}
      {...rest}
    >
      {children}
    </Modal>
  ) : null;
}

NiceModal.withModal = (modalId, Comp) => {
  return props => {
    const { modalArgs = {}, visible } = useSetNiceModalVisible(modalId);
    if (!visible) return null;
    return <Comp {...modalArgs} {...props} />;
  };
};

NiceModal.withNiceModal = NiceModal.withModal; // deprecated

NiceModal.useModal = modalId => {
  const { visible, setVisible } = useSetNiceModalVisible(modalId);
  const show = useCallback(args => setVisible(true, args), [setVisible]);
  const hide = useCallback(() => setVisible(false), [setVisible]);
  return { visible, setVisible, show, hide };
};
