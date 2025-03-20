"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CreditContext = createContext();

export function CreditProvider({ children }) {
  const storedCredits = localStorage.getItem("remainingCredits");
  const parsedCredits = storedCredits ? JSON.parse(storedCredits) : 0;
  
  const [credits, setCredits] = useState(parsedCredits);
  const [hasCredits, setHasCredits] = useState(parsedCredits !== 0);
  
  useEffect(() => {
    const checkLocalStorage = () => {
      const storedCredits = localStorage.getItem("remainingCredits");

      if (storedCredits) {
        const parsedCredits = JSON.parse(storedCredits);
        if (parsedCredits !== credits) {
          setCredits(parsedCredits);
          setHasCredits(parsedCredits !== 0); // Only false if explicitly 0
        }
      }
    };

    checkLocalStorage();
    const interval = setInterval(checkLocalStorage, 1000);

    return () => clearInterval(interval);
  }, [credits]);

  return (
    <CreditContext.Provider value={{ hasCredits, setHasCredits, credits }}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditContext);
}
