import React, { useCallback } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Input } from 'antd';

const { Search } = Input;

export default function TableBar({ children, className, onSearch, placeholder }) {
  // eslint-disable-next-line
  const doSearch = useCallback(
    _.debounce(v => {
      onSearch(v);
    }, 300),
    [onSearch],
  );
  const handleChange = useCallback(
    evt => {
      doSearch(evt.target.value);
    },
    [doSearch],
  );

  const handleSearch = useCallback(
    value => {
      doSearch(value);
    },
    [doSearch],
  );
  return (
    <div className={`muse-antd_common-table-bar ${className}`}>
      <Search
        placeholder={placeholder || 'Type to search...'}
        onSearch={handleSearch}
        onChange={handleChange}
        allowClear
      />
      <span className="muse-antd_common-table-bar-children-wrapper">{children}</span>
    </div>
  );
}

TableBar.propTypes = {
  onSearch: PropTypes.func,
  children: PropTypes.any,
};
TableBar.defaultProps = {
  onSearch() {},
};
