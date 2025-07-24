import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase, getCurrentUser, ensureUserExists } from "../lib/supabase";
import { updateURLWithChatId } from "../utils/formatters";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [preferredAuthTab, setPreferredAuthTab] = useState(0); // 0 for sign in, 1 for sign up

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        setUser(session?.user ?? null);

        // Ensure user profile exists in background (non-blocking)
        if (session?.user) {
          ensureUserExists(session.user).catch((err) =>
            console.error("Background user creation failed:", err)
          );
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        // User signed in - ensure user profile exists in background
        console.log("User signed in:", session.user.email);
        ensureUserExists(session.user).catch((err) =>
          console.error("Background user creation failed:", err)
        );
      } else if (event === "SIGNED_OUT") {
        // User signed out - clear any local data
        console.log("User signed out");
        setUser(null);
      }

      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      setIsSigningOut(true);
      // Keep chat parameter in URL even after signing out
      // updateURLWithChatId(null); // Commented out to preserve chat ID
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setLoading(false);
  };

  const exitGuestMode = (preferredTab = 0) => {
    setIsGuest(false);
    setPreferredAuthTab(preferredTab);
  };

  const value = {
    user,
    loading,
    isSigningOut,
    isGuest,
    preferredAuthTab,
    signOut,
    updateUser,
    continueAsGuest,
    exitGuestMode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
