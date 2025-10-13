import { FC, ReactNode } from 'react';



const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
      <main>
        l
       {children}
      </main>
    </div>
      
  );
};

export default MainLayout;
