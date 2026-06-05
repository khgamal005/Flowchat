"use client";

import { SessionProvider } from "next-auth/react";
import { FC, ReactNode } from "react";

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
};

export default AuthProvider;
