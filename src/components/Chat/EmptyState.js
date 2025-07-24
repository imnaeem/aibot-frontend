import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { SmartToy as BotIcon } from "@mui/icons-material";

const EmptyState = () => {
  return (
    <Box
      sx={{
        flex: 1,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 3,
        }}
      >
        <Avatar
          sx={{
            width: 80,
            height: 80,
            backgroundColor: "#e3f2fd",
            mb: 3,
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.05)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        >
          <BotIcon sx={{ fontSize: 40, color: "#1976d2" }} />
        </Avatar>

        <Typography variant="h5" gutterBottom sx={{ fontWeight: 400, mb: 1 }}>
          How can I help you today?
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 400, mb: 3 }}
        >
          Start a conversation with our AI assistant. Ask questions, get help
          with coding, or explore ideas together.
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            opacity: 0.7,
          }}
        >
          Press{" "}
          <kbd
            style={{
              background: "#f5f5f5",
              padding: "2px 6px",
              borderRadius: "4px",
              fontSize: "0.75rem",
            }}
          >
            ⌘K
          </kbd>{" "}
          to search chats
        </Typography>
      </Box>
    </Box>
  );
};

export default EmptyState;
