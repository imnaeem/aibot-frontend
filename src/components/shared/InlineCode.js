import React from "react";
import { Box } from "@mui/material";

const InlineCode = ({ children }) => {
  return (
    <Box
      component="code"
      sx={{
        backgroundColor: "#f5f5f5",
        color: "#d73a49",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "0.85em",
        fontFamily: '"Roboto Mono", "Monaco", monospace',
        border: "1px solid #e1e4e8",
        display: "inline",
      }}
    >
      {children}
    </Box>
  );
};

export default InlineCode;
