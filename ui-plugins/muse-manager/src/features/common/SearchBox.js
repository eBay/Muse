import { useCallback } from 'react';
import { Input } from 'antd';

import { useLocation, useSearchParam } from 'react-use';
const { Search } = Input;

export default function SearchBox({ searchKey = 'search', onSearch, onChange, ...rest }) {
  const location = useLocation();
  const searchValue = useSearchParam(searchKey);

  const doSearch = useCallback(
    v => {
      const { pathname, hash, search } = location;
      const searchParams = new URLSearchParams(search);
      searchParams.set(searchKey, v);
      window.history.pushState({}, '', `${pathname}?${searchParams.toString()}${hash}`);
    },
    [location, searchKey],
  );

  const handleChange = evt => {
    doSearch(evt.target.value);
  };

  return <Search onSearch={doSearch} onChange={handleChange} value={searchValue} {...rest} />;
}
