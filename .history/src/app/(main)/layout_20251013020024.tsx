import { FC, ReactNode } from 'react';



const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div>
        layout
       {children}
      </main>
    </div>
      
  );
};

export default MainLayout;
