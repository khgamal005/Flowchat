'use client';

import { createContext, FC, ReactNode, useContext, useState } from 'react';

type MobileNavContextType = {
  showSidebar: boolean;
  showInfoSection: boolean;
  toggleSidebar: () => void;
  toggleInfoSection: () => void;
  closeAll: () => void;
};

const MobileNavContext = createContext<MobileNavContextType>({
  showSidebar: false,
  showInfoSection: false,
  toggleSidebar: () => {},
  toggleInfoSection: () => {},
  closeAll: () => {},
});

export const useMobileNav = () => useContext(MobileNavContext);

export const MobileNavProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showInfoSection, setShowInfoSection] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
    setShowInfoSection(false);
  };

  const toggleInfoSection = () => {
    setShowInfoSection(prev => !prev);
    setShowSidebar(false);
  };

  const closeAll = () => {
    setShowSidebar(false);
    setShowInfoSection(false);
  };

  return (
    <MobileNavContext.Provider
      value={{ showSidebar, showInfoSection, toggleSidebar, toggleInfoSection, closeAll }}
    >
      {children}
    </MobileNavContext.Provider>
  );
};
