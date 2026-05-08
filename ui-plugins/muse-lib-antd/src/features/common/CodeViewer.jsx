import React from 'react';
import { message } from 'antd';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import less from 'react-syntax-highlighter/dist/esm/languages/prism/less';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import docker from 'react-syntax-highlighter/dist/esm/languages/prism/docker';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import { tomorrow, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CopyToClipboard } from 'react-copy-to-clipboard';

SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('less', less);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('markup', markup);
SyntaxHighlighter.registerLanguage('docker', docker);

export default function CodeViewer({ theme, title, language, allowCopy, code, ...rest }) {
  const langmap = {
    js: 'jsx',
    html: 'markup',
    xml: 'markup',
    dockerfile: 'docker',
  };
  const style = theme === 'dark' ? tomorrow : prism;
  return (
    <div
      className={
        'muse-antd_common-code-viewer' + (theme === 'dark' ? ' common-code-viewer-dark' : '')
      }
    >
      {(title || allowCopy) && (
        <div className="code-title-container">
          {title && <label>{title}</label>}
          {allowCopy && (
            <CopyToClipboard
              text={code}
              onCopy={() => message.success('Content copied to the clipboard!')}
            >
              <button className="btn-copy-to-clipboard">Copy to Clipboard</button>
            </CopyToClipboard>
          )}
        </div>
      )}
      <SyntaxHighlighter style={style} language={langmap[language] || language} {...rest}>
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

CodeViewer.propTypes = {};
CodeViewer.defaultProps = {};

