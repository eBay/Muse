import _ from 'lodash';

export default {
  defaultProps: {
    size: 'middle',
    pagination: {
      hideOnSinglePage: true,
      size: 'small',
      showTotal: total => `Total ${total} items`,
      showQuickJumper: true,
    },
  },
  defaultSorter(key) {
    return (a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      const v1 = _.get(a, key);
      const v2 = _.get(b, key);
      if (typeof v1 === 'number' && typeof v2 === 'number') return v1 - v2;
      return String(v1).localeCompare(String(v2));
    };
  },
  defaultFilter: (dataSource, key) => {
    if (!dataSource || !dataSource.length) return {};
    const options = Object.keys(
      dataSource.reduce((p, c) => {
        p[_.get(c, key)] = true;
        return p;
      }, {}),
    );
    options.sort((a, b) => String(a).localeCompare(String(b)));
    if (options.length > 10) options.length = 10;
    return {
      filters: options.map(k => ({
        text: k,
        value: k,
      })),
      onFilter: (value, record) => _.get(record, key) === value,
    };
  },
};
