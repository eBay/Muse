import { Popover } from 'antd';
import { Highlighter } from '@ebay/muse-lib-antd/src/features/common';

export default function OwnerList({ owners = [], searchKey }) {
  let ownersShown = owners.slice(0, owners.length > 3 ? 2 : 3);
  let ownersHidden = owners.slice(2);

  const ownersShownList = ownersShown.map((owner, i) => (
    <span key={owner}>
      <Highlighter text={owner} search={searchKey} />
      {i < ownersShown.length - 1 ? ', ' : ' '}
    </span>
  ));

  const ownersHiddenList = ownersHidden.map((owner) => (
    <p key={owner}>
      <Highlighter text={owner} search={searchKey} /> &nbsp;
    </p>
  ));

  const ownersHideFlag =
    owners.length > 3 ? (
      <span>
        and&nbsp;
        <span style={{ cursor: 'pointer', color: '#1890ff' }}>
          <Popover content={ownersHiddenList}>{owners.length - 2} others</Popover>
        </span>
      </span>
    ) : null;

  return (
    <div className="muse-manager_common-owner-list">
      {ownersShownList}
      {ownersHideFlag}
    </div>
  );
}
