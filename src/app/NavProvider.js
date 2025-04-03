"use client";
import { createContext, useState, useEffect, useContext } from "react";

const NavContext = createContext();

export const NavProvider = ({ children }) => {
  const [isNavVisible, setIsNavVisible] = useState(true);
 
  const syncNavState = () => {
    if (typeof window !== "undefined") {
      const storedNavState = localStorage.getItem("hasLoggedIn");
      setIsNavVisible(storedNavState === "true");
    }
  };

  const toggleNav = () => {
    setIsNavVisible((prev) => {
      const newState = !prev;
      localStorage.setItem("isNavVisible", newState);
      return newState;
    });
  };

  useEffect(() => {
    syncNavState();
    window.addEventListener("storage", syncNavState);
    return () => {
      window.removeEventListener("storage", syncNavState);
    };
  }, []);

  return (
    <NavContext.Provider value={{ isNavVisible, toggleNav,setIsNavVisible }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => {
  return useContext(NavContext);
};
