import React, { useCallback, useState } from 'react';
import { Modal } from 'antd';

import NiceModal, { antdModal, useModal } from '@ebay/nice-modal-react';
import WidgetExplorer from './WidgetExplorer';
import WidgetDetail from './WidgetDetail';
import './AddWidgetModal.less';

export default NiceModal.create(function AddWidgetModal({ appId, onAdd = () => {} }) {
  const modal = useModal();
  const [widget, setWidget] = useState(null);
  const handleWidgetChange = useCallback((item) => {
    setWidget(item);
  }, []);

  const handleAdd = useCallback(() => {
    modal.resolve(widget);
    modal.hide();
  }, [widget, modal]);
  return (
    <Modal
      {...antdModal(modal)}
      className="muse-dashboard_add-widget-modal"
      maskClosable={false}
      title="Add a Widget"
      width="800px"
      okText="Add"
      okButtonProps={{ disabled: !widget }}
      onOk={handleAdd}
      destroyOnClose
    >
      <div className="widget-select-main-content">
        <div className="widgets-explorer">
          <WidgetExplorer onChange={handleWidgetChange} />
        </div>
        <div className="widget-detail">
          {widget ? (
            <WidgetDetail widget={widget} />
          ) : (
            <>
              <h2>Add Widget</h2>
              <p>Please select a widget from the left widget explorer.</p>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
});
