import React, { useEffect, useCallback, useState, useRef } from 'react';
import { RequestStatus } from 'muse-antd/features/common';
import { Form, Modal, message, Button } from 'antd';
import FormBuilder from 'antd-form-builder';
import {
  useSetGenerateLogoModalVisible,
  useUploadGenerateLogo,
  useSetIconHash,
} from './redux/hooks';
import { LogoCanvas, ColorPicker } from './';

export default function LogoGenerateModal({ initials, appName }) {
  const [form] = Form.useForm();
  const forceUpdate = FormBuilder.useForceUpdate();
  const { setGenerateLogoModalVisible } = useSetGenerateLogoModalVisible();
  const { setIconHash } = useSetIconHash();
  const {
    uploadGenerateLogo,
    uploadGenerateLogoError,
    uploadGenerateLogoPending,
    dismissUploadGenerateLogoError,
  } = useUploadGenerateLogo();

  useEffect(() => {
    return dismissUploadGenerateLogoError;
  }, [dismissUploadGenerateLogoError]);

  const [editMode, setEditMode] = useState(true);

  const backgroundOptions = ['Circle', 'Square', 'Rounded'];
  const fontFamilyOptions = [
    'Aclonica',
    'Asap',
    'Leckerli One',
    'Lemonada',
    'Niconne',
    'Arial',
    'Times New Roman',
    'Verdana',
    'Courier New',
  ];
  const meta = {
    formItemLayout: [14, 10],
    columns: 2,
    fields: [
      {
        key: 'text',
        label: 'Text',
        initialValue: initials,
        required: true,
      },
      {
        key: 'background',
        label: 'Background',
        widget: 'select',
        options: backgroundOptions,
        required: true,
        initialValue: 'Circle',
      },
      {
        key: 'fontFamily',
        label: 'Font Family',
        widget: 'select',
        options: fontFamilyOptions,
        required: true,
        initialValue: 'Leckerli One',
      },
      {
        key: 'fontSize',
        label: 'Font Size',
        initialValue: '70',
        required: true,
        widgetProps: { type: 'number' },
      },

      {
        key: 'fontColor',
        label: 'Font Color',
        widget: ColorPicker,
        forwardRef: true,
        initialValue: '#FFFFFF',
        required: true,
      },
      {
        key: 'backgroundColor',
        label: 'Background Color',
        widget: ColorPicker,
        forwardRef: true,
        initialValue: '#00B4D8',
        required: true,
      },
    ],
  };
  const canvasRef = useRef();
  const handleOnLoad = useCallback(c => {
    canvasRef.current = c;
  }, []);
  const [visible, setVisible] = useState(true);
  const hideModal = useCallback(() => setVisible(false), []);
  const closeModal = useCallback(() => {
    setGenerateLogoModalVisible(false);
  }, [setGenerateLogoModalVisible]);

  const handleSaveGeneratedLogo = useCallback(() => {
    form.validateFields().then(values => {
      setEditMode(false);
      const canvas = canvasRef.current;
      const imgUrl = canvas.toDataURL();
      uploadGenerateLogo({ imgUrl, appName }).then(() => {
        if (uploadGenerateLogoError) {
          message.error('App logo uploading failed!');
        } else {
          message.success('App logo was uploaded successfully.');
          setIconHash(Date.now());
          setGenerateLogoModalVisible(false);
        }
      });
    });
  }, [
    form,
    setGenerateLogoModalVisible,
    setIconHash,
    uploadGenerateLogo,
    appName,
    uploadGenerateLogoError,
  ]);

  const footer = (
    <>
      {!uploadGenerateLogoPending && <Button onClick={hideModal}>Cancel</Button>}
      {!uploadGenerateLogoPending && (
        <Button type="primary" onClick={handleSaveGeneratedLogo}>
          Save
        </Button>
      )}
      {uploadGenerateLogoPending && <Button disabled={!editMode}>Cancel</Button>}
      {uploadGenerateLogoPending && <Button disabled={!editMode}>Saving...</Button>}
    </>
  );

  return (
    <Modal
      className={`muse-app-manager_home-logo-generate-modal ${editMode ? 'logo-edit-mode' : ''}`}
      visible={visible}
      title="Generate Logo From Text"
      width="800px"
      destroyOnClose
      maskClosable={false}
      footer={footer}
      closable={!uploadGenerateLogoPending}
      afterClose={closeModal}
      onCancel={hideModal}
    >
      <RequestStatus
        loading={uploadGenerateLogoPending}
        loadingMode={'container'}
        error={uploadGenerateLogoError}
        errorMode={'inline'}
        dismissError={dismissUploadGenerateLogoError}
        errorProps={{ title: 'Failed to upload logo.' }}
      />
      <div className="input-wrapper">
        <div className="logo-thumbnail">
          <LogoCanvas meta={meta} values={form.getFieldsValue()} onLoad={handleOnLoad} />
        </div>

        <Form
          form={form}
          style={{ marginLeft: '-20px', width: '100%' }}
          onValuesChange={forceUpdate}
        >
          <FormBuilder meta={meta} form={form} />
        </Form>
      </div>
    </Modal>
  );
}
