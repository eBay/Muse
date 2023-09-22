import _ from 'lodash';
import { Button } from 'antd';

const FooterItem = ({ item }) => {
  const ele = item.content || <Button {...item.props} />;
  if (item.position !== 'left') {
    return <span className="justify-self-end">{ele}</span>;
  }
  return <span>{ele}</span>;
};
export default function ModalFooter({
  okText,
  cancelText,
  onOk,
  onCancel,
  okButtonProps,
  cancelButtonProps,
  items,
  ...rest
}) {
  if (!items) {
    items = [
      {
        key: 'cancel-btn',
        order: 10,
        props: {
          children: cancelText || 'Cancel',
          onClick: onCancel,
          ...cancelButtonProps,
        },
      },

      {
        key: 'ok-btn',
        order: 20,
        props: {
          children: okText || 'Ok',
          onClick: onOk,
          type: 'primary',
          ...okButtonProps,
        },
      },
    ];
  }

  const startItems = items.filter((item) => item.position === 'left');
  const endItems = items.filter((item) => item.position !== 'left');

  const arr = [];
  if (startItems.length > 0) {
    arr.push(startItems.length - 1, '1fr', endItems.length);
  } else if (endItems.length > 0) {
    arr.push('1fr', endItems.length - 1);
  }

  const gridTemplateColumns = arr
    .filter(Boolean)
    .map((a) => (a === '1fr' ? '1fr' : `repeat(${a}, auto)`))
    .join(' ');

  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns,
      }}
    >
      {[...startItems, ...endItems].map((item) => (
        <FooterItem key={item.key} item={item} />
      ))}
    </div>
  );
}
