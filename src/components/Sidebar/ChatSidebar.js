import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Stack,
  Badge,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
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
  FilterList as FilterIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import ChatItem from "./ChatItem";
import UserProfile from "../Auth/UserProfile";
import { filterChats, groupChats } from "../../utils/formatters";
import { SIDEBAR_WIDTH, CHAT_GROUPS } from "../../utils/constants";
import { useAuth } from "../../contexts/AuthContext";
import { handleError } from "../../utils/errorHandler";

const ChatSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  chats,
  chatsLoading,
  loadingMessages,
  currentChatId,
  searchQuery,
  setSearchQuery,
  searchChats,
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
  onResetFilters,
}) => {
  const { isGuest, exitGuestMode } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Bulk selection state
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedChats, setSelectedChats] = useState(new Set());

  // Context menu state
  const [contextMenuAnchor, setContextMenuAnchor] = useState(null);

  // Pagination state
  const [visibleChatsCount, setVisibleChatsCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters state
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    dateRange: null, // { start: Date, end: Date }
    dateRangeType: null, // 'today', 'week', 'month'
    isFavorite: null, // true, false, or null for all
    hasMessages: null, // true, false, or null for all
    hasAttachments: null, // true, false, or null for all
  });
  const [appliedFilters, setAppliedFilters] = useState({
    dateRange: null,
    dateRangeType: null,
    isFavorite: null,
    hasMessages: null,
    hasAttachments: null,
  });

  // Database search results state
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Error handling state
  const [error, setError] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Database search effect
  useEffect(() => {
    const performSearch = async () => {
      if (!searchChats) {
        // For guests, use frontend filtering (searchResults stays null)
        setSearchResults(null);
        return;
      }

      const hasActiveSearch =
        searchQuery.trim() ||
        Object.values(appliedFilters).some(
          (value) => value !== null && value !== undefined
        );

      if (!hasActiveSearch) {
        // No search/filters active, show all chats
        setSearchResults(null);
        setIsSearching(false);
        return;
      }

      // Unselect current chat when search/filters are active
      if (currentChatId) {
        onSelectChat(null);
      }

      try {
        setIsSearching(true);
        const { data, error } = await searchChats(searchQuery, appliedFilters);

        if (error) {
          console.error("Search error:", error);
          setSearchResults(null);
        } else {
          setSearchResults(data || []);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setSearchResults(null);
      } finally {
        setIsSearching(false);
      }
    };

    performSearch();
  }, [searchQuery, appliedFilters, searchChats]);

  // Reset pagination when search query or applied filters change
  useEffect(() => {
    setVisibleChatsCount(10);
  }, [searchQuery, appliedFilters]);

  // Handle external filter reset (e.g., from New Chat button)
  useEffect(() => {
    if (onResetFilters) {
      const resetAllFilters = () => {
        setSearchQuery("");
        setLocalFilters({
          dateRange: null,
          dateRangeType: null,
          isFavorite: null,
          hasMessages: null,
          hasAttachments: null,
        });
        setAppliedFilters({
          dateRange: null,
          dateRangeType: null,
          isFavorite: null,
          hasMessages: null,
          hasAttachments: null,
        });
        setVisibleChatsCount(10);
      };

      // Store the reset function in the parent component
      onResetFilters(resetAllFilters);
    }
  }, [onResetFilters, setSearchQuery]);

  const handleEditProfile = () => {
    setProfileDialogOpen(true);
  };

  const handleSignOut = () => {
    onSignOut();
  };

  // Use database search results if available, otherwise frontend filtering
  const filteredChats =
    searchResults !== null ? searchResults : filterChats(chats, searchQuery);
  const orderedGroups = groupChats(filteredChats);

  // Pagination logic - always show favorites, limit others
  const paginatedGroups = { ...orderedGroups };
  let nonFavoriteCount = 0;

  Object.keys(paginatedGroups).forEach((groupName) => {
    if (groupName !== CHAT_GROUPS.FAVORITES) {
      const groupChats = paginatedGroups[groupName];
      const remainingSlots = Math.max(0, visibleChatsCount - nonFavoriteCount);
      paginatedGroups[groupName] = groupChats.slice(0, remainingSlots);
      nonFavoriteCount += paginatedGroups[groupName].length;
    }
  });

  // Filter out empty groups after pagination
  const visibleGroups = {};
  Object.keys(paginatedGroups).forEach((groupName) => {
    if (paginatedGroups[groupName].length > 0) {
      visibleGroups[groupName] = paginatedGroups[groupName];
    }
  });

  const totalNonFavoriteChats = Object.keys(orderedGroups)
    .filter((key) => key !== CHAT_GROUPS.FAVORITES)
    .reduce((total, key) => total + orderedGroups[key].length, 0);

  const hasMoreChats = nonFavoriteCount < totalNonFavoriteChats;

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
        const friendlyError = handleError(error, "bulk delete chats");
        setError(friendlyError);
        setSnackbarOpen(true);
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

  // Load more chats function
  const loadMoreChats = () => {
    if (!isLoadingMore && hasMoreChats) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleChatsCount((prev) => prev + 10);
        setIsLoadingMore(false);
      }, 300); // Small delay for better UX
    }
  };

  // Scroll detection
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && hasMoreChats && !isLoadingMore) {
      loadMoreChats();
    }
  };

  // Count active filters for badge
  const activeFiltersCount = [
    appliedFilters.dateRange,
    appliedFilters.isFavorite,
    appliedFilters.hasMessages,
    appliedFilters.hasAttachments,
  ].filter((value) => value !== null && value !== undefined).length;

  // Filter handlers
  const handleApplyFilters = () => {
    setAppliedFilters({ ...localFilters });
    setFiltersOpen(false);
    setVisibleChatsCount(10); // Reset pagination when filters change
    // Unselect current chat when filters are applied
    if (currentChatId) {
      onSelectChat(null);
    }
  };

  const handleClearFilters = () => {
    setLocalFilters({
      dateRange: null,
      dateRangeType: null,
      isFavorite: null,
      hasMessages: null,
      hasAttachments: null,
    });
    setAppliedFilters({
      dateRange: null,
      dateRangeType: null,
      isFavorite: null,
      hasMessages: null,
      hasAttachments: null,
    });
    setVisibleChatsCount(10); // Reset pagination
  };

  const handleDateRangeSelect = (range) => {
    const today = new Date();
    let start, end;

    switch (range) {
      case "today":
        start = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );
        end = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59
        );
        break;
      case "week":
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      case "month":
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = today;
        break;
      default:
        start = null;
        end = null;
    }

    setLocalFilters((prev) => ({
      ...prev,
      dateRange: start && end ? { start, end } : null,
      dateRangeType: range || null,
    }));
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
            AI Bot
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
            size="small"
            startIcon={<AddIcon />}
            onClick={onCreateNewChat}
            sx={{
              mb: 2,
              height: "40px",
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

        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
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
              flex: 1,
              "& .MuiOutlinedInput-root": {
                fontSize: "0.875rem",
              },
            }}
          />
          <Tooltip title="Filters">
            <Badge
              badgeContent={activeFiltersCount > 0 ? activeFiltersCount : null}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.625rem",
                  height: "16px",
                  minWidth: "16px",
                },
              }}
            >
              <IconButton
                size="small"
                onClick={() => setFiltersOpen(true)}
                sx={{
                  width: "37px",
                  height: "37px",
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor:
                    filtersOpen || activeFiltersCount > 0
                      ? "primary.main"
                      : "rgba(0, 0, 0, 0.23)",
                  backgroundColor:
                    filtersOpen || activeFiltersCount > 0
                      ? "rgba(25, 118, 210, 0.08)"
                      : "#ffffff",
                  "&:hover": {
                    backgroundColor: "rgba(25, 118, 210, 0.04)",
                    borderColor: "rgba(0, 0, 0, 0.87)",
                  },
                  "&:focus": {
                    borderColor: "primary.main",
                  },
                }}
              >
                <FilterIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </IconButton>
            </Badge>
          </Tooltip>
        </Box>
      </Box>

      <Divider />

      {/* Chat List */}
      <List
        sx={{ flex: 1, overflow: "auto", py: 0 }}
        onContextMenu={handleContextMenu}
        onScroll={handleScroll}
      >
        {chatsLoading || isSearching ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {Object.entries(visibleGroups).map(([groupName, groupChats]) => (
              <Box key={groupName}>
                <ListSubheader
                  sx={{
                    backgroundColor: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color:
                      groupName === CHAT_GROUPS.FAVORITES
                        ? "#ffa726"
                        : "text.secondary",
                    px: 2,
                    py: 0.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    borderBottom: "1px solid #f0f0f0",
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  No chats found for "{searchQuery}"
                </Typography>
                {activeFiltersCount > 0 && (
                  <>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 2, display: "block" }}
                    >
                      {activeFiltersCount} filter
                      {activeFiltersCount > 1 ? "s" : ""} applied
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setFiltersOpen(true)}
                      sx={{ textTransform: "none", mr: 1 }}
                    >
                      Edit Filters
                    </Button>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => {
                        setAppliedFilters({
                          dateRange: null,
                          dateRangeType: null,
                          isFavorite: null,
                          hasMessages: null,
                          hasAttachments: null,
                        });
                        setLocalFilters({
                          dateRange: null,
                          dateRangeType: null,
                          isFavorite: null,
                          hasMessages: null,
                          hasAttachments: null,
                        });
                      }}
                      sx={{ textTransform: "none" }}
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </Box>
            )}

            {filteredChats.length === 0 &&
              !searchQuery &&
              activeFiltersCount > 0 && (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <FilterIcon
                    sx={{ fontSize: 48, color: "text.disabled", mb: 2 }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    No chats match your filters
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mb: 2, display: "block" }}
                  >
                    Try adjusting your filter criteria
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setFiltersOpen(true)}
                    sx={{ textTransform: "none", mr: 1 }}
                  >
                    Edit Filters
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      setAppliedFilters({
                        dateRange: null,
                        dateRangeType: null,
                        isFavorite: null,
                        hasMessages: null,
                        hasAttachments: null,
                      });
                      setLocalFilters({
                        dateRange: null,
                        dateRangeType: null,
                        isFavorite: null,
                        hasMessages: null,
                        hasAttachments: null,
                      });
                    }}
                    sx={{ textTransform: "none" }}
                  >
                    Clear All Filters
                  </Button>
                </Box>
              )}

            {chats.length === 0 && !searchQuery && activeFiltersCount === 0 && (
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

            {/* Load more indicator */}
            {hasMoreChats && (
              <Box sx={{ p: 2, textAlign: "center" }}>
                {isLoadingMore ? (
                  <CircularProgress size={20} />
                ) : (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    Scroll to load more...
                  </Typography>
                )}
              </Box>
            )}
          </>
        )}
      </List>

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

      {/* Filters Dialog */}
      <Dialog
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <FilterIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" component="div" fontWeight={600}>
              Filter Chats
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            {/* Date Range Filter */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1.5, mt: 2 }}
              >
                <CalendarIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.primary"
                >
                  Date Range
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Chip
                  label="Today"
                  variant={
                    localFilters.dateRangeType === "today"
                      ? "filled"
                      : "outlined"
                  }
                  onClick={() => handleDateRangeSelect("today")}
                  color={
                    localFilters.dateRangeType === "today"
                      ? "primary"
                      : "default"
                  }
                  sx={{
                    borderRadius: 2,
                    px: 1,
                    fontWeight: 500,
                    "&.MuiChip-filled": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                    "&:hover": {
                      backgroundColor:
                        localFilters.dateRangeType === "today"
                          ? "primary.dark"
                          : "rgba(25, 118, 210, 0.08)",
                    },
                  }}
                />
                <Chip
                  label="This Week"
                  variant={
                    localFilters.dateRangeType === "week"
                      ? "filled"
                      : "outlined"
                  }
                  onClick={() => handleDateRangeSelect("week")}
                  color={
                    localFilters.dateRangeType === "week"
                      ? "primary"
                      : "default"
                  }
                  sx={{
                    borderRadius: 2,
                    px: 1,
                    fontWeight: 500,
                    "&.MuiChip-filled": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                    "&:hover": {
                      backgroundColor:
                        localFilters.dateRangeType === "week"
                          ? "primary.dark"
                          : "rgba(25, 118, 210, 0.08)",
                    },
                  }}
                />
                <Chip
                  label="This Month"
                  variant={
                    localFilters.dateRangeType === "month"
                      ? "filled"
                      : "outlined"
                  }
                  onClick={() => handleDateRangeSelect("month")}
                  color={
                    localFilters.dateRangeType === "month"
                      ? "primary"
                      : "default"
                  }
                  sx={{
                    borderRadius: 2,
                    px: 1,
                    fontWeight: 500,
                    "&.MuiChip-filled": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                    "&:hover": {
                      backgroundColor:
                        localFilters.dateRangeType === "month"
                          ? "primary.dark"
                          : "rgba(25, 118, 210, 0.08)",
                    },
                  }}
                />
                {localFilters.dateRangeType && (
                  <Chip
                    label="Clear"
                    variant="outlined"
                    onClick={() => handleDateRangeSelect(null)}
                    deleteIcon={<CloseIcon sx={{ fontSize: 16 }} />}
                    onDelete={() => handleDateRangeSelect(null)}
                    sx={{
                      borderRadius: 2,
                      borderColor: "error.main",
                      color: "error.main",
                      "&:hover": {
                        backgroundColor: "error.50",
                        borderColor: "error.main",
                      },
                    }}
                  />
                )}
              </Stack>
            </Box>

            <Divider />

            {/* Favorites Filter */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <StarIcon sx={{ fontSize: 18, color: "warning.main" }} />
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.primary"
                >
                  Show Favorites
                </Typography>
              </Stack>
              <RadioGroup
                value={
                  localFilters.isFavorite === null
                    ? "all"
                    : localFilters.isFavorite
                    ? "favorites"
                    : "regular"
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalFilters((prev) => ({
                    ...prev,
                    isFavorite: value === "all" ? null : value === "favorites",
                  }));
                }}
                sx={{ ml: 0 }}
              >
                <FormControlLabel
                  value="all"
                  control={
                    <Radio size="small" sx={{ color: "primary.main" }} />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      All Chats
                    </Typography>
                  }
                  sx={{ mx: 0, mb: 0.5 }}
                />
                <FormControlLabel
                  value="favorites"
                  control={
                    <Radio size="small" sx={{ color: "primary.main" }} />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Favorites Only
                    </Typography>
                  }
                  sx={{ mx: 0, mb: 0.5 }}
                />
                <FormControlLabel
                  value="regular"
                  control={
                    <Radio size="small" sx={{ color: "primary.main" }} />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Regular Chats
                    </Typography>
                  }
                  sx={{ mx: 0 }}
                />
              </RadioGroup>
            </Box>

            <Divider />

            {/* Message Count Filter */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <Typography sx={{ fontSize: 18 }}>💬</Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.primary"
                >
                  Message Content
                </Typography>
              </Stack>
              <RadioGroup
                value={
                  localFilters.hasMessages === null
                    ? "all"
                    : localFilters.hasMessages
                    ? "with"
                    : "empty"
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalFilters((prev) => ({
                    ...prev,
                    hasMessages: value === "all" ? null : value === "with",
                  }));
                }}
                sx={{ ml: 0 }}
              >
                <FormControlLabel
                  value="all"
                  control={
                    <Radio size="small" sx={{ color: "primary.main" }} />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      All Chats
                    </Typography>
                  }
                  sx={{ mx: 0, mb: 0.5 }}
                />
                <FormControlLabel
                  value="with"
                  control={
                    <Radio size="small" sx={{ color: "primary.main" }} />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      With Messages
                    </Typography>
                  }
                  sx={{ mx: 0, mb: 0.5 }}
                />
                <FormControlLabel
                  value="empty"
                  control={
                    <Radio size="small" sx={{ color: "primary.main" }} />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Empty Chats
                    </Typography>
                  }
                  sx={{ mx: 0 }}
                />
              </RadioGroup>
            </Box>

            <Divider />

            {/* Attachments Filter */}
            <Box>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 1.5 }}
              >
                <Typography sx={{ fontSize: 18 }}>📎</Typography>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  color="text.primary"
                >
                  Attachments
                </Typography>
              </Stack>
              <RadioGroup
                value={
                  localFilters.hasAttachments === null
                    ? "all"
                    : localFilters.hasAttachments
                    ? "with"
                    : "without"
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setLocalFilters((prev) => ({
                    ...prev,
                    hasAttachments: value === "all" ? null : value === "with",
                  }));
                }}
                sx={{ ml: 0 }}
              >
                <FormControlLabel
                  value="all"
                  control={
                    <Radio size="small" sx={{ color: "primary.main" }} />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      All Chats
                    </Typography>
                  }
                  sx={{ mx: 0, mb: 0.5 }}
                />
                <FormControlLabel
                  value="with"
                  control={
                    <Radio size="small" sx={{ color: "primary.main" }} />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      With Attachments
                    </Typography>
                  }
                  sx={{ mx: 0, mb: 0.5 }}
                />
                <FormControlLabel
                  value="without"
                  control={
                    <Radio size="small" sx={{ color: "primary.main" }} />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Without Attachments
                    </Typography>
                  }
                  sx={{ mx: 0 }}
                />
              </RadioGroup>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            pt: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor: "#fafafa",
          }}
        >
          <Button
            onClick={handleClearFilters}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
            }}
          >
            Clear All
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => setFiltersOpen(false)}
            variant="outlined"
            color="inherit"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              px: 3,
              mr: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApplyFilters}
            variant="contained"
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              px: 4,
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              "&:hover": {
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
              },
            }}
          >
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Drawer>
  );
};

export default ChatSidebar;
