
"use client";
import { createContext, useState, useEffect, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatThread, setChatThread] = useState([]);
  const [userId, setUserId] = useState(null);


  // const syncUserId = () => {
  //   const storedUser = localStorage.getItem("user");
  //   if (storedUser) {
  //     const user = JSON.parse(storedUser);
  //     setUserId(user?.id);
  //   } else {
  //     setUserId(null);
  //   }
  // };
 
  const syncUserId = () => {
    if (typeof window !== "undefined") { // ✅ Check if window is defined
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-by-userid/${userId}`);
      // if (!res.ok) throw new Error("Failed to fetch chats");
     
      const data = await res.json();
      console.log(data);
      setChatThread(data);
    } catch (error) {
      // console.error("Error fetching chat threads:", error);
    }
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
    <ChatContext.Provider value={{ chatThread, setChatThread, userId ,fetchChats}}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};

