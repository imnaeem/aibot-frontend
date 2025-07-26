import { useState, useCallback } from "react";
import { flushSync } from "react-dom";
import { generateChatTitle } from "../utils/formatters";
import { MESSAGE_ROLES } from "../utils/constants";

export const useChatManagement = (
  chats,
  setChats,
  currentChatId,
  setCurrentChatIdWithURL,
  supabaseActions = {}
) => {
  const {
    createNewChat: createSupabaseChat,
    updateChat: updateSupabaseChat,
    deleteChat: deleteSupabaseChat,
    addMessage: addSupabaseMessage,
    deleteMessage: deleteSupabaseMessage,
    updateMessage: updateSupabaseMessage,
  } = supabaseActions;
  // Chat editing state
  const [editingChatId, setEditingChatId] = useState(null);
  const [editingChatTitle, setEditingChatTitle] = useState("");

  const getCurrentChat = useCallback(() => {
    return chats.find((chat) => chat.id === currentChatId);
  }, [chats, currentChatId]);

  const createNewChat = useCallback(
    async (selectedModel = "llama-2-7b") => {
      try {
        console.log("🔍 createNewChat called with:", {
          selectedModel,
          hasCreateSupabaseChat: !!createSupabaseChat,
        });
        if (createSupabaseChat) {
          console.log("✅ Using Supabase chat creation");
          // Use Supabase to create chat
          const newChat = await createSupabaseChat("New Chat", selectedModel);
          flushSync(() => {
            // Ensure the chat is in local state immediately
            setChats((prev) => {
              // Check if chat already exists to avoid duplicates
              const exists = prev.some((chat) => chat.id === newChat.id);
              if (!exists) {
                // Ensure the new chat has messagesLoaded set to true for immediate use
                const chatWithFlags = { ...newChat, messagesLoaded: true };
                return [chatWithFlags, ...prev];
              }
              return prev;
            });
            setCurrentChatIdWithURL(newChat.id);
          });
          return newChat;
        } else {
          console.log(
            "⚠️ Falling back to local storage method - createSupabaseChat is not available"
          );
          // Fallback to local storage method
          const newChatId = Date.now().toString();
          const newChat = {
            id: newChatId,
            title: "New Chat",
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            isFavorite: false,
            selectedModel: selectedModel,
            messagesLoaded: true,
          };

          flushSync(() => {
            setChats((prev) => [newChat, ...prev]);
            setCurrentChatIdWithURL(newChatId);
          });

          return newChat;
        }
      } catch (error) {
        console.error(
          "❌ Error creating new chat, falling back to local:",
          error
        );
        // Fallback to local method if Supabase fails
        const newChatId = Date.now().toString();
        const newChat = {
          id: newChatId,
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          isFavorite: false,
          selectedModel: selectedModel, // Add the missing selectedModel
          messagesLoaded: true,
        };

        flushSync(() => {
          setChats((prev) => [newChat, ...prev]);
          setCurrentChatIdWithURL(newChatId);
        });

        return newChat;
      }
    },
    [setChats, setCurrentChatIdWithURL, createSupabaseChat]
  );

  const deleteChat = useCallback(
    async (chatId) => {
      try {
        if (deleteSupabaseChat) {
          // Use Supabase to delete chat
          await deleteSupabaseChat(chatId);
        } else {
          // Fallback to local storage method
          setChats((prev) => prev.filter((chat) => chat.id !== chatId));
        }

        // Handle navigation if current chat is deleted
        if (chatId === currentChatId) {
          const remainingChats = chats.filter((chat) => chat.id !== chatId);
          const newChatId =
            remainingChats.length > 0 ? remainingChats[0].id : null;
          setCurrentChatIdWithURL(newChatId);
        }
      } catch (error) {
        console.error("Error deleting chat:", error);
        // Fallback to local method if Supabase fails
        setChats((prev) => {
          const filtered = prev.filter((chat) => chat.id !== chatId);
          if (chatId === currentChatId) {
            const newChatId = filtered.length > 0 ? filtered[0].id : null;
            setCurrentChatIdWithURL(newChatId);
          }
          return filtered;
        });
      }
    },
    [
      setChats,
      currentChatId,
      setCurrentChatIdWithURL,
      deleteSupabaseChat,
      chats,
    ]
  );

  const toggleFavorite = useCallback(
    async (chatId) => {
      try {
        const chat = chats.find((c) => c.id === chatId);
        if (!chat) return;

        const newFavoriteStatus = !chat.isFavorite;

        if (updateSupabaseChat) {
          // Use Supabase to update chat
          await updateSupabaseChat(chatId, { isFavorite: newFavoriteStatus });
        } else {
          // Fallback to local storage method
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatId
                ? { ...chat, isFavorite: newFavoriteStatus }
                : chat
            )
          );
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        // Fallback to local method if Supabase fails
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, isFavorite: !chat.isFavorite }
              : chat
          )
        );
      }
    },
    [setChats, updateSupabaseChat, chats]
  );

  const updateChatTitle = useCallback(
    async (chatId, firstMessage) => {
      try {
        const title = generateChatTitle(firstMessage);

        if (updateSupabaseChat) {
          // Use Supabase to update chat title
          await updateSupabaseChat(chatId, { title });
        } else {
          // Fallback to local storage method
          setChats((prev) =>
            prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat))
          );
        }
      } catch (error) {
        console.error("Error updating chat title:", error);
        // Fallback to local method if Supabase fails
        const title = generateChatTitle(firstMessage);
        setChats((prev) =>
          prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat))
        );
      }
    },
    [setChats, updateSupabaseChat]
  );

  const updateChatMessages = useCallback(
    (chatId, newMessagesOrUpdater) => {
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === chatId) {
            const newMessages =
              typeof newMessagesOrUpdater === "function"
                ? newMessagesOrUpdater(chat.messages)
                : newMessagesOrUpdater;

            return {
              ...chat,
              messages: newMessages,
              updatedAt: new Date(),
            };
          }
          return chat;
        })
      );
    },
    [setChats]
  );

  // Chat editing functions
  const cancelEditingChat = useCallback(() => {
    setEditingChatId(null);
    setEditingChatTitle("");
  }, []);

  const startEditingChat = useCallback(
    (chatId, currentTitle) => {
      if (editingChatId && editingChatId !== chatId) {
        cancelEditingChat();
      }

      setEditingChatId(chatId);
      setEditingChatTitle(currentTitle);
    },
    [editingChatId, cancelEditingChat]
  );

  const saveEditingChat = useCallback(async () => {
    if (!editingChatId) return;

    const newTitle = editingChatTitle.trim() || "Untitled Chat";

    try {
      if (updateSupabaseChat) {
        // Use Supabase to update chat title
        await updateSupabaseChat(editingChatId, { title: newTitle });
      } else {
        // Fallback to local storage method
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === editingChatId ? { ...chat, title: newTitle } : chat
          )
        );
      }
    } catch (error) {
      console.error("Error saving chat title:", error);
      // Fallback to local method if Supabase fails
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === editingChatId ? { ...chat, title: newTitle } : chat
        )
      );
    }

    setEditingChatId(null);
    setEditingChatTitle("");
  }, [editingChatId, editingChatTitle, setChats, updateSupabaseChat]);

  const handleEditKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEditingChat();
      } else if (e.key === "Escape") {
        e.preventDefault();
        cancelEditingChat();
      }
    },
    [saveEditingChat, cancelEditingChat]
  );

  // Message operations
  const deleteMessage = useCallback(
    async (chatId, messageId) => {
      try {
        if (deleteSupabaseMessage) {
          await deleteSupabaseMessage(chatId, messageId);
        } else {
          // Fallback to local storage method
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: chat.messages.filter(
                      (msg) => msg.id !== messageId
                    ),
                    updatedAt: new Date(),
                  }
                : chat
            )
          );
        }
      } catch (error) {
        console.error("Error deleting message:", error);
        throw error;
      }
    },
    [deleteSupabaseMessage, setChats]
  );

  const updateMessage = useCallback(
    async (chatId, messageId, content) => {
      try {
        if (updateSupabaseMessage) {
          await updateSupabaseMessage(chatId, messageId, content);
        } else {
          // Fallback to local storage method
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatId
                ? {
                    ...chat,
                    messages: chat.messages.map((msg) =>
                      msg.id === messageId
                        ? { ...msg, content, updatedAt: new Date() }
                        : msg
                    ),
                    updatedAt: new Date(),
                  }
                : chat
            )
          );
        }
      } catch (error) {
        console.error("Error updating message:", error);
        throw error;
      }
    },
    [updateSupabaseMessage, setChats]
  );

  const resendMessage = useCallback(async (chatId, messageContent) => {
    try {
      // This will be handled by passing the message content back to the message sending logic
      // We return the message content so the parent component can trigger a new send
      return messageContent;
    } catch (error) {
      console.error("Error resending message:", error);
      throw error;
    }
  }, []);

  return {
    // State
    editingChatId,
    editingChatTitle,
    setEditingChatTitle,

    // Functions
    getCurrentChat,
    createNewChat,
    deleteChat,
    toggleFavorite,
    updateChatTitle,
    updateChatMessages,
    startEditingChat,
    saveEditingChat,
    cancelEditingChat,
    handleEditKeyPress,

    // Message operations
    deleteMessage,
    updateMessage,
    resendMessage,
  };
};
