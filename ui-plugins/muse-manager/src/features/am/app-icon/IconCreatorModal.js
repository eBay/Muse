import React, { useCallback, useRef } from 'react';
import { Form, Modal, message } from 'antd';
import _ from 'lodash';

import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useMuseApi, useSyncStatus } from '../../../hooks';
import FormBuilder from 'antd-form-builder';

import IconCanvas from './IconCanvas';
import ColorPicker from './ColorPicker';

export default NiceModal.create(({ app }) => {
  const modal = useModal();
  const initials = _.words(app.title || app.name)
    .slice(0, 2)
    .map(s => s[0])
    .join('');

  const { action: setAppIcon, error: setAppIconError, pending: setAppIconPending } = useMuseApi(
    'am.setAppIcon',
  );
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  const [form] = Form.useForm();
  const forceUpdate = FormBuilder.useForceUpdate();

  const initialValues = {
    text: initials,
    shape: 'Circle',
    fontFamily: 'Leckerli One',
    fontSize: 60,
    fontColor: '#ffffff',
    backgroundColor: '#00B4D8',
  };

  const meta = {
    formItemLayout: [14, 10],
    columns: 2,
    initialValues,
    fields: [
      {
        key: 'text',
        label: 'Text',
        required: true,
      },
      {
        key: 'shape',
        label: 'Shape',
        widget: 'select',
        options: ['Circle', 'Square', 'Rounded'],
        required: true,
      },
      {
        key: 'fontFamily',
        label: 'Font Family',
        widget: 'select',
        options: [
          'Aclonica',
          'Asap',
          'Leckerli One',
          'Lemonada',
          'Niconne',
          'Arial',
          'Times New Roman',
          'Verdana',
          'Courier New',
        ],
        required: true,
      },
      {
        key: 'fontSize',
        label: 'Font Size',
        required: true,
        widgetProps: { type: 'number' },
      },

      {
        key: 'fontColor',
        label: 'Font Color',
        widget: ColorPicker,
        forwardRef: true,
        required: true,
      },
      {
        key: 'backgroundColor',
        label: 'Background Color',
        widget: ColorPicker,
        forwardRef: true,
        required: true,
      },
    ],
  };
  const canvasRef = useRef();
  const handleOnLoad = useCallback(c => {
    canvasRef.current = c;
  }, []);

  const handleSaveGeneratedLogo = useCallback(async () => {
    const fd = new FormData();
    const iconBlob = await new Promise((resolve, reject) => {
      canvasRef.current.toBlob(b => {
        if (b) resolve(b);
        reject();
      });
    });
    fd.append('appName', app.name);
    fd.append('icon', iconBlob);
    await setAppIcon(fd);
    modal.hide();
    message.success('Update app icon success.');
    await syncStatus();
  }, [app, setAppIcon, syncStatus, modal]);

  const iconOptions = Object.assign({}, initialValues, form.getFieldsValue());

  return (
    <Modal
      {...antdModal(modal)}
      title="Create App Icon"
      width="800px"
      destroyOnClose
      maskClosable={false}
      okText={setAppIconPending ? 'Updating' : 'Update'}
      onOk={handleSaveGeneratedLogo}
    >
      <RequestStatus loading={setAppIconPending} error={setAppIconError} />

      <div className="flex">
        <div className="flex-none translate-x-5">
          <IconCanvas options={iconOptions} onLoad={handleOnLoad} />
        </div>

        <div className="grow">
          <Form
            form={form}
            style={{ marginLeft: '-20px', width: '100%' }}
            onValuesChange={forceUpdate}
          >
            <FormBuilder meta={meta} form={form} />
          </Form>
        </div>
      </div>
    </Modal>
  );
});
