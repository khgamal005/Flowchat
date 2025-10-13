"use client";

import { FC, ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { ColorPreferencesProvider } from "@/providers/color-prefrences";

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <ColorPreferencesProvider>
      
        {children}
      </ColorPreferencesProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
