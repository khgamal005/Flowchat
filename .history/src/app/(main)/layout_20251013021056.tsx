import { FC, ReactNode } from 'react';



const MainLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
 <ThemeProvide
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
      
  );
};

export default MainLayout;
