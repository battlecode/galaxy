import React from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

interface MarkdownProps {
  text: string;
  className?: string;
}

const isInternalLink = (to: string): boolean => {
  const url = new URL(to, window.location.origin);
  return url.hostname === window.location.hostname;
};

const Markdown: React.FC<MarkdownProps> = ({ text, className = "" }) => {
  return (
    <ReactMarkdown
      className={className}
      components={{
        a: ({ href, ...props }) => {
          const target = href ?? "";
          if (isInternalLink(target)) {
            return (
              <Link
                className="text-cyan-600 hover:underline"
                to={target}
                {...props}
              />
            );
          } else {
            return (
              <a
                className="text-cyan-600 hover:underline"
                href={target}
                {...props}
              />
            );
          }
        },
      }}
    >
      {text}
    </ReactMarkdown>
  );
};

export default Markdown;
