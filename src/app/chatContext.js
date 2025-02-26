// "use client";
// import { createContext, useContext, useEffect, useState } from "react";

// const ChatContext = createContext();

// export const ChatProvider = ({ children }) => {
//   const [chatThread, setChatThread] = useState(() => {
//     if (typeof window !== "undefined") {
//       return JSON.parse(localStorage.getItem("chatThread")) || [];
//     }
//     return [];
//   });

//   // Save chatThread to localStorage when it updates
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("chatThread", JSON.stringify(chatThread));
//     }
//   }, [chatThread]);

//   return (
//     <ChatContext.Provider value={{ chatThread, setChatThread }}>
//       {children}
//     </ChatContext.Provider>
//   );
// };

// export const useChat = () => useContext(ChatContext);

"use client";
import { createContext, useState, useEffect, useContext } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chatThread, setChatThread] = useState([]);
  const [userId, setUserId] = useState(null);

  // Function to update userId when localStorage changes
  const syncUserId = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user?.id);
    } else {
      setUserId(null);
    }
  };

  // Fetch chats when userId changes
  useEffect(() => {
    if (!userId) {
      setChatThread([]); // Clear chat if no user is logged in
      return;
    }

    const fetchChats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By-User/${userId}`);
        if (!res.ok) throw new Error("Failed to fetch chats");
        const data = await res.json();
        setChatThread(data);
      } catch (error) {
        console.error("Error fetching chat threads:", error);
      }
    };

    fetchChats();
  }, [userId]); // Re-fetch chats whenever userId changes

  // Listen for login changes across tabs
  useEffect(() => {
    window.addEventListener("storage", syncUserId);
    return () => {
      window.removeEventListener("storage", syncUserId);
    };
  }, []);

  return (
    <ChatContext.Provider value={{ chatThread, setChatThread, userId }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};

