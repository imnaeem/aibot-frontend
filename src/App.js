import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import {
  ThemeProvider,
  CssBaseline,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import theme from "./utils/theme";
import { SIDEBAR_WIDTH, STORAGE_KEY, DEFAULT_MODEL } from "./utils/constants";
import { getChatIdFromURL } from "./utils/formatters";
import { useSupabaseChats } from "./hooks/useSupabaseChats";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useUrlParams } from "./hooks/useUrlParams";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { useChatManagement } from "./hooks/useChatManagement";
import { useMessageSending } from "./hooks/useMessageSending";
import { useUIState } from "./hooks/useUIState";
import { uploadFile } from "./services/chatService";
import { getDocumentContent } from "./services/chatService";
import { getChatDocuments } from "./lib/supabase";
import ChatHeader from "./components/Layout/ChatHeader";
import MessagesList from "./components/Chat/MessagesList";
import InputArea from "./components/Chat/InputArea";
import ChatSidebar from "./components/Sidebar/ChatSidebar";
import ChatContextMenu from "./components/Sidebar/ChatContextMenu";
import DocumentPanel from "./components/Chat/DocumentPanel";
import AuthPage from "./components/Auth/AuthPage";
import LoadingScreen from "./components/shared/LoadingScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

// Main Chat Component (authenticated users and guests)
function ChatApp() {
  const {
    user,
    loading,
    isSigningOut,
    isGuest,
    signOut,
    updateUser,
    exitGuestMode,
  } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  // Use different storage based on authentication state
  const supabaseChats = useSupabaseChats();
  const [localChats, setLocalChats] = useLocalStorage(STORAGE_KEY, []);

  // Select the appropriate chat storage method
  const {
    chats,
    setChats,
    loading: chatsLoading,
    loadingMessages,
    loadChatMessages,
    searchChats,
    createNewChat: createNewSupabaseChat,
    updateChat: updateSupabaseChat,
    deleteChat: deleteSupabaseChat,
    addMessage: addSupabaseMessage,
    deleteMessage: deleteSupabaseMessage,
    updateMessage: updateSupabaseMessage,
  } = isGuest
    ? {
        chats: localChats,
        setChats: setLocalChats,
        loading: false,
        loadingMessages: null,
        loadChatMessages: null,
        searchChats: null,
        createNewChat: null,
        updateChat: null,
        deleteChat: null,
        addMessage: null,
        deleteMessage: null,
        updateMessage: null,
      }
    : supabaseChats;
  const [inputValue, setInputValue] = useState("");
  const [editingMessage, setEditingMessage] = useState(null); // Track which message we're editing
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documentPanelOpen, setDocumentPanelOpen] = useState(false);
  const [documentCount, setDocumentCount] = useState(0);
  const textareaRef = useRef(null);
  const editInputRef = useRef(null);

  const { currentChatId, setCurrentChatIdWithURL, clearChatFromURL } =
    useUrlParams();

  // Debug logging
  console.log("🔍 App.js - Chat Management Setup:", {
    isGuest,
    hasCreateNewSupabaseChat: !!createNewSupabaseChat,
    user: user?.id || "no-user",
  });

  const chatManagement = useChatManagement(
    chats,
    setChats,
    currentChatId,
    setCurrentChatIdWithURL,
    isGuest
      ? {} // No Supabase actions for guests
      : {
          createNewChat: createNewSupabaseChat,
          updateChat: updateSupabaseChat,
          deleteChat: deleteSupabaseChat,
          addMessage: addSupabaseMessage,
          deleteMessage: deleteSupabaseMessage,
          updateMessage: updateSupabaseMessage,
        }
  );

  // Load model from current chat when chat changes
  useEffect(() => {
    const currentChat = chatManagement.getCurrentChat();
    if (currentChat && currentChat.selectedModel) {
      setSelectedModel(currentChat.selectedModel);
    } else {
      setSelectedModel(DEFAULT_MODEL);
    }
  }, [currentChatId, chatManagement]);

  const messageSending = useMessageSending(
    currentChatId,
    chatManagement.createNewChat,
    chatManagement.updateChatTitle,
    chatManagement.updateChatMessages,
    chatManagement.getCurrentChat,
    isGuest ? null : addSupabaseMessage,
    selectedModel,
    selectedDocument
  );
  const uiState = useUIState();

  // Load initial chat from URL on component mount (only once)
  useEffect(() => {
    const chatIdFromURL = getChatIdFromURL();
    if (chatIdFromURL && !currentChatId) {
      setCurrentChatIdWithURL(chatIdFromURL);
    }
  }, []); // Run only once on mount

  // Load messages for initial chat when chats are loaded
  useEffect(() => {
    const loadInitialChatMessages = async () => {
      if (currentChatId && !chatsLoading && loadChatMessages && !isGuest) {
        const selectedChat = chats.find((chat) => chat.id === currentChatId);
        if (selectedChat && !selectedChat.messagesLoaded) {
          await loadChatMessages(currentChatId);
        }
      }
    };

    loadInitialChatMessages();
  }, [currentChatId, chatsLoading, loadChatMessages, isGuest, chats]);

  // Update page title based on current chat
  useEffect(() => {
    const currentChat = chatManagement.getCurrentChat();
    if (currentChat) {
      document.title = `${currentChat.title} - AI Bot`;
    } else {
      document.title = "AI Bot";
    }
  }, [currentChatId, chats, chatManagement]);

  // Create new chat with current model
  const handleCreateNewChat = useCallback(async () => {
    return await chatManagement.createNewChat(selectedModel);
  }, [chatManagement.createNewChat, selectedModel]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: handleCreateNewChat,
    onToggleSidebar: uiState.toggleSidebar,
    onFocusInput: () => textareaRef.current?.focus(),
    onCancelEdit: chatManagement.cancelEditingChat,
    onToggleSearch: uiState.toggleSearch,
  });

  const handleSendMessage = async (messageText) => {
    const messageToSend = messageText || inputValue;
    if (!messageToSend.trim()) return;

    if (editingMessage) {
      // We're editing and resending - delete the original message and its AI response first
      try {
        const currentChat = chatManagement.getCurrentChat();
        if (currentChat) {
          const messageIndex = currentChat.messages.findIndex(
            (msg) => msg.id === editingMessage.id
          );
          if (messageIndex !== -1) {
            // Delete the original user message and any assistant response that follows
            const messagesToDelete = [];
            messagesToDelete.push(currentChat.messages[messageIndex]); // User message

            // Check if there's an assistant response right after
            if (
              messageIndex + 1 < currentChat.messages.length &&
              currentChat.messages[messageIndex + 1].role === "assistant"
            ) {
              messagesToDelete.push(currentChat.messages[messageIndex + 1]); // Assistant response
            }

            // Delete messages from database and local state
            for (const msg of messagesToDelete) {
              await chatManagement.deleteMessage(currentChatId, msg.id);
            }
          }
        }

        setEditingMessage(null);
        // Send the edited message as a new message
        messageSending.sendMessage(messageToSend);
        setInputValue("");
      } catch (error) {
        console.error("Failed to delete original message:", error);
        // Still send the new message even if deletion fails
        setEditingMessage(null);
        messageSending.sendMessage(messageToSend);
        setInputValue("");
      }
    } else {
      // Send new message
      messageSending.sendMessage(messageToSend);
      if (!messageText) setInputValue(""); // Only clear input if not from resend
    }
  };

  const handleResendMessage = async (chatId, messageContent) => {
    const result = await chatManagement.resendMessage(chatId, messageContent);
    if (result) {
      handleSendMessage(result);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setInputValue(message.content);
    // Focus the input area
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setInputValue("");
  };

  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
    // Document deletion is now handled in DocumentPanel
  };

  const handleDeleteDocument = (documentId) => {
    setDocumentCount((prev) => Math.max(0, prev - 1));
    // Document deletion is now handled in DocumentPanel
  };

  // Update document count when documents change
  const handleDocumentUpload = (newDocument) => {
    setDocumentCount((prev) => prev + 1);
    // Document upload is now handled in DocumentPanel
    console.log("New document uploaded:", newDocument);
  };

  const handleOpenDocuments = () => {
    setDocumentPanelOpen(!documentPanelOpen); // Toggle the panel
  };

  const handleCloseDocuments = () => {
    setDocumentPanelOpen(false);
  };

  // Load document count for current chat
  useEffect(() => {
    if (currentChatId && user && !isGuest) {
      const loadDocumentCount = async () => {
        try {
          const { data, error } = await getChatDocuments(currentChatId);
          if (!error && data) {
            setDocumentCount(data.length);
          }
        } catch (error) {
          console.error("Error loading document count:", error);
        }
      };
      loadDocumentCount();
    } else {
      setDocumentCount(0);
    }
  }, [currentChatId, user, isGuest]);

  const handleModelChange = useCallback(
    async (modelId) => {
      setSelectedModel(modelId);

      // Persist model to current chat if one exists
      const currentChat = chatManagement.getCurrentChat();
      if (currentChatId && currentChat) {
        try {
          // Update local state immediately
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === currentChatId
                ? { ...chat, selectedModel: modelId, updatedAt: new Date() }
                : chat
            )
          );

          // Update in database if available
          if (updateSupabaseChat && !isGuest) {
            await updateSupabaseChat(currentChatId, { selectedModel: modelId });
          }
        } catch (error) {
          console.error("Failed to save model to chat:", error);
        }
      }
    },
    [currentChatId, chatManagement, setChats, updateSupabaseChat, isGuest]
  );

  const handleMenuClick = useCallback(
    (event, chatId) => {
      event.preventDefault();
      event.stopPropagation();
      uiState.openMenu(event, chatId);
    },
    [uiState.openMenu]
  );

  const handleSelectChat = useCallback(
    (chatId) => {
      // Set current chat ID immediately for UI responsiveness
      setCurrentChatIdWithURL(chatId);

      // Load messages asynchronously if not already loaded (for Supabase chats)
      if (loadChatMessages && !isGuest) {
        const selectedChat = chats.find((chat) => chat.id === chatId);
        if (selectedChat && !selectedChat.messagesLoaded) {
          // Load messages in background without blocking UI
          loadChatMessages(chatId).catch(console.error);
        }
      }

      // Close sidebar on mobile when selecting a chat
      if (isMobile) {
        uiState.setSidebarOpen(false);
      }
    },
    [
      currentChatId,
      setCurrentChatIdWithURL,
      loadChatMessages,
      isGuest,
      chats,
      isMobile,
      uiState.setSidebarOpen,
    ]
  );

  const handleStartEditing = (chatId, title) => {
    chatManagement.startEditingChat(chatId, title);
    setTimeout(() => {
      if (editInputRef.current) {
        try {
          editInputRef.current.focus();
          editInputRef.current.select();
        } catch (error) {
          console.warn("Could not focus/select edit input:", error);
        }
      }
    }, 150);
  };

  // Get current data
  const currentChat = chatManagement.getCurrentChat();
  const messages = currentChat?.messages || [];
  const selectedChatForMenu = useMemo(() => {
    return chats.find((chat) => chat.id === uiState.selectedChatForMenu);
  }, [chats, uiState.selectedChatForMenu]);

  useEffect(() => {
    setSelectedDocument(null);
  }, [currentChatId]);

  if (loading) {
    return <LoadingScreen message="Initializing..." />;
  }

  if (isSigningOut) {
    return <LoadingScreen message="Logging out..." />;
  }

  if (!user && !isGuest) {
    return <AuthPage />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#ffffff",
        overflow: "hidden", // Prevent scroll on mobile
      }}
    >
      <ChatSidebar
        sidebarOpen={uiState.sidebarOpen}
        setSidebarOpen={uiState.setSidebarOpen}
        searchQuery={uiState.searchQuery}
        setSearchQuery={uiState.setSearchQuery}
        chats={chats}
        chatsLoading={chatsLoading}
        loadingMessages={loadingMessages}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onCreateNewChat={handleCreateNewChat}
        onDeleteChat={chatManagement.deleteChat}
        onToggleFavorite={chatManagement.toggleFavorite}
        editingChatId={chatManagement.editingChatId}
        editingChatTitle={chatManagement.editingChatTitle}
        onStartEdit={handleStartEditing}
        onEditChange={(e) => chatManagement.setEditingChatTitle(e.target.value)}
        onEditKeyPress={chatManagement.handleEditKeyPress}
        onEditBlur={chatManagement.saveEditingChat}
        onEditClick={(e) => e.stopPropagation()}
        onMenuClick={handleMenuClick}
        editInputRef={editInputRef}
        user={user}
        onSignOut={signOut}
        updateUser={updateUser}
        searchChats={isGuest ? null : searchChats}
        uploadedDocuments={uploadedDocuments}
        selectedDocument={selectedDocument}
        onSelectDocument={handleSelectDocument}
        onDeleteDocument={handleDeleteDocument}
      />

      <ChatContextMenu
        anchorEl={uiState.menuAnchor}
        open={Boolean(uiState.menuAnchor)}
        selectedChat={selectedChatForMenu}
        onClose={uiState.closeMenu}
        onRename={(chatId, title) => {
          handleStartEditing(chatId, title);
          uiState.closeMenu();
        }}
        onToggleFavorite={(chatId) => {
          chatManagement.toggleFavorite(chatId);
          uiState.closeMenu();
        }}
        onDelete={(chatId) => {
          chatManagement.deleteChat(chatId);
          uiState.closeMenu();
        }}
      />

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <ChatHeader
          sidebarOpen={uiState.sidebarOpen}
          setSidebarOpen={uiState.setSidebarOpen}
          currentChat={currentChat}
          isStreaming={messageSending.isStreaming}
          messagesCount={messages.length}
          isGuest={isGuest}
          isLoadingMessages={currentChatId && loadingMessages === currentChatId}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          selectedDocument={selectedDocument}
        />

        {/* Main Content Area */}
        <Box
          sx={{
            display: "flex",
            flex: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Chat Content */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Messages */}
            <MessagesList
              messages={messages}
              sidebarOpen={uiState.sidebarOpen}
              onCopyMessage={uiState.copyMessage}
              copiedMessageId={uiState.copiedMessageId}
              showScrollToBottom={uiState.showScrollToBottom}
              onScrollStateChange={uiState.setShowScrollToBottom}
              onDeleteMessage={chatManagement.deleteMessage}
              onUpdateMessage={handleEditMessage}
              onResendMessage={handleResendMessage}
              currentChatId={currentChatId}
              isLoadingMessages={
                currentChatId && loadingMessages === currentChatId
              }
            />

            {/* Input Area */}
            <InputArea
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSendMessage={() => handleSendMessage()}
              isLoading={messageSending.isLoading}
              sidebarOpen={uiState.sidebarOpen}
              textareaRef={textareaRef}
              editingMessage={editingMessage}
              onCancelEdit={handleCancelEdit}
              onOpenDocuments={handleOpenDocuments}
              documentCount={documentCount}
            />
          </Box>

          {/* Document Panel */}
          <DocumentPanel
            open={documentPanelOpen}
            onClose={handleCloseDocuments}
            currentChatId={currentChatId}
            selectedDocument={selectedDocument}
            onSelectDocument={handleSelectDocument}
            onDocumentUpload={handleDocumentUpload}
            onDeleteDocument={handleDeleteDocument}
          />
        </Box>
      </Box>
    </Box>
  );
}

// Main App Component with Auth Provider
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ChatApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
