import { FC, ReactNode } from 'react';



const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
        layoutmo
       {children}
    </div>
      
  );
};

export default MainLayout;
