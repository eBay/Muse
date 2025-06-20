import { Popover } from 'antd';
import { Highlighter } from '@ebay/muse-lib-antd/src/features/common';

export default function OwnerList({ owners = [], searchKey, count = 3 }) {
  const splitIndex = owners.length > count ? count - 1 : owners.length;
  let ownersShown = owners.slice(0, splitIndex);
  let ownersHidden = owners.slice(splitIndex);

  const ownersShownList = ownersShown.map((owner, i) => (
    <span key={owner}>
      <Highlighter text={owner} search={searchKey} />
      {i < ownersShown.length - 1 ? ', ' : ' '}
    </span>
  ));

  const ownersHiddenList = ownersHidden.map((owner) => (
    <p key={owner} className="last:mb-0">
      <Highlighter text={owner} search={searchKey} /> &nbsp;
    </p>
  ));

  const ownersHideFlag =
    owners.length > count ? (
      <span>
        and&nbsp;
        <span style={{ cursor: 'pointer', color: '#1890ff' }}>
          <Popover content={ownersHiddenList}>{owners.length - (count - 1)} others</Popover>
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
