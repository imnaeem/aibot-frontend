import React from "react";
import { Menu, MenuItem } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from "@mui/icons-material";

const ChatContextMenu = React.memo(
  ({
    anchorEl,
    open,
    onClose,
    selectedChat,
    onRename,
    onToggleFavorite,
    onDelete,
  }) => {
    const handleRename = () => {
      if (selectedChat) {
        onRename(selectedChat.id, selectedChat.title);
      }
      onClose();
    };

    const handleToggleFavorite = () => {
      if (selectedChat) {
        onToggleFavorite(selectedChat.id);
      }
      onClose();
    };

    const handleDelete = () => {
      if (selectedChat) {
        onDelete(selectedChat.id);
      }
      onClose();
    };

    return (
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        disableAutoFocusItem
        disableRestoreFocus
        disableScrollLock
        slotProps={{
          paper: {
            elevation: 8,
            sx: {
              minWidth: 160,
              mt: 0.5,
              "& .MuiMenuItem-root": {
                fontSize: "0.875rem",
                minHeight: 32,
              },
            },
          },
        }}
      >
        <MenuItem onClick={handleRename}>
          <EditIcon sx={{ mr: 1, fontSize: 18 }} />
          Rename
        </MenuItem>

        <MenuItem onClick={handleToggleFavorite}>
          {selectedChat?.isFavorite ? (
            <>
              <StarIcon sx={{ mr: 1, fontSize: 18, color: "#ffa726" }} />
              Remove from Favorites
            </>
          ) : (
            <>
              <StarIcon sx={{ mr: 1, fontSize: 18 }} />
              Add to Favorites
            </>
          )}
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 18 }} />
          Delete
        </MenuItem>
      </Menu>
    );
  }
);

ChatContextMenu.displayName = "ChatContextMenu";

export default ChatContextMenu;
