import { useState, useCallback } from "react";
import {
  sendMessageStream,
  processStreamingResponse,
} from "../services/chatService";
import { createMessageSilent } from "../lib/supabase";
import { MESSAGE_ROLES } from "../utils/constants";

export const useMessageSending = (
  currentChatId,
  createNewChat,
  updateChatTitle,
  updateChatMessages,
  getCurrentChat,
  addSupabaseMessage = null,
  selectedModel = "llama-2-7b"
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  const sendMessage = useCallback(
    async (userMessage) => {
      if (isLoading || !userMessage || !userMessage.trim()) {
        return;
      }

      const messageId = Date.now();
      let chatId = currentChatId;
      let currentMessages = [];
      let currentChat = null;

      if (!chatId) {
        currentChat = await createNewChat(); // Returns the full chat object
        chatId = currentChat.id;
        currentMessages = currentChat.messages; // Empty array for new chat
      } else {
        // Get current messages from existing chat
        currentChat = getCurrentChat();
        currentMessages = currentChat?.messages || [];
      }

      setIsLoading(true);
      setIsStreaming(true);

      // Add user message
      let newUserMessage = {
        id: messageId,
        role: MESSAGE_ROLES.USER,
        content: userMessage,
        timestamp: new Date(),
      };

      // Save user message to Supabase if available
      if (addSupabaseMessage) {
        try {
          const savedMessage = await addSupabaseMessage(
            chatId,
            MESSAGE_ROLES.USER,
            userMessage
          );
          newUserMessage = {
            id: savedMessage.id,
            role: savedMessage.role,
            content: savedMessage.content,
            timestamp: savedMessage.timestamp,
            metadata: savedMessage.metadata || {},
          };
        } catch (error) {
          console.error("Error saving user message to Supabase:", error);
          // Continue with local message if Supabase fails
        }
      }

      const updatedMessages = [...currentMessages, newUserMessage];

      // Update chat with user message and title if first message
      updateChatMessages(chatId, updatedMessages);
      if (currentMessages.length === 0) {
        updateChatTitle(chatId, userMessage);
      }

      // Create assistant message placeholder
      const assistantMessageId = messageId + 1;
      const assistantMessage = {
        id: assistantMessageId,
        role: MESSAGE_ROLES.ASSISTANT,
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      const messagesWithAssistant = [...updatedMessages, assistantMessage];
      updateChatMessages(chatId, messagesWithAssistant);

      try {
        const response = await sendMessageStream(userMessage, selectedModel);

        // Keep track of accumulated content
        let accumulatedContent = "";

        await processStreamingResponse(
          response,
          // onToken
          (content) => {
            accumulatedContent += content;
            updateChatMessages(chatId, (currentMessages) => {
              return currentMessages.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedContent }
                  : msg
              );
            });
          },
          // onComplete
          async () => {
            // Just mark as not streaming - don't save to Supabase here to avoid duplicates
            // The message will be saved when the chat updates or on next page load
            updateChatMessages(chatId, (currentMessages) => {
              return currentMessages.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, isStreaming: false }
                  : msg
              );
            });

            // Save to Supabase in background without updating local state
            if (addSupabaseMessage && accumulatedContent) {
              createMessageSilent(
                chatId,
                MESSAGE_ROLES.ASSISTANT,
                accumulatedContent
              )
                .then(() => console.log("Assistant message saved to Supabase"))
                .catch((error) =>
                  console.error(
                    "Error saving assistant message to Supabase:",
                    error
                  )
                );
            }
          },
          // onError
          (error) => {
            updateChatMessages(chatId, (currentMessages) => {
              return currentMessages.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content:
                        accumulatedContent + "\n\n❌ Error receiving response",
                      isStreaming: false,
                    }
                  : msg
              );
            });
          }
        );
      } catch (error) {
        console.error("Error:", error);
        updateChatMessages(chatId, (currentMessages) => {
          return currentMessages.map((msg) =>
            msg.id === assistantMessageId
              ? {
                  ...msg,
                  content: "❌ Failed to get response from server",
                  isStreaming: false,
                }
              : msg
          );
        });
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
      }
    },
    [
      currentChatId,
      isLoading,
      createNewChat,
      updateChatTitle,
      updateChatMessages,
      getCurrentChat,
      addSupabaseMessage,
    ]
  );

  return {
    isLoading,
    isStreaming,
    sendMessage,
  };
};
