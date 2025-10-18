'use client';

import { useTheme } from 'next-themes';
import { FC, ReactNode, useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { useColorPreferences } from '@/providers/color-prefrences';

const MainContent: FC<{ children: ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const { color } = useColorPreferences();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render theme/color dependent styles until mounted on client
  if (!isMounted) {
    return (
      <div className="md:px-2 md:pb-2 md:pt-14 md:h-screen bg-primary-dark">
        <main className="md:ml-[280px] lg:ml-[420px] md:h-full overflow-y-hidden bg-gray-200 dark:bg-[#232529]">
          {children}
        </main>
      </div>
    );
  }

  let backgroundColor = 'bg-primary-dark';
  if (color === 'green') {
    backgroundColor = 'bg-green-700';
  } else if (color === 'blue') {
    backgroundColor = 'bg-blue-700';
  }

  return (
    <div
      className={cn('md:px-2 md:pb-2 md:pt-14 md:h-screen', backgroundColor)}
    >
      <main
        className={cn(
          'md:ml-[280px] lg:ml-[420px] md:h-full overflow-y-hidden',
          theme === 'dark' ? 'bg-[#232529]' : 'bg-white'
        )}
      >
        {children}
      </main>
    </div>
  );
};

export default MainContent;