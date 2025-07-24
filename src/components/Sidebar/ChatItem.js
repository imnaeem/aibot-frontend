import React, { useCallback } from "react";
import {
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
  TextField,
  Box,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";

const ChatItem = React.memo(
  ({
    chat,
    isSelected,
    isEditing,
    editingTitle,
    isLoadingMessages,
    onSelect,
    onToggleFavorite,
    onStartEdit,
    onEditChange,
    onEditKeyDown,
    onEditBlur,
    onEditClick,
    onMenuClick,
    editInputRef,
    bulkSelectMode,
    isSelectedForBulk,
    onBulkSelect,
  }) => {
    const handleMenuClick = useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        onMenuClick(event, chat.id);
      },
      [onMenuClick, chat.id]
    );

    const handleToggleFavorite = useCallback(
      (event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggleFavorite(event);
      },
      [onToggleFavorite]
    );

    const handleItemClick = useCallback(() => {
      if (bulkSelectMode) {
        onBulkSelect();
      } else {
        onSelect();
      }
    }, [bulkSelectMode, onBulkSelect, onSelect]);

    if (isEditing) {
      return (
        <ListItem disablePadding>
          <Box
            sx={{
              width: "100%",
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <ChatIcon
              sx={{ fontSize: 18, color: "text.secondary", flexShrink: 0 }}
            />
            <TextField
              inputRef={editInputRef}
              size="small"
              value={editingTitle}
              onChange={onEditChange}
              onKeyDown={onEditKeyDown}
              onBlur={onEditBlur}
              onFocus={(e) => e.target.select()}
              onClick={onEditClick}
              variant="outlined"
              placeholder="Chat title..."
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  fontSize: "0.875rem",
                  backgroundColor: "#ffffff",
                  "& fieldset": {
                    borderColor: "#1976d2",
                  },
                },
              }}
            />
          </Box>
        </ListItem>
      );
    }

    return (
      <ListItem disablePadding>
        <ListItemButton
          onClick={handleItemClick}
          selected={!bulkSelectMode && isSelected}
          sx={{
            py: 1,
            px: 2,
            backgroundColor:
              bulkSelectMode && isSelectedForBulk ? "#e3f2fd" : "transparent",
            "&:hover": {
              backgroundColor:
                bulkSelectMode && isSelectedForBulk ? "#bbdefb" : undefined,
            },
          }}
        >
          {bulkSelectMode && (
            <Checkbox
              checked={isSelectedForBulk}
              onChange={onBulkSelect}
              onClick={(e) => e.stopPropagation()}
              sx={{ mr: 1, p: 0.5 }}
            />
          )}
          <ChatIcon sx={{ mr: 1.5, fontSize: 18, color: "text.secondary" }} />
          <ListItemText
            primary={chat.title}
            secondary={
              isLoadingMessages
                ? "Loading messages..."
                : chat.messagesLoaded === false
                ? "Click to load messages"
                : `${chat.messages.length} messages`
            }
            primaryTypographyProps={{
              fontSize: "0.875rem",
              fontWeight: 400,
              noWrap: true,
              color: "text.primary",
            }}
            secondaryTypographyProps={{
              fontSize: "0.75rem",
              color: "text.secondary",
            }}
          />

          {isLoadingMessages && <CircularProgress size={16} sx={{ mr: 1 }} />}

          {!bulkSelectMode && (
            <>
              <Tooltip
                title={
                  chat.isFavorite ? "Remove from favorites" : "Add to favorites"
                }
              >
                <IconButton
                  size="small"
                  onClick={handleToggleFavorite}
                  sx={{
                    ml: 0.5,
                    color: chat.isFavorite ? "#ffa726" : "text.secondary",
                    opacity: chat.isFavorite ? 1 : 0.6,
                    "&:hover": {
                      backgroundColor: chat.isFavorite
                        ? "rgba(255, 167, 38, 0.1)"
                        : "#e0e0e0",
                      opacity: 1,
                    },
                  }}
                >
                  {chat.isFavorite ? (
                    <StarIcon fontSize="small" />
                  ) : (
                    <StarBorderIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>

              <IconButton
                size="small"
                onClick={handleMenuClick}
                sx={{
                  ml: 0.5,
                  color: "text.secondary",
                  opacity: 0.6,
                  "&:hover": {
                    backgroundColor: "#e0e0e0",
                    opacity: 1,
                  },
                }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </ListItemButton>
      </ListItem>
    );
  }
);

ChatItem.displayName = "ChatItem";

export default ChatItem;
