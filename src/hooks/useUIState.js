import { useState, useCallback } from "react";

export const useUIState = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Menu state
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedChatForMenu, setSelectedChatForMenu] = useState(null);

  const openMenu = useCallback((event, chatId) => {
    setSelectedChatForMenu(chatId);
    setMenuAnchor(event.currentTarget);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuAnchor(null);
    setSelectedChatForMenu(null);
  }, []);

  const copyMessage = useCallback(async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(content);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    // Sidebar state
    sidebarOpen,
    setSidebarOpen,

    // Search state
    searchQuery,
    setSearchQuery,
    clearSearch,

    // Copy state
    copiedMessageId,
    copyMessage,

    // Scroll state
    showScrollToBottom,
    setShowScrollToBottom,

    // Menu state
    menuAnchor,
    selectedChatForMenu,
    openMenu,
    closeMenu,
  };
};
