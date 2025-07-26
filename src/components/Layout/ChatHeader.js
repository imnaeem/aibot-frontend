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
import {
  Menu as MenuIcon,
  Schedule as TimeIcon,
  Description,
} from "@mui/icons-material";
import { formatTimestamp } from "../../utils/formatters";
import ModelSelector from "../Chat/ModelSelector";

const ChatHeader = ({
  sidebarOpen,
  setSidebarOpen,
  currentChat,
  isStreaming,
  messagesCount,
  isGuest,
  isLoadingMessages,
  selectedModel,
  onModelChange,
  selectedDocument,
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
        sx={{
          transition: "all 0.2s ease",
          position: "relative",
          pr: isMobile ? 2 : 4, // Extra padding for fixed right section
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          sx={{ width: "100%", position: "relative" }}
        >
          {/* Left Section: Menu + Title */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={isMobile ? 1 : 2}
            sx={{ flex: 1, minWidth: 0, mr: 2 }}
          >
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
                maxWidth: isMobile ? "140px" : "none",
              }}
            >
              {currentChat?.title || "Start a new conversation"}
            </Typography>
          </Stack>

          {/* Center Section: Dynamic Status Chips */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              flex: 0,
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 1,
            }}
          >
            {selectedDocument && (
              <Chip
                icon={<Description />}
                label={`📄 ${selectedDocument.original_name}`}
                size="small"
                variant="outlined"
                color="primary"
                sx={{
                  fontSize: "0.75rem",
                  height: 24,
                  maxWidth: isMobile ? "120px" : "200px",
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  },
                }}
              />
            )}
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
          </Stack>

          {/* Right Section: Model Selector + Documents Button */}
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{
              flex: 0,
              position: "absolute",
              right: 0,
              zIndex: 1,
            }}
          >
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              isMobile={isMobile}
            />
          </Stack>
        </Stack>

        {/* Mobile Model Selector */}
        {isMobile && currentChat && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mt: 1.5, px: 0.5 }}
          >
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={onModelChange}
              disabled={isStreaming}
            />
            {messagesCount > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  whiteSpace: "nowrap",
                }}
              >
                <TimeIcon sx={{ fontSize: 14 }} />
                {formatTimestamp(currentChat?.updatedAt)}
              </Typography>
            )}
          </Stack>
        )}
      </Container>
    </Paper>
  );
};

export default ChatHeader;
