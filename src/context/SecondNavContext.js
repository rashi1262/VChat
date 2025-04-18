"use client";
import React, { createContext, useState, useEffect, useContext } from "react";

// Create the context
const SecondNavContext = createContext();

// Create the provider component
export const SecondNavProvider = ({ children }) => {
  const [isSecondNavVisible, setIsSecondNavVisible] = useState(true);

  // Function to synchronize state with localStorage
  const syncSecondNavState = () => {
    if (typeof window !== "undefined") {
      const storedState = localStorage.getItem("isSecondNavVisible");
      if (storedState !== null) {
        setIsSecondNavVisible(storedState === "true");
      }
    }
  };

  // Function to toggle the navigation visibility
  const toggleSecondNav = () => {
    setIsSecondNavVisible((prev) => {
      const newState = !prev;
      localStorage.setItem("isSecondNavVisible", newState);
      return newState;
    });
  };

  // useEffect to synchronize state on mount and set up event listener
  useEffect(() => {
    syncSecondNavState();
    window.addEventListener("storage", syncSecondNavState);
    return () => {
      window.removeEventListener("storage", syncSecondNavState);
    };
  }, []);

  return (
    <SecondNavContext.Provider
      value={{ isSecondNavVisible, toggleSecondNav, setIsSecondNavVisible }}
    >
      {children}
    </SecondNavContext.Provider>
  );
};

// Custom hook to use the SecondNavContext
export const useSecondNav = () => {
  const context = useContext(SecondNavContext);
  if (context === undefined) {
    throw new Error("useSecondNav must be used within a SecondNavProvider");
  }
  return context;
};
