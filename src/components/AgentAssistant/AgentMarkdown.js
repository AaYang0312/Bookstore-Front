import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AgentMarkdown = ({ children }) => (
  <div className="agent-markdown">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={{
        table: ({ node, ...props }) => (
          <div className="agent-table-scroll" role="region" aria-label="对比表格" tabIndex="0">
            <table {...props} />
          </div>
        ),
        a: ({ node, children: linkContent, ...props }) => (
          <a {...props} target="_blank" rel="noreferrer">{linkContent}</a>
        )
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);

export default AgentMarkdown;
