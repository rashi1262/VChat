"use client";
import { createContext, useState, useEffect, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatThread, setChatThread] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loadNav, setLoadNav] = useState(false);

  const syncUserId = () => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setUserId(user?.id);
      } else {
        setUserId(null);
      }
    }
  };

  const fetchChats = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-by-userid/${userId}`
      );

      const data = await res.json();

      setChatThread(data);
    } catch (error) {}
  };
  useEffect(() => {
    if (!userId) {
      setChatThread([]);
      return;
    }
  }, [userId]);

  useEffect(() => {
    window.addEventListener("storage", syncUserId);
    return () => {
      window.removeEventListener("storage", syncUserId);
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        chatThread,
        setChatThread,
        userId,
        fetchChats,
        loadNav,
        setLoadNav,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};
