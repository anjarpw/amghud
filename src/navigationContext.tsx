import React, { createContext, useContext, useEffect, useState } from "react";

type NavigationContextType = {
  screen: string;
  navigate: (screen: string) => void;
};

const NavigationContext = createContext<NavigationContextType | null>(null);


export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

export const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
  const [screen, setScreen] = useState("");

  return (
    <NavigationContext.Provider value={{ screen, navigate: setScreen }}>
      {children}
    </NavigationContext.Provider>
  );
};
