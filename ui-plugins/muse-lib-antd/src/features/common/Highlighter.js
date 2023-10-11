
import React from 'react';
import ReactHighlighter from 'react-highlight-words';

export default function Highlighter({ search, text }) {
  return (
    <ReactHighlighter
      searchWords={search}
      textToHighlight={text}
      highlightClassName="muse-antd_common-highlighter-span"
      highlightStyle={{backgroundColor: 'yellow'}}
    />
  );
}




