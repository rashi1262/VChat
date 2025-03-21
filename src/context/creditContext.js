"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CreditContext = createContext();

export function CreditProvider({ children }) {
  const [credits, setCredits] = useState(0);
  const [hasCredits, setHasCredits] = useState(true);
  const [loading, setLoading] = useState(true); // Prevents incorrect initial state

  useEffect(() => {
    if (typeof window !== "undefined") { // ✅ Ensure it's running in the browser
      const storedCredits = localStorage.getItem("remainingCredits");
      const userExists = localStorage.getItem("user") !== null;

      if (storedCredits) {
        const parsedCredits = JSON.parse(storedCredits);
        setCredits(parsedCredits);
        setHasCredits(parsedCredits !== 0 || !userExists);
      } else {
        setHasCredits(!userExists);
      }

      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkLocalStorage = () => {
      if (typeof window !== "undefined") {
        const storedCredits = localStorage.getItem("remainingCredits");
        const userExists = localStorage.getItem("user") !== null;

        if (storedCredits) {
          const parsedCredits = JSON.parse(storedCredits);
          setCredits(parsedCredits);
          setHasCredits(parsedCredits !== 0 || !userExists);
        } else {
          setHasCredits(!userExists);
        }
      }
    };

    const interval = setInterval(checkLocalStorage, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CreditContext.Provider value={{ hasCredits, setHasCredits, credits, loading }}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditContext);
}
