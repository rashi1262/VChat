"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CreditContext = createContext();

export function CreditProvider({ children }) {
  const [hasCredits, setHasCredits] = useState(true);
 
  const freeCredits = localStorage.getItem("credits")


  useEffect(() => {
    const checkLocalStorage = () => {
      const storedCredits = localStorage.getItem("credits");
      if (storedCredits) {
       
        if (storedCredits === '0') {
          setHasCredits(false)
        }
      }
    };
  
    checkLocalStorage();
    const interval = setInterval(checkLocalStorage, 1000);
  
    return () => clearInterval(interval);
  }, [freeCredits]);

  return (
    <CreditContext.Provider value={{ hasCredits,setHasCredits }}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditContext);
}
