import { FC, ReactNode } from 'react';



const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
        layout
       {children}
    </div>
      
  );
};

export default MainLayout;
