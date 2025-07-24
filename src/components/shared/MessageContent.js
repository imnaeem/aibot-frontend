import React from "react";
import CodeBlock from "./CodeBlock";
import InlineCode from "./InlineCode";

const MessageContent = ({ content, onCopyCode }) => {
  const formatContent = (content) => {
    // First handle code blocks
    const parts = content.split(/```(\w+)?\n([\s\S]*?)```/g);
    return parts.map((part, index) => {
      if (index % 3 === 2) {
        // This is the code content
        const language = parts[index - 1] || "plaintext";
        return (
          <CodeBlock
            key={index}
            code={part}
            language={language}
            onCopy={onCopyCode}
          />
        );
      } else if (index % 3 === 1) {
        return null; // Skip language part
      } else {
        // Handle inline code and regular text
        return <span key={index}>{formatInlineContent(part)}</span>;
      }
    });
  };

  const formatInlineContent = (text) => {
    // Handle inline code with single backticks
    const inlineParts = text.split(/`([^`]+)`/g);
    return inlineParts.map((part, index) => {
      if (index % 2 === 1) {
        // This is inline code
        return <InlineCode key={index}>{part}</InlineCode>;
      } else {
        // Regular text with line breaks
        return part.split("\n").map((line, lineIndex) => (
          <span key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < part.split("\n").length - 1 && <br />}
          </span>
        ));
      }
    });
  };

  return <>{formatContent(content)}</>;
};

export default MessageContent;
