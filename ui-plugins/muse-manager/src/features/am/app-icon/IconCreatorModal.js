import React, { useCallback, useRef } from 'react';
import { Form, Modal } from 'antd';
import _, { reject } from 'lodash';

import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { useMuseApi } from '../../../hooks';
import FormBuilder from 'antd-form-builder';
import museClient from '../../../museClient';
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
  const [form] = Form.useForm();
  const forceUpdate = FormBuilder.useForceUpdate();

  const initialValues = {
    text: initials,
    shape: 'Circle',
    fontFamily: 'Leckerli One',
    fontSize: 70,
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
    // form.validateFields().then(values => {
    //   setEditMode(false);
    //   const canvas = canvasRef.current;
    //   const imgUrl = canvas.toDataURL();
    //   uploadGenerateLogo({ imgUrl, appName }).then(() => {
    //     if (uploadGenerateLogoError) {
    //       message.error('App logo uploading failed!');
    //     } else {
    //       message.success('App logo was uploaded successfully.');
    //       setIconHash(Date.now());
    //       setGenerateLogoModalVisible(false);
    //     }
    //   });
    // });
    // museClient.am.setAppIcon({appName, icon: ''})
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
    // await axios.post(museClient.am.setAppIcon._url, fd, {
    //   headers: {
    //     authorization: window.MUSE_GLOBAL.getUser()?.museSession,
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
  }, [app, setAppIcon]);

  const iconOptions = Object.assign({}, initialValues, form.getFieldsValue());

  return (
    <Modal
      {...antdModal(modal)}
      title="Create App Icon"
      width="800px"
      destroyOnClose
      maskClosable={false}
      okText="Update"
      onOk={handleSaveGeneratedLogo}
    >
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
