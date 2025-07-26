import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const signUp = async (email, password, fullName = null) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName || email.split("@")[0], // Use provided name or fallback to email prefix
      },
    },
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

export const getSession = () => {
  return supabase.auth.getSession();
};

// Ensure user exists in public.users table
export const ensureUserExists = async (authUser) => {
  if (!authUser) return;

  try {
    // Check if user already exists
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("id")
      .eq("id", authUser.id)
      .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no user found

    if (selectError && selectError.code !== "PGRST116") {
      console.error("Error checking user existence:", selectError);
      return;
    }

    if (!existingUser) {
      // Create user if doesn't exist
      const { error } = await supabase.from("users").insert([
        {
          id: authUser.id,
          email: authUser.email,
          full_name:
            authUser.user_metadata?.full_name || authUser.email.split("@")[0],
          avatar_url: authUser.user_metadata?.avatar_url || null,
        },
      ]);

      if (error) {
        console.error("Error creating user profile:", error);
      } else {
        console.log("User profile created successfully");
      }
    }
  } catch (error) {
    console.error("Error ensuring user exists:", error);
  }
};

// Database helpers
export const getUserChats = async (userId) => {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return { data, error };
};

// Search and filter chats with database-level querying
export const searchAndFilterChats = async (
  userId,
  searchQuery = "",
  filters = {}
) => {
  let query = supabase
    .from("chats")
    .select(
      `
      *,
      messages:messages(id, content, role)
    `
    )
    .eq("user_id", userId);

  // Apply search query if provided
  if (searchQuery && searchQuery.trim()) {
    // Search in chat titles
    query = query.or(
      `title.ilike.%${searchQuery}%,messages.content.ilike.%${searchQuery}%`
    );
  }

  // Apply filters
  if (filters.isFavorite !== null && filters.isFavorite !== undefined) {
    query = query.eq("is_favorite", filters.isFavorite);
  }

  // Apply date range filter
  if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
    query = query
      .gte("created_at", filters.dateRange.start.toISOString())
      .lte("created_at", filters.dateRange.end.toISOString());
  }

  // Order by updated_at
  query = query.order("updated_at", { ascending: false });

  const { data, error } = await query;

  // Filter by message count on the client side (since it's complex to do in SQL)
  let filteredData = data;
  if (filters.hasMessages !== null && filters.hasMessages !== undefined) {
    filteredData = data?.filter((chat) => {
      const hasMessages = chat.messages && chat.messages.length > 0;
      return filters.hasMessages ? hasMessages : !hasMessages;
    });
  }

  return { data: filteredData, error };
};

export const getUserChatsWithMessages = async (userId) => {
  const { data, error } = await supabase
    .from("chats")
    .select(
      `
      *,
      messages (*)
    `
    )
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return { data, error };
};

export const createChat = async (
  userId,
  title,
  selectedModel = "llama-2-7b"
) => {
  console.log("🔍 createChat called with:", { userId, title, selectedModel });

  const { data, error } = await supabase
    .from("chats")
    .insert([
      {
        user_id: userId,
        title,
        selected_model: selectedModel,
        // Remove manual timestamps - let database defaults handle it
      },
    ])
    .select()
    .single();

  console.log("📊 createChat result:", { data, error });
  return { data, error };
};

export const updateChat = async (chatId, updates) => {
  const { data, error } = await supabase
    .from("chats")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", chatId)
    .select()
    .single();

  return { data, error };
};

export const deleteChat = async (chatId) => {
  const { error } = await supabase.from("chats").delete().eq("id", chatId);

  return { error };
};

export const createMessage = async (chatId, role, content, metadata = {}) => {
  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        chat_id: chatId,
        role,
        content,
        metadata,
        timestamp: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  return { data, error };
};

// Create message without expecting it to be added to local state (for background saves)
export const createMessageSilent = async (
  chatId,
  role,
  content,
  metadata = {}
) => {
  const { error } = await supabase.from("messages").insert([
    {
      chat_id: chatId,
      role,
      content,
      metadata,
      timestamp: new Date().toISOString(),
    },
  ]);

  return { error };
};

export const getChatMessages = async (chatId) => {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("timestamp", { ascending: true });

  return { data, error };
};

export const deleteMessage = async (messageId) => {
  const { error } = await supabase
    .from("messages")
    .delete()
    .eq("id", messageId);

  return { error };
};

export const updateMessage = async (messageId, content, metadata = {}) => {
  const { data, error } = await supabase
    .from("messages")
    .update({
      content,
      metadata,
    })
    .eq("id", messageId)
    .select()
    .single();

  return { data, error };
};
