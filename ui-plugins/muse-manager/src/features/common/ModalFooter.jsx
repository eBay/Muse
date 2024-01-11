import { Button, Tooltip } from 'antd';

export const FooterItem = ({ item }) => {
  let ele = item.content || <Button {...item.props} />;
  if (item.tooltip) {
    ele = (
      <Tooltip title={item.tooltip}>
        <span>{ele}</span>
      </Tooltip>
    );
  }

  if (item.position !== 'left') {
    ele = <span className="justify-self-end">{ele}</span>;
  } else {
    ele = <span>{ele}</span>;
  }
  return ele;
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
      className="grid gap-2 mt-5"
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
