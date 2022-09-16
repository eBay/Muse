import { useCallback } from 'react';
import { Input } from 'antd';
import { useSearchState } from '../../hooks';
const { Search } = Input;

export default function SearchBox({ searchKey = 'search', onSearch, onChange, ...rest }) {
  const [searchValue, setSearchValue] = useSearchState(searchKey);
  const doSearch = useCallback(
    v => {
      setSearchValue(v);
    },
    [setSearchValue],
  );

  const handleChange = evt => {
    doSearch(evt.target.value);
  };

  return <Search onSearch={doSearch} onChange={handleChange} value={searchValue} {...rest} />;
}
