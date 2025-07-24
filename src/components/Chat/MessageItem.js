import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  SmartToy as BotIcon,
  Person as PersonIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import MessageContent from "../shared/MessageContent";
import { formatTimestamp } from "../../utils/formatters";
import { MESSAGE_ROLES } from "../../utils/constants";

const MessageItem = ({
  message,
  onCopyMessage,
  copiedMessageId,
  onDeleteMessage,
  onEditMessage, // Changed from onUpdateMessage
  onResendMessage,
  currentChatId,
}) => {
  const isUser = message.role === MESSAGE_ROLES.USER;
  const isStreaming = message.isStreaming;

  // State for menu
  const [menuAnchor, setMenuAnchor] = useState(null);

  // Menu handlers
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Edit handler - populate input area instead of inline editing
  const handleStartEdit = () => {
    onEditMessage(message);
    handleMenuClose();
  };

  // Delete handler
  const handleDelete = async () => {
    try {
      await onDeleteMessage(currentChatId, message.id);
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
    handleMenuClose();
  };

  // Resend handler
  const handleResend = async () => {
    try {
      await onResendMessage(currentChatId, message.content);
    } catch (error) {
      console.error("Failed to resend message:", error);
    }
    handleMenuClose();
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: "flex-start",
        gap: 1.5,
        pb: 2,
        px: 1,
      }}
    >
      {!isUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            backgroundColor: "#e3f2fd",
            mt: 0.5,
            flexShrink: 0,
          }}
        >
          <BotIcon sx={{ fontSize: 18, color: "#1976d2" }} />
        </Avatar>
      )}

      <Box
        sx={{
          maxWidth: "70%",
          minWidth: "120px",
          position: "relative",
        }}
      >
        <Card
          elevation={0}
          sx={{
            backgroundColor: isUser ? "#1976d2" : "#f8f9fa",
            color: isUser ? "white" : "text.primary",
            border: isUser ? "none" : "1px solid #e0e0e0",
            borderRadius: 2,
            "&:hover": {
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              "& .message-actions": {
                opacity: 1,
              },
            },
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Typography
              variant="body1"
              component="div"
              sx={{
                lineHeight: 1.5,
                wordBreak: "break-word",
                fontSize: "0.875rem",
              }}
            >
              <MessageContent
                content={message.content}
                onCopyCode={onCopyMessage}
              />
              {isStreaming && (
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: "2px",
                    height: "1.2em",
                    backgroundColor: isUser ? "white" : "#1976d2",
                    ml: 0.5,
                    animation: "blink 1s infinite",
                    "@keyframes blink": {
                      "0%, 50%": { opacity: 1 },
                      "51%, 100%": { opacity: 0 },
                    },
                  }}
                />
              )}
            </Typography>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                  fontSize: "0.75rem",
                }}
              >
                {formatTimestamp(message.timestamp)}
              </Typography>

              {!isStreaming && (
                <Box
                  className="message-actions"
                  sx={{
                    opacity: 0,
                    transition: "opacity 0.2s",
                    display: "flex",
                    gap: 0.5,
                  }}
                >
                  <Tooltip title="Copy message">
                    <IconButton
                      size="small"
                      onClick={() => onCopyMessage(message.content)}
                      sx={{
                        width: 24,
                        height: 24,
                        color: isUser
                          ? "rgba(255,255,255,0.7)"
                          : "text.secondary",
                        "&:hover": {
                          backgroundColor: isUser
                            ? "rgba(255,255,255,0.1)"
                            : "rgba(0,0,0,0.04)",
                        },
                      }}
                    >
                      {copiedMessageId === message.content ? (
                        <CheckIcon
                          sx={{ fontSize: 14, color: "success.main" }}
                        />
                      ) : (
                        <CopyIcon sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>
                  </Tooltip>

                  {(onDeleteMessage || onEditMessage || onResendMessage) && (
                    <Tooltip title="More actions">
                      <IconButton
                        size="small"
                        onClick={handleMenuOpen}
                        sx={{
                          width: 24,
                          height: 24,
                          color: isUser
                            ? "rgba(255,255,255,0.7)"
                            : "text.secondary",
                          "&:hover": {
                            backgroundColor: isUser
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.04)",
                          },
                        }}
                      >
                        <MoreIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Context Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          {onEditMessage && isUser && (
            <MenuItem onClick={handleStartEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit and resend</ListItemText>
            </MenuItem>
          )}

          {onResendMessage && isUser && (
            <MenuItem onClick={handleResend}>
              <ListItemIcon>
                <RefreshIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Resend</ListItemText>
            </MenuItem>
          )}

          {onDeleteMessage && (
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete message</ListItemText>
            </MenuItem>
          )}
        </Menu>
      </Box>

      {isUser && (
        <Avatar
          sx={{
            width: 32,
            height: 32,
            backgroundColor: "#e8f5e8",
            mt: 0.5,
            flexShrink: 0,
          }}
        >
          <PersonIcon sx={{ fontSize: 18, color: "#4caf50" }} />
        </Avatar>
      )}
    </Box>
  );
};

export default MessageItem;
