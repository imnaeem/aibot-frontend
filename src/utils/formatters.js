// Helper function to safely format timestamps
export const formatTimestamp = (timestamp) => {
  try {
    if (!timestamp) return new Date().toLocaleTimeString();

    // Handle both Date objects and date strings
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return new Date().toLocaleTimeString();
    }

    return date.toLocaleTimeString();
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return new Date().toLocaleTimeString();
  }
};

// Generate chat title from first message
export const generateChatTitle = (firstMessage) => {
  const title =
    firstMessage.length > 40
      ? firstMessage.substring(0, 40) + "..."
      : firstMessage;
  return title || "New Chat";
};

// Helper function to group messages by date
export const groupMessagesByDate = (messages) => {
  const groups = [];
  let currentDate = null;
  let currentGroup = [];

  messages.forEach((message) => {
    const messageDate =
      message.timestamp instanceof Date
        ? message.timestamp.toDateString()
        : new Date(message.timestamp).toDateString();

    if (messageDate !== currentDate) {
      if (currentGroup.length > 0) {
        groups.push({ date: currentDate, messages: currentGroup });
      }
      currentDate = messageDate;
      currentGroup = [message];
    } else {
      currentGroup.push(message);
    }
  });

  if (currentGroup.length > 0) {
    groups.push({ date: currentDate, messages: currentGroup });
  }

  return groups;
};

// URL management functions
export const updateURLWithChatId = (chatId) => {
  if (chatId) {
    const url = new URL(window.location);
    url.searchParams.set("chat", chatId);
    window.history.replaceState({}, "", url);
  } else {
    const url = new URL(window.location);
    url.searchParams.delete("chat");
    window.history.replaceState({}, "", url);
  }
};

export const getChatIdFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("chat");
};

// Group chats by favorites and date
export const groupChats = (chats) => {
  const grouped = chats.reduce((groups, chat) => {
    // Handle favorites first
    if (chat.isFavorite) {
      if (!groups["Favorites"]) groups["Favorites"] = [];
      groups["Favorites"].push(chat);
      return groups;
    }

    // Handle regular date grouping for non-favorites
    // Ensure updatedAt is a Date object
    const updatedAt =
      chat.updatedAt instanceof Date
        ? chat.updatedAt
        : new Date(chat.updatedAt);
    const date = updatedAt.toDateString();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let groupName;
    if (date === today) groupName = "Today";
    else if (date === yesterday) groupName = "Yesterday";
    else groupName = "Earlier";

    if (!groups[groupName]) groups[groupName] = [];
    groups[groupName].push(chat);
    return groups;
  }, {});

  // Ensure favorites appear first by reordering the groups
  const orderedGroups = {};
  if (grouped["Favorites"]?.length > 0) {
    orderedGroups["Favorites"] = grouped["Favorites"];
  }
  ["Today", "Yesterday", "Earlier"].forEach((key) => {
    if (grouped[key]) {
      orderedGroups[key] = grouped[key];
    }
  });

  return orderedGroups;
};

// Filter chats based on search query
export const filterChats = (chats, searchQuery) => {
  if (!searchQuery.trim()) return chats;

  return chats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );
};
