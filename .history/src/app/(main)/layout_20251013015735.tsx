import { FC, ReactNode } from 'react';


import { QueryProvider } from '@/providers/query-provider';

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
      <main>
        layout
      </main>
    </div>
      
  );
};

export default MainLayout;
