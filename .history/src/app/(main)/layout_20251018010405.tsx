"use client";

import { FC, ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { ColorPreferencesProvider } from "@/providers/color-prefrences";
import MainContent from "@/components/main-content";

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
            <WebSocketProvider></WebSocketProvider>

      <ColorPreferencesProvider>
        <MainContent>{children}</MainContent>
      </ColorPreferencesProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
