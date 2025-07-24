import { useEffect } from "react";
import { KEYBOARD_SHORTCUTS } from "../utils/constants";

export const useKeyboardShortcuts = ({
  onSearchFocus,
  onEscapePress,
  isEditingChat,
}) => {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === KEYBOARD_SHORTCUTS.SEARCH) {
        e.preventDefault();
        onSearchFocus?.();
      }

      // Escape to close sidebar on mobile or cancel editing
      if (e.key === KEYBOARD_SHORTCUTS.ESCAPE) {
        if (isEditingChat) {
          onEscapePress?.("editing");
        } else if (window.innerWidth < 768) {
          onEscapePress?.("sidebar");
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [onSearchFocus, onEscapePress, isEditingChat]);
};
