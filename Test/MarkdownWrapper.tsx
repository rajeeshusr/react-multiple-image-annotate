// MarkdownWrapper.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // or any style you prefer

interface MarkdownWrapperProps {
    children: string;
}

const MarkdownWrapper: React.FC<MarkdownWrapperProps> = ({ children }) => {
    return (
        <div className="markdown-wrapper">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
            >
                {children}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownWrapper;
