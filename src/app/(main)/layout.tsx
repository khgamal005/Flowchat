"use client";

import { FC, ReactNode } from "react";
import { ThemeProvider } from "@/providers/theme-provider";
import { ColorPreferencesProvider } from "@/providers/color-prefrences";
import { QueryProvider } from "@/providers/query-provider";
import MainContent from "@/components/main-content";
import { WebSocketProvider } from "@/providers/web-socket";
import { MobileNavProvider } from "@/providers/mobile-nav-context";
import MobileBottomNav from "@/components/mobile-bottom-nav";
import SocketTest from "@/components/SocketTest";

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <WebSocketProvider>
        <MobileNavProvider>
          <ColorPreferencesProvider>
            <MainContent>
              <QueryProvider>
                <div className="pb-14 md:pb-0">
                  {children}
                </div>
              </QueryProvider>
            </MainContent>
            <MobileBottomNav />
          </ColorPreferencesProvider>
        </MobileNavProvider>
      </WebSocketProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
