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
        <div className="flex w-full justify-between bg-gray-50">
          <Toaster position="top-center" richColors />

          <Navbar />
          <SecondNavbar />

          {msg ? (
            <>
              {msg && (
                <div className="flex flex-col w-full h-screen bg-gray-50 text-sm">
                  {/* Chat Messages Area */}
                  <div className="flex-1 overflow-y-auto px-4 py-6 max-w-4xl mx-auto w-full space-y-4">
                    <div className="animate-pulse flex flex-col gap-2">
                      <div className="self-start bg-white shadow-md py-2 px-4 rounded-2xl max-w-xs">
                        <div className="flex space-x-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="w-full sticky bottom-0 bg-gray-50 border-t border-gray-200 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-3 bg-white shadow-md rounded-t-xl">
                      <textarea
                        value={prompt}
                        onChange={controlHeight}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        rows={1}
                        className="w-full resize-none text-base text-black bg-transparent focus:outline-none max-h-[200px] overflow-y-auto rounded-md px-3 py-2 placeholder:text-gray-400"
                        style={{ minHeight: "40px" }}
                      />

                      <div className="flex justify-between items-center mt-3">
                        {/* Left Icons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowUploadDialog((prev) => !prev)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
                          >
                            <Plus
                              className="w-5 h-5 text-gray-500"
                              strokeWidth={1.5}
                            />
                          </button>

                          <button
                            onClick={() => setIsOpen(true)}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
                          >
                            <Volume2
                              className="w-5 h-5 text-gray-500"
                              strokeWidth={1.5}
                            />
                          </button>

                          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition">
                            <Mic
                              className="w-5 h-5 text-gray-500"
                              strokeWidth={1.5}
                            />
                          </button>
                        </div>

                        {/* Send Button */}
                        <button
                          onClick={handleResponse}
                          className="w-10 h-10 rounded-full flex items-center justify-center bg-black text-white hover:bg-neutral-900 transition"
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
              )}

              <div className="fixed top-3 right-5 flex items-center "></div>
            </>
          ) : (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center  ml-auto w-full relative">
              <div className="max-w-4xl w-full rounded-md p-6 text-center ">
                <h1 className="md:text-3xl mb-5 text-lg text-gray-600 md:mb-16 text-center">
                  How can I help you today?
                </h1>
                <div className="grid md:grid-cols-4 grid-cols-2 gap-6">
                  {cards.map((card, index) => (
                    <Card
                      key={index}
                      prompt={card.prompt}
                      image={card.image} // Ensure image is passed correctly
                      bgColor={card.bgColor}
                      setPrompt={setPrompt}
                    />
                  ))}
                </div>
                <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[750px] px-4 py-2 z-20">
                  <div className="w-full bg-gray-100 border border-gray-300 rounded-2xl px-4 py-2 flex justify-between shadow-sm flex-col">
                    {/* Textarea Input */}
                    <textarea
                      value={prompt}
                      onChange={controlHeight}
                      onKeyDown={handleKeyDown}
                      placeholder="Send a message..."
                      rows={1}
                      className="w-full resize-none focus:outline-none text-base text-black bg-transparent max-h-[200px] overflow-y-auto rounded-lg px-4 py-2 placeholder:text-gray-400"
                      style={{ minHeight: "40px", height: "auto" }}
                    />

                    {/* Icons and Send */}
                    <div className="flex justify-between items-center mt-2">
                      {/* Left Icons */}
                      <div className="flex gap-x-2">
                        {/* Upload */}
                        <button
                          onClick={() => setShowUploadDialog((prev) => !prev)}
                          className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white"
                        >
                          <Plus
                            className="w-5 h-5 text-gray-500"
                            strokeWidth={1.5}
                          />
                        </button>

                        {/* Speaker */}
                        <button
                          onClick={() => setIsOpen(true)}
                          className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white"
                        >
                          <Volume2
                            className="w-5 h-5 text-gray-500"
                            strokeWidth={1.5}
                          />
                        </button>

                        {/* Mic */}
                        <button className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white">
                          <Mic
                            className="w-5 h-5 text-gray-500"
                            strokeWidth={1.5}
                          />
                        </button>
                      </div>

                      {/* Send Button */}
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
            </div>
          )}
          {showPopup && <AuthPopup />}
        </div>
      ) : (
        <InsufficientBalance />
      )}
    </>
  );
};

export default page;
