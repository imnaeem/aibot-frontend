import { useState } from "react";

export const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      if (typeof newValue === "function") {
        // Use React's setValue with functional update to get latest state
        setValue((currentValue) => {
          const valueToStore = newValue(currentValue);
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          return valueToStore;
        });
      } else {
        // Direct value assignment
        setValue(newValue);
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  const removeValue = () => {
    try {
      setValue(defaultValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  };

  return [value, setStoredValue, removeValue];
};
