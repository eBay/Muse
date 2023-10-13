import _ from 'lodash';
import ReactHighlighter from 'react-highlight-words';

export default function Highlighter({ search, text }) {
  console.log('search', search);
  return (
    <ReactHighlighter
      searchWords={_.castArray(search)}
      textToHighlight={text}
      highlightClassName="muse-antd_common-highlighter-span"
      highlightStyle={{ backgroundColor: 'yellow' }}
    />
  );
}
