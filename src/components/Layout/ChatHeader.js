import React from "react";
import {
  Paper,
  Container,
  Stack,
  Typography,
  IconButton,
  Chip,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Menu as MenuIcon, Schedule as TimeIcon } from "@mui/icons-material";
import { formatTimestamp } from "../../utils/formatters";

const ChatHeader = ({
  sidebarOpen,
  setSidebarOpen,
  currentChat,
  isStreaming,
  messagesCount,
  isGuest,
  isLoadingMessages,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Paper
      elevation={0}
      sx={{
        p: isMobile ? 1.5 : 2,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e0e0e0",
        boxShadow: "none",
        zIndex: 1,
      }}
    >
      <Container
        maxWidth={sidebarOpen && !isMobile ? "lg" : "md"}
        sx={{ transition: "all 0.2s ease" }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" spacing={isMobile ? 1 : 2}>
            {(!sidebarOpen || isMobile) && (
              <IconButton
                onClick={() => setSidebarOpen(true)}
                sx={{
                  color: "text.secondary",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  p: isMobile ? 1 : 1.5,
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{
                color: "text.primary",
                fontWeight: 600,
                fontSize: isMobile ? "1rem" : "1.25rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: isMobile ? "200px" : "none",
              }}
            >
              {currentChat?.title || "Start a new conversation"}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            {isGuest && (
              <Chip
                label="Guest Mode"
                size="small"
                sx={{
                  backgroundColor: "orange",
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            )}

            {isLoadingMessages && (
              <Chip
                icon={
                  <CircularProgress
                    size={14}
                    sx={{ color: "#1976d2 !important" }}
                  />
                }
                label="Loading chat..."
                size="small"
                variant="outlined"
                sx={{
                  borderColor: "#1976d2",
                  color: "#1976d2",
                }}
              />
            )}

            {isStreaming && (
              <Chip
                icon={
                  <CircularProgress
                    size={14}
                    sx={{ color: "#1976d2 !important" }}
                  />
                }
                label="AI is typing..."
                size="small"
                variant="outlined"
                sx={{
                  color: "#1976d2",
                  borderColor: "#1976d2",
                  backgroundColor: "#e3f2fd",
                }}
              />
            )}

            {messagesCount > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <TimeIcon sx={{ fontSize: 14 }} />
                {formatTimestamp(currentChat?.updatedAt)}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Container>
    </Paper>
  );
};

export default ChatHeader;
