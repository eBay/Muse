import React, { useCallback } from 'react';
import { Form, Modal, message } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import _ from 'lodash';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import useStorage from '../hooks/useStorage';

const NewDashboardModal = NiceModal.create(
  ({ currentLayout, dashboardList, defaultLayout, dashboardKey }) => {
    const [form] = Form.useForm();
    const modal = useModal();

    const {
      action: saveDashboard,
      pending: saveDashboardPending,
      error: saveDashboardError,
    } = useStorage('saveDashboard');

    const onOk = useCallback(
      (evt) => {
        if (evt && evt.preventDefault) evt.preventDefault();
        form.validateFields().then(async (values) => {
          let layout = currentLayout;
          switch (values.layout) {
            case 'Empty':
              layout = [];
              break;
            case 'Default':
              layout = [];
              break;
            default:
              break;
          }
          await saveDashboard(dashboardKey, values.name, layout);
          message.success('Dashboard created.');
          modal.resolve(values);
          modal.hide();
        });
      },
      [modal, form, currentLayout, dashboardKey, saveDashboard],
    );
    const formMeta = {
      fields: [
        {
          key: 'name',
          label: 'Name',
          widget: 'input',
          required: true,
          rules: [
            {
              validator: (rule, name) => {
                console.log('dashboardList: ', dashboardList);
                if (_.find(dashboardList, { name })) {
                  return Promise.reject(new Error(`Dashboard name already exists.`));
                }
                return Promise.resolve();
              },
            },
          ],
        },
        {
          key: 'layout',
          label: 'Layout',
          widget: 'radio-group',
          options: ['Clone Current', 'Empty', 'Default'],
          tooltip: 'Whether to clone the current dashboard layout or an empty dashboard.',
          initialValue: 'Clone Current',
        },
      ],
    };

    return (
      <Modal
        {...antdModal(modal)}
        className="muse-dashboard_new-dashboard-modal"
        title={`New Dashboard`}
        width="600px"
        onOk={onOk}
      >
        <RequestStatus pending={saveDashboardPending} error={saveDashboardError} />
        <Form form={form} onFinish={onOk}>
          <NiceForm meta={formMeta} />
        </Form>
      </Modal>
    );
  },
);
export default NewDashboardModal;
