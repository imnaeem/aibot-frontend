import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Divider,
  List,
  ListSubheader,
  IconButton,
  MenuItem,
  Menu,
  CircularProgress,
  Tooltip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Star as StarIcon,
  MoreVert as MoreIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Delete as DeleteIcon,
  SelectAll as SelectAllIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
} from "@mui/icons-material";
import ChatItem from "./ChatItem";
import UserProfile from "../Auth/UserProfile";
import { filterChats, groupChats } from "../../utils/formatters";
import { SIDEBAR_WIDTH, CHAT_GROUPS } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";

const ChatSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  chats,
  chatsLoading,
  loadingMessages,
  currentChatId,
  searchQuery,
  setSearchQuery,
  onCreateNewChat,
  onSelectChat,
  onDeleteChat,
  onToggleFavorite,
  editingChatId,
  editingChatTitle,
  onStartEdit,
  onEditChange,
  onEditKeyPress,
  onEditBlur,
  onEditClick,
  onMenuClick,
  editInputRef,
  user,
  onSignOut,
  updateUser,
}) => {
  const { isGuest, exitGuestMode } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [profileMenuAnchor, setProfileMenuAnchor] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Bulk selection state
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState(new Set());

  // Context menu state
  const [contextMenuAnchor, setContextMenuAnchor] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setProfileMenuAnchor(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileMenuAnchor(null);
  };

  const handleEditProfile = () => {
    setProfileDialogOpen(true);
    handleProfileMenuClose();
  };

  const handleSignOut = () => {
    onSignOut();
    handleProfileMenuClose();
  };

  const filteredChats = filterChats(chats, searchQuery);
  const orderedGroups = groupChats(filteredChats);
  const totalMessages = chats.reduce(
    (total, chat) => total + chat.messages.length,
    0
  );

  // Bulk selection handlers
  const handleToggleBulkMode = () => {
    setBulkSelectMode(!bulkSelectMode);
    setSelectedChats(new Set());
  };

  const handleSelectChat = (chatId) => {
    const newSelected = new Set(selectedChats);
    if (newSelected.has(chatId)) {
      newSelected.delete(chatId);
    } else {
      newSelected.add(chatId);
    }
    setSelectedChats(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedChats.size === filteredChats.length) {
      setSelectedChats(new Set());
    } else {
      setSelectedChats(new Set(filteredChats.map((chat) => chat.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedChats.size === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedChats.size} chat(s)? This action cannot be undone.`
      )
    ) {
      try {
        // Delete selected chats
        for (const chatId of selectedChats) {
          await onDeleteChat(chatId);
        }

        // Reset bulk selection
        setSelectedChats(new Set());
        setBulkSelectMode(false);
      } catch (error) {
        console.error("Error bulk deleting chats:", error);
        alert("Some chats could not be deleted. Please try again.");
      }
    }
  };

  // Context menu handlers
  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenuAnchor({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenuAnchor(null);
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "persistent"}
      open={sidebarOpen}
      onClose={isMobile ? () => setSidebarOpen(false) : undefined}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        width: sidebarOpen ? SIDEBAR_WIDTH : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "#f8f9fa",
          borderRight: "1px solid #e0e0e0",
          boxShadow: isMobile ? "0 8px 16px rgba(0,0,0,0.1)" : "none",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ color: "text.primary", fontWeight: 500, flex: 1 }}
          >
            ChatGPT Clone
          </Typography>
          <IconButton
            onClick={() => setSidebarOpen(false)}
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {!bulkSelectMode ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={onCreateNewChat}
            sx={{
              mb: 2,
              py: 1.2,
              backgroundColor: "#1976d2",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#1565c0",
                boxShadow: "0 2px 8px rgba(25,118,210,0.3)",
              },
            }}
          >
            New Chat
          </Button>
        ) : (
          <Box sx={{ mb: 2, display: "flex", gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<DeleteIcon />}
              onClick={handleBulkDelete}
              disabled={selectedChats.size === 0}
              sx={{
                py: 1.2,
                backgroundColor: "#d32f2f",
                flex: 1,
                "&:hover": {
                  backgroundColor: "#b71c1c",
                },
                "&:disabled": {
                  backgroundColor: "#ccc",
                },
              }}
            >
              Delete ({selectedChats.size})
            </Button>
            <Button
              variant="outlined"
              startIcon={
                selectedChats.size === filteredChats.length ? (
                  <CheckBoxIcon />
                ) : (
                  <CheckBoxOutlineBlankIcon />
                )
              }
              onClick={handleSelectAll}
              sx={{
                py: 1.2,
                minWidth: "auto",
                px: 2,
              }}
            >
              {selectedChats.size === filteredChats.length ? "None" : "All"}
            </Button>
          </Box>
        )}

        <TextField
          id="search-input"
          size="small"
          placeholder="Search chats... (⌘K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "100%",
            mb: 1,
            "& .MuiOutlinedInput-root": {
              fontSize: "0.875rem",
            },
          }}
        />
      </Box>

      <Divider />

      {/* Chat List */}
      <List
        sx={{ flex: 1, overflow: "auto", py: 0 }}
        onContextMenu={handleContextMenu}
      >
        {chatsLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {Object.entries(orderedGroups).map(([groupName, groupChats]) => (
              <Box key={groupName}>
                <ListSubheader
                  sx={{
                    backgroundColor: "transparent",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color:
                      groupName === CHAT_GROUPS.FAVORITES
                        ? "#ffa726"
                        : "text.secondary",
                    px: 2,
                    py: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {groupName === CHAT_GROUPS.FAVORITES && (
                    <StarIcon sx={{ fontSize: 14, color: "#ffa726" }} />
                  )}
                  {groupName}
                </ListSubheader>

                {groupChats.map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isSelected={chat.id === currentChatId}
                    isEditing={editingChatId === chat.id}
                    editingTitle={editingChatTitle}
                    isLoadingMessages={loadingMessages === chat.id}
                    onSelect={() => onSelectChat(chat.id)}
                    onToggleFavorite={(e) => onToggleFavorite(chat.id, e)}
                    onEditChange={onEditChange}
                    onEditKeyDown={onEditKeyPress}
                    onEditBlur={onEditBlur}
                    onEditClick={onEditClick}
                    onMenuClick={(e) => onMenuClick(e, chat.id)}
                    editInputRef={editInputRef}
                    bulkSelectMode={bulkSelectMode}
                    isSelectedForBulk={selectedChats.has(chat.id)}
                    onBulkSelect={() => handleSelectChat(chat.id)}
                  />
                ))}
              </Box>
            ))}

            {filteredChats.length === 0 && searchQuery && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No chats found for "{searchQuery}"
                </Typography>
              </Box>
            )}

            {chats.length === 0 && !searchQuery && (
              <Box sx={{ p: 3, textAlign: "center" }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  No conversations yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Create your first chat to get started
                </Typography>
              </Box>
            )}
          </>
        )}
      </List>

      {/* Footer Stats */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {chats.length} conversation{chats.length !== 1 ? "s" : ""} •{" "}
          {totalMessages} messages
        </Typography>
      </Box>

      {/* User Profile Section */}
      {(user || isGuest) && (
        <>
          <Divider />
          <Box sx={{ p: 2 }}>
            {isGuest ? (
              // Guest Mode UI
              <>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "orange",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    G
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Guest User
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      Chats are stored locally
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="small"
                  onClick={() => exitGuestMode(1)} // 1 for signup tab
                  sx={{
                    textTransform: "none",
                    mb: 1,
                  }}
                >
                  Sign Up to Save Chats
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={() => exitGuestMode(0)} // 0 for signin tab
                  sx={{
                    textTransform: "none",
                    borderColor: "divider",
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                      backgroundColor: "primary.50",
                    },
                  }}
                >
                  Sign In
                </Button>
              </>
            ) : (
              // Authenticated User UI
              <>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                    }}
                  >
                    {user.user_metadata?.full_name?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase() ||
                      "?"}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.user_metadata?.full_name || "User"}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "block",
                      }}
                    >
                      {user.email}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={handleEditProfile}
                  sx={{
                    textTransform: "none",
                    borderColor: "divider",
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "primary.main",
                      color: "primary.main",
                      backgroundColor: "primary.50",
                    },
                  }}
                >
                  Edit Profile
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="small"
                  onClick={handleSignOut}
                  sx={{
                    mt: 1, // Add margin top for spacing
                    textTransform: "none",
                    borderColor: "divider",
                    color: "text.secondary",
                    "&:hover": {
                      borderColor: "error.main",
                      color: "error.main",
                      backgroundColor: "error.50",
                    },
                  }}
                >
                  Sign Out
                </Button>
              </>
            )}
          </Box>
        </>
      )}

      <UserProfile
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        user={user}
        onSignOut={onSignOut}
        updateUser={updateUser}
      />

      {/* Context Menu */}
      <Menu
        open={contextMenuAnchor !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuAnchor !== null
            ? { top: contextMenuAnchor.mouseY, left: contextMenuAnchor.mouseX }
            : undefined
        }
      >
        <MenuItem
          onClick={() => {
            handleToggleBulkMode();
            handleContextMenuClose();
          }}
          sx={{ fontSize: "0.875rem" }}
        >
          <SelectAllIcon sx={{ mr: 1.5, fontSize: 18 }} />
          {bulkSelectMode ? "Exit Bulk Select" : "Bulk Select"}
        </MenuItem>
      </Menu>
    </Drawer>
  );
};

export default ChatSidebar;
