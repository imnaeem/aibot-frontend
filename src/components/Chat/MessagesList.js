import React, { useRef, useEffect, useCallback } from "react";
import {
  Box,
  Container,
  Stack,
  Chip,
  Fade,
  Fab,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { KeyboardArrowDown as ArrowDownIcon } from "@mui/icons-material";
import MessageItem from "./MessageItem";
import EmptyState from "./EmptyState";
import { groupMessagesByDate } from "../../utils/formatters";
import { SCROLL_THRESHOLD } from "../../utils/constants";

const MessagesList = ({
  messages,
  sidebarOpen,
  onCopyMessage,
  copiedMessageId,
  showScrollToBottom,
  onScrollStateChange,
  onDeleteMessage,
  onUpdateMessage,
  onResendMessage,
  currentChatId,
  isLoadingMessages,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle scroll detection for scroll-to-bottom button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom =
        scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;
      onScrollStateChange?.(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [onScrollStateChange]);

  const scrollToBottom = useCallback(() => {
    const container = messagesContainerRef.current;
    if (container) {
      // Always use smooth scroll for manual scroll button
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const messageGroups = groupMessagesByDate(messages);

  if (isLoadingMessages) {
    return (
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          gap: 2,
        }}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          Loading messages...
        </Typography>
      </Box>
    );
  }

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "hidden",
        backgroundColor: "#ffffff",
        position: "relative",
      }}
    >
      <Box
        ref={messagesContainerRef}
        sx={{
          height: "100%",
          overflowY: "auto",
          paddingX: isMobile ? 1 : 2,
          "&::-webkit-scrollbar": {
            width: isMobile ? "4px" : "6px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c0c0c0",
            borderRadius: "3px",
            "&:hover": {
              backgroundColor: "#a0a0a0",
            },
          },
          // Firefox scrollbar
          scrollbarWidth: "thin",
          scrollbarColor: "#c0c0c0 transparent",
        }}
      >
        <Container
          maxWidth={sidebarOpen && !isMobile ? "lg" : "md"}
          sx={{ py: isMobile ? 1 : 2, transition: "all 0.2s ease" }}
        >
          <Stack spacing={1} sx={{ py: 2 }}>
            {messageGroups.map((group, groupIndex) => (
              <Box key={groupIndex}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 2,
                  }}
                >
                  <Chip
                    label={
                      group.date === new Date().toDateString()
                        ? "Today"
                        : group.date ===
                          new Date(Date.now() - 86400000).toDateString()
                        ? "Yesterday"
                        : new Date(group.date).toLocaleDateString()
                    }
                    size="small"
                    sx={{
                      backgroundColor: "#f5f5f5",
                      color: "text.secondary",
                      fontSize: "0.75rem",
                    }}
                  />
                </Box>

                {group.messages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    onCopyMessage={onCopyMessage}
                    copiedMessageId={copiedMessageId}
                    onDeleteMessage={onDeleteMessage}
                    onEditMessage={onUpdateMessage}
                    onResendMessage={onResendMessage}
                    currentChatId={currentChatId}
                  />
                ))}
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        </Container>
      </Box>

      {/* Scroll to bottom button */}
      <Fade in={showScrollToBottom}>
        <Fab
          size={isMobile ? "medium" : "small"}
          onClick={scrollToBottom}
          sx={{
            position: "absolute",
            bottom: isMobile ? 90 : 80,
            right: isMobile ? 16 : 24,
            backgroundColor: "#ffffff",
            color: "#1976d2",
            border: "1px solid #e0e0e0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            "&:hover": {
              backgroundColor: "#f5f5f5",
            },
          }}
        >
          <ArrowDownIcon />
        </Fab>
      </Fade>
    </Box>
  );
};

export default MessagesList;
