"use client";
import { useState, useEffect } from "react";
import React from "react";
import Link from "next/link";
import Navbar from "../navbar";
import { useRouter } from "next/navigation";
import { useChat } from "../chatContext";
import { toast, Toaster } from "sonner";
import { useCredits } from "@/context/creditContext";
import InsufficientBalance from "@/components/InsufficientBalance";
import { cards, Card } from "@/components/utils";
import { AuthPopup } from "../model/page";
// import { Send } from "lucide-react";
import { Send, Plus, Mic, Volume2 } from "lucide-react";
import SecondNavbar from "../SecondNavbar";

const page = () => {
  const { hasCredits, setHasCredits } = useCredits();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prompt, setPrompt] = useState("");
  const [userId, setUserId] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { chatThread, setChatThread } = useChat();
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();

  const controlHeight = (e) => {
    const textarea = e.target;

    // Reset height to allow shrinking
    textarea.style.height = "auto";

    // Limit height to max 200px
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;

    setPrompt(textarea.value); // or setMoreChat depending on your state name
  };

  useEffect(() => {
    const handleClick = (event) => {
      const user = localStorage.getItem("user");

      if (!user) {
        const isTextarea = event.target.closest("textarea");
        if (isTextarea) {
          setShowPopup(true);
        }
      }
    };
    if (typeof window === "undefined") return;
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/login");
          return;
        } else {
          const user = JSON.parse(storedUser);

          setUserId(user?.id);
        }
      } catch (error) {}
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchUserChats = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-by-userid/${userId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch chats");
        }

        const data = await response.json();

        setChatThread(
          Array.isArray(data?.chatMessages)
            ? data.chatMessages.map((chat) => ({
                chatId: chat.id,
                message: chat.userSearch?.[0]?.userMessage || "No message",
              }))
            : []
        );
      } catch (error) {
        setChatThread([]);
      }
    };

    fetchUserChats();
  }, [userId]);

  const handleResponse = async () => {
    if (prompt == "") {
      return;
    }
    setLoading(true);
    try {
      const current = prompt;
      setMsg(current);
      setPrompt("");
      const searchRes = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/chatbot/openai?userId=${encodeURIComponent(
          userId
        )}&message=${encodeURIComponent(current)}`
      );
      if (searchRes.status === 400) {
        toast.error("Insufficient credits");
        // setHasCredits(false);
        setMsg(null);
        setLoading(false);
        return;
      }

      if (!searchRes.ok) throw new Error("Error fetching bot response");

      const data = await searchRes.json();

      const formattedResponse = data.botResponse;

      setResponse(formattedResponse);

      const createChatRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userSearch: [
              { userMessage: prompt, botResponse: formattedResponse },
            ],
            userId,
            type: "openAI",
          }),
        }
      );

      if (!createChatRes.ok) throw new Error("Failed to create chat");

      const chatData = await createChatRes.json();

      const chatHistoryRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By/${chatData.id}`
      );

      if (!chatHistoryRes.ok) throw new Error("Failed to fetch chat history");

      const chatHistory = await chatHistoryRes.json();

      if (chatHistory.userSearch?.length > 0 && chatHistory.userId === userId) {
        const firstMessage = chatHistory.userSearch[0];

        setChatThread((prev) => {
          const chatExists = prev.some((chat) => chat.chatId === chatData.id);
          if (!chatExists) {
            return [
              ...prev,
              {
                chatId: chatData.id,
                message: firstMessage.userMessage,
                type: "Gemini",
              },
            ];
          }
          return prev;
        });
      }

      router.push(`/openAIchat/${chatData.id}`);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleResponse();
    }
  };

  return (
    <>
      {hasCredits ? (
        <div className="flex min-h-screen bg-gray-50">
          <Toaster position="top-center" richColors />
          <Navbar />
          <SecondNavbar />
          <div className="flex-1 flex flex-col items-center p-4 relative">
            {msg ? (
              <div
                className="w-full max-w-4xl"
                style={{
                  height: "calc(100vh - 200px)",
                  overflowY: "auto",
                  paddingBottom: "120px",
                }}
              >
                <div className="w-full flex flex-col justify-start items-center">
                  <div className="flex flex-col gap-4 mt-16 px-4 w-full">
                    <div className="self-end bg-gray-200 text-gray-800 p-3 rounded-lg max-w-md">
                      {msg}
                    </div>
                    {loading && (
                      <div className="flex justify-start">
                        <div className="flex items-center space-x-3 px-5 py-3 rounded-xl animate-pulse w-fit max-w-sm">
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            className="animate-spin-slow"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <defs>
                              <linearGradient
                                id="sparkleGradient"
                                x1="0"
                                y1="0"
                                x2="24"
                                y2="24"
                                gradientUnits="userSpaceOnUse"
                              >
                                <stop offset="0%" stopColor="#3b82f6" />
                                <stop offset="100%" stopColor="#f9a8d4" />
                              </linearGradient>
                            </defs>
                            <path
                              fill="url(#sparkleGradient)"
                              stroke="#1f2937"
                              strokeWidth="1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
                            />
                          </svg>
                          <span className="text-gray-700 text-base font-medium">
                            Just a second
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h1 className="text-lg md:text-3xl text-gray-700 mb-20">
                  How can I help you today?
                </h1>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {cards.map((card, index) => (
                    <Card
                      key={index}
                      prompt={card.prompt}
                      image={card.image}
                      bgColor={card.bgColor}
                      setPrompt={setPrompt}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[750px] px-4 py-2 z-20">
              <div className="w-full bg-gray-100 border border-gray-300 rounded-2xl px-4 py-2 flex justify-between shadow-sm flex-col">
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    controlHeight(e);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Send a message..."
                  rows={1}
                  className="w-full resize-none focus:outline-none text-base text-black bg-transparent max-h-[200px] overflow-y-auto rounded-lg px-4 py-2 placeholder:text-gray-400"
                  style={{ minHeight: "40px", height: "auto" }}
                />
                <div className="flex justify-between items-center mt-2">
                  <div className="flex gap-x-2">
                    <button
                      onClick={() => setShowUploadDialog((prev) => !prev)}
                      className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white"
                    >
                      <Plus
                        className="w-5 h-5 text-gray-500"
                        strokeWidth={1.5}
                      />
                    </button>
                    <button
                      onClick={() => setIsOpen(true)}
                      className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white"
                    >
                      <Volume2
                        className="w-5 h-5 text-gray-500"
                        strokeWidth={1.5}
                      />
                    </button>
                    <button className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white">
                      <Mic
                        className="w-5 h-5 text-gray-500"
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                  <button
                    onClick={handleResponse}
                    className="w-10 h-10 p-2 rounded-full flex items-center justify-center shadow-sm bg-[#262626] text-white hover:bg-neutral-900 transition-all mr-1"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          {showPopup && <AuthPopup />}
        </div>
      ) : (
        <InsufficientBalance />
      )}
    </>
  );
};

export default page;
