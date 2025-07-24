import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import { getChatIdFromURL, updateURLWithChatId } from "../utils/formatters";

export const useUrlParams = () => {
  const [currentChatId, setCurrentChatId] = useState(getChatIdFromURL());

  const setCurrentChatIdWithURL = (chatId) => {
    flushSync(() => {
      setCurrentChatId(chatId);
    });
    updateURLWithChatId(chatId);
  };

  const clearChatFromURL = () => {
    flushSync(() => {
      setCurrentChatId(null);
    });
    updateURLWithChatId(null);
  };

  // Handle browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const chatIdFromURL = getChatIdFromURL();
      setCurrentChatId(chatIdFromURL);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Sync with URL on mount only
  useEffect(() => {
    const chatIdFromURL = getChatIdFromURL();
    if (chatIdFromURL && chatIdFromURL !== currentChatId) {
      setCurrentChatId(chatIdFromURL);
    }
  }, []); // Only run once on mount

  return {
    currentChatId,
    setCurrentChatId,
    setCurrentChatIdWithURL,
    clearChatFromURL,
  };
};
