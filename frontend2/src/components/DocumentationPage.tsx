import React from "react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

const isInternalLink = (to: string): boolean => {
  const url = new URL(to, window.location.origin);
  console.log(url, window.location.hostname);
  return url.hostname === window.location.hostname;
};

interface DocumentationPageProps {
  text: string;
}

const DocumentationPage: React.FC<DocumentationPageProps> = ({ text }) => {
  return (
    <div className="h-full w-full overflow-auto bg-white p-6">
      <ReactMarkdown
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
    </div>
  );
};

export default DocumentationPage;
