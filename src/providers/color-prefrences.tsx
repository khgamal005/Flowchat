"use client";

import { createContext, useContext, useEffect, useState, FC, ReactNode } from "react";

export type Colors = string; // adjust to your enum or union if you have one

interface ColorPreferencesContextType {
  color: Colors;
  selectColor: (selectedColor: Colors) => void;
}

const ColorPreferencesContext = createContext<ColorPreferencesContextType | undefined>(undefined);

export const ColorPreferencesProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [color, setColor] = useState<Colors>("");

  // Load saved color from localStorage only on client
  useEffect(() => {
    const stored = localStorage.getItem("selectedColor");
    if (stored) setColor(stored as Colors);
  }, []);

  // Persist color whenever it changes
  useEffect(() => {
    if (color) localStorage.setItem("selectedColor", color);
  }, [color]);

  const selectColor = (selectedColor: Colors) => setColor(selectedColor);

  const value: ColorPreferencesContextType = { color, selectColor };

  return (
    <ColorPreferencesContext.Provider value={value}>
      {children}
    </ColorPreferencesContext.Provider>
  );
};

// Optional: Custom hook for easier access
export const useColorPreferences = (): ColorPreferencesContextType => {
  const context = useContext(ColorPreferencesContext);
  if (!context) {
    throw new Error("useColorPreferences must be used within a ColorPreferencesProvider");
  }
  return context;
};
