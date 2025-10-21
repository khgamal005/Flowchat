"use client";

import { FC, ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { ColorPreferencesProvider } from "@/providers/color-prefrences";
import { QueryProvider } from "@/providers/query-provider";
import MainContent from "@/components/main-content";

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <WebSocketProvider>
        <ColorPreferencesProvider>
          <MainContent>
            <QueryProvider>{children}</QueryProvider>
          </MainContent>
        </ColorPreferencesProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
