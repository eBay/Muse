import { useMemo } from 'react';
import { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import NiceForm from '@ebay/nice-form-react';
import utils from '@ebay/muse-lib-antd/src/utils';
import { Modal, Form } from 'antd';
import jsPlugin from 'js-plugin';
import ModalFooter from '../common/ModalFooter';
import Nodes from './Nodes';
import { usePendingError, useAbility } from '../../hooks';

const noop = () => {};
/**
 * A common UI logic that handles a form/modal with extensible header, body and footer.
 * Also it handles pending, error status with extensibility.
 * @returns
 */
export default function ExtModal({ extBase, config, ...rest }) {
  const { setPending, setError, pending, error } = usePendingError();
  const modal = useModal();
  const [form] = Form.useForm();
  const ability = useAbility();

  const extArgs = {
    ability,
    form,
    modal,
    setPending,
    setError,
    pending,
    error,
  };

  const meta = useMemo(
    () =>
      Object.assign(
        {
          columns: 2,
          viewMode: true,
          initialValues: {},
          fields: [],
        },
        config?.formMeta || {},
      ),
    [config?.formMeta],
  );

  utils.extendFormMeta(meta, `${extBase}.form`, {
    meta,
    ...extArgs,
  });

  const footerItems = [];
  utils.extendArray(footerItems, 'items', `${extBase}.footer`, {
    items: footerItems,
    ...extArgs,
  });

  const modalNodes = [
    {
      key: 'request-status',
      order: 10,
      node: <RequestStatus loading={pending} error={error} />,
    },
    {
      key: 'nice-form',
      order: 20,
      node: (
        <Form form={form}>
          <NiceForm meta={meta} />
        </Form>
      ),
    },
    {
      key: 'modal-footer',
      order: 10000,
      node: (
        <ModalFooter
          items={footerItems}
          onOk={rest.onOk || noop}
          onCancel={rest.onCancel || noop}
        />
      ),
    },
    ...(config?.bodyNodes || []),
  ];
  utils.extendArray(modalNodes, 'nodes', `${extBase}.body`, {
    nodes: modalNodes,
    ...extArgs,
  });

  const modalProps = {
    ...rest,
  };

  jsPlugin.invoke(`${extBase}.processModalProps`, {
    modalProps,
    ...extArgs,
  });

  return (
    <Modal {...antdModalV5(modal)} {...modalProps}>
      <Nodes nodes={modalNodes} />
    </Modal>
  );
}
