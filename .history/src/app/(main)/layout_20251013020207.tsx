import { FC, ReactNode } from 'react';



const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
        layoutmode
       {children}
    </div>
      
  );
};

export default MainLayout;
