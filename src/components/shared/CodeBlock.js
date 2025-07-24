import React from "react";
import { Box, IconButton, Chip } from "@mui/material";
import { ContentCopy as CopyIcon } from "@mui/icons-material";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  MAX_CODE_HEIGHT,
  MIN_LINES_FOR_LINE_NUMBERS,
} from "../../utils/constants";

const CodeBlock = ({ code, language = "plaintext", onCopy }) => {
  const lineCount = code.split("\n").length;
  const showLineNumbers = lineCount > MIN_LINES_FOR_LINE_NUMBERS;

  return (
    <Box
      sx={{
        position: "relative",
        mt: 1,
        mb: 1,
        "&:hover .copy-button": {
          opacity: 1,
        },
        // Custom scrollbar styling for code blocks
        "& .react-syntax-highlighter": {
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#2a2a2a",
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#4a4a4a",
            borderRadius: "3px",
            border: "1px solid #2a2a2a",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#5a5a5a",
          },
          "&::-webkit-scrollbar-corner": {
            background: "#2a2a2a",
          },
          // Firefox scrollbar
          scrollbarWidth: "thin",
          scrollbarColor: "#4a4a4a #2a2a2a",
        },
      }}
    >
      <SyntaxHighlighter
        language={language.toLowerCase()}
        style={vscDarkPlus}
        customStyle={{
          fontSize: "0.813rem",
          lineHeight: 1.5,
          fontFamily: '"Roboto Mono", "Monaco", monospace',
          margin: 0,
          padding: "16px",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
          backgroundColor: "#1e1e1e",
          overflow: "auto",
          maxHeight: `${MAX_CODE_HEIGHT}px`,
        }}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
      >
        {code}
      </SyntaxHighlighter>

      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
          display: "flex",
          gap: 1,
          alignItems: "center",
        }}
      >
        {language && language !== "plaintext" && (
          <Chip
            label={language.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "#ffffff",
              fontSize: "0.7rem",
              height: 20,
            }}
          />
        )}

        <IconButton
          className="copy-button"
          size="small"
          onClick={() => onCopy?.(code)}
          sx={{
            mr: 1,
            opacity: 0,
            transition: "opacity 0.2s",
            backgroundColor: "rgba(255,255,255,0.1)",
            color: "#ffffff",
            width: 28,
            height: 28,
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.2)",
            },
          }}
        >
          <CopyIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CodeBlock;
