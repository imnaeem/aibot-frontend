import { useState, useEffect, useCallback } from "react";
import {
  getUserChats,
  createChat,
  updateChat,
  deleteChat as deleteSupabaseChat,
  createMessage,
  getChatMessages,
  deleteMessage,
  updateMessage,
  searchAndFilterChats,
} from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export const useSupabaseChats = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(null); // Track which chat is loading messages

  // Transform Supabase chat data to match local storage format
  const transformChatData = useCallback(
    (supabaseChat, includeMessages = false) => {
      return {
        id: supabaseChat.id,
        title: supabaseChat.title,
        messages:
          includeMessages && supabaseChat.messages
            ? supabaseChat.messages.map((msg) => ({
                id: msg.id,
                role: msg.role,
                content: msg.content,
                timestamp: new Date(msg.timestamp),
                metadata: msg.metadata || {},
              }))
            : [], // Empty array if messages not included
        createdAt: new Date(supabaseChat.created_at),
        updatedAt: new Date(supabaseChat.updated_at),
        isFavorite: supabaseChat.is_favorite || false,
        messagesLoaded: includeMessages, // Track if messages have been loaded
      };
    },
    []
  ); // No dependencies to prevent unnecessary re-renders

  // Load chats from Supabase
  const loadChats = useCallback(async () => {
    if (!user?.id) {
      setChats([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await getUserChats(user.id);

      if (fetchError) {
        throw fetchError;
      }

      const transformedChats =
        data?.map((chat) => transformChatData(chat, false)) || [];
      setChats(transformedChats);
    } catch (err) {
      console.error("Error loading chats:", err);
      setError(err.message);
      setChats([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]); // Only depend on user ID, not transformChatData

  // Load chats when user changes
  useEffect(() => {
    loadChats();
  }, [loadChats]);

  // Load messages for a specific chat
  const loadChatMessages = useCallback(
    async (chatId) => {
      if (!user?.id) return;

      try {
        setLoadingMessages(chatId);
        const { data, error: fetchError } = await getChatMessages(chatId);

        if (fetchError) {
          throw fetchError;
        }

        // Transform and update the specific chat with messages
        const transformedMessages =
          data?.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
            metadata: msg.metadata || {},
          })) || [];

        // Update the specific chat in state
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? { ...chat, messages: transformedMessages, messagesLoaded: true }
              : chat
          )
        );

        return transformedMessages;
      } catch (err) {
        console.error("Error loading chat messages:", err);
        setError(err.message);
        return [];
      } finally {
        setLoadingMessages(null);
      }
    },
    [user?.id]
  );

  // Create new chat in Supabase
  const createNewChat = useCallback(
    async (title = "New Chat") => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      try {
        const { data, error: createError } = await createChat(user.id, title);

        if (createError) {
          throw createError;
        }

        const newChat = transformChatData({ ...data, messages: [] }, true); // Set messagesLoaded to true for new chats
        setChats((prev) => [newChat, ...prev]);
        return newChat;
      } catch (err) {
        console.error("Error creating chat:", err);
        setError(err.message);
        throw err;
      }
    },
    [user?.id, transformChatData]
  );

  // Update chat in Supabase
  const updateChatInSupabase = useCallback(async (chatId, updates) => {
    try {
      const supabaseUpdates = {};

      if (updates.title !== undefined) {
        supabaseUpdates.title = updates.title;
      }

      if (updates.isFavorite !== undefined) {
        supabaseUpdates.is_favorite = updates.isFavorite;
      }

      const { data, error: updateError } = await updateChat(
        chatId,
        supabaseUpdates
      );

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, ...updates, updatedAt: new Date() }
            : chat
        )
      );

      return data;
    } catch (err) {
      console.error("Error updating chat:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Delete chat from Supabase
  const deleteChatFromSupabase = useCallback(async (chatId) => {
    try {
      const { error: deleteError } = await deleteSupabaseChat(chatId);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    } catch (err) {
      console.error("Error deleting chat:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Add message to chat in Supabase
  const addMessageToChat = useCallback(
    async (chatId, role, content, metadata = {}) => {
      try {
        const { data, error: messageError } = await createMessage(
          chatId,
          role,
          content,
          metadata
        );

        if (messageError) {
          throw messageError;
        }

        const newMessage = {
          id: data.id,
          role: data.role,
          content: data.content,
          timestamp: new Date(data.timestamp),
          metadata: data.metadata || {},
        };

        // Update local state - check for duplicates based on content and timestamp
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id !== chatId) return chat;

            // Check if message already exists (by content and role to avoid duplicates)
            const messageExists = chat.messages.some(
              (msg) =>
                msg.content === newMessage.content &&
                msg.role === newMessage.role &&
                Math.abs(
                  new Date(msg.timestamp) - new Date(newMessage.timestamp)
                ) < 10000 // Within 10 seconds to account for streaming delays
            );

            if (messageExists) {
              console.log("Message already exists, skipping duplicate");
              return chat;
            }

            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              updatedAt: new Date(),
            };
          })
        );

        return newMessage;
      } catch (err) {
        console.error("Error adding message:", err);
        setError(err.message);
        throw err;
      }
    },
    []
  );

  // Delete message from chat in Supabase
  const deleteMessageFromSupabase = useCallback(async (chatId, messageId) => {
    try {
      const { error: deleteError } = await deleteMessage(messageId);

      if (deleteError) {
        throw deleteError;
      }

      // Update local state
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: chat.messages.filter((msg) => msg.id !== messageId),
                updatedAt: new Date(),
              }
            : chat
        )
      );
    } catch (err) {
      console.error("Error deleting message:", err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Update message in chat in Supabase
  const updateMessageInSupabase = useCallback(
    async (chatId, messageId, content, metadata = {}) => {
      try {
        const { data, error: updateError } = await updateMessage(
          messageId,
          content,
          metadata
        );

        if (updateError) {
          throw updateError;
        }

        const updatedMessage = {
          id: data.id,
          role: data.role,
          content: data.content,
          timestamp: new Date(data.timestamp),
          metadata: data.metadata || {},
        };

        // Update local state
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.id === messageId ? updatedMessage : msg
                  ),
                  updatedAt: new Date(),
                }
              : chat
          )
        );

        return updatedMessage;
      } catch (err) {
        console.error("Error updating message:", err);
        setError(err.message);
        throw err;
      }
    },
    []
  );

  // Search and filter chats with database queries
  const searchChats = useCallback(
    async (searchQuery = "", filters = {}) => {
      if (!user?.id) {
        return { data: [], error: null };
      }

      try {
        setLoading(true);
        setError(null);
        const { data, error: searchError } = await searchAndFilterChats(
          user.id,
          searchQuery,
          filters
        );

        if (searchError) {
          throw searchError;
        }

        // Transform the data to match our local format
        const transformedChats =
          data?.map((chat) => transformChatData(chat, false)) || [];

        return { data: transformedChats, error: null };
      } catch (err) {
        console.error("Error searching chats:", err);
        setError(err.message);
        return { data: [], error: err };
      } finally {
        setLoading(false);
      }
    },
    [user?.id, transformChatData]
  );

  // Compatibility method for setting chats (like useState)
  const setChatsCompat = useCallback((newChatsOrUpdater) => {
    if (typeof newChatsOrUpdater === "function") {
      setChats((prev) => {
        const newChats = newChatsOrUpdater(prev);
        // Note: This is for local UI updates only
        // Actual persistence should use specific methods above
        return newChats;
      });
    } else {
      setChats(newChatsOrUpdater);
    }
  }, []);

  return {
    chats,
    setChats: setChatsCompat,
    loading,
    error,
    loadingMessages,
    refreshChats: loadChats,
    loadChatMessages,
    searchChats,
    createNewChat,
    updateChat: updateChatInSupabase,
    deleteChat: deleteChatFromSupabase,
    addMessage: addMessageToChat,
    deleteMessage: deleteMessageFromSupabase,
    updateMessage: updateMessageInSupabase,
  };
};
