import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { Android as BotIcon } from "@mui/icons-material";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8f9fa", // Match auth page background
      }}
    >
      <BotIcon
        sx={{
          fontSize: 64,
          color: "primary.main", // Use theme color instead of white
          mb: 3,
          animation: "pulse 2s infinite",
          "@keyframes pulse": {
            "0%": {
              opacity: 0.7,
              transform: "scale(1)",
            },
            "50%": {
              opacity: 1,
              transform: "scale(1.1)",
            },
            "100%": {
              opacity: 0.7,
              transform: "scale(1)",
            },
          },
        }}
      />
      <CircularProgress
        size={40}
        sx={{
          color: "primary.main", // Use theme color instead of white
          mb: 2,
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: "text.primary", // Use theme text color
          textAlign: "center",
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
