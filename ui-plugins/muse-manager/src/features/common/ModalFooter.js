import _ from 'lodash';
import { Button } from 'antd';

const FooterItem = ({ item }) => {
  const ele = item.content || <Button {...item.props} />;
  // if (item.position !== 'left') {
  //   return <span className="align-self-end">{ele}</span>;
  // }
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
        props: {
          children: cancelText || 'Cancel',
          onClick: onCancel,
          ...cancelButtonProps,
        },
      },

      {
        key: 'ok-btn',
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
  return (
    <div
      className="grid gap-2"
      style={{
        gridTemplateColumns: `repeat(${startItems.length}, auto) 1fr repeat(${endItems.length}, auto)`,
      }}
    >
      {startItems.map((item) => (
        <FooterItem key={item.key} item={item} />
      ))}
      <span />
      {endItems.map((item) => (
        <FooterItem key={item.key} item={item} />
      ))}
    </div>
  );
}
