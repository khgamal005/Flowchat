import { FC, ReactNode } from 'react';


import { QueryProvider } from '@/providers/query-provider';

const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
      <main></main>
    </div>
      
  );
};

export default MainLayout;
