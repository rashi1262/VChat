"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChat } from "../chatContext";
import { ChevronDown, Send, Plus, Mic, Volume2 } from "lucide-react";
import VoiceToText from "@/components/VoiceToText";
import { toast, Toaster } from "sonner";
import { useCredits } from "@/context/creditContext";
import { cards, Card } from "@/components/utils";
import InsufficientBalance from "@/components/InsufficientBalance";
import Navbar from "../navbar";
import SecondNavbar from "../SecondNavbar";
import { AuthPopup } from "../model/page";
import ReactMarkdown from "react-markdown";

const Page = ({ params }) => {
  const { hasCredits } = useCredits();
  const { chatThread, setChatThread } = useChat();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [msg, setMsg] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);
  // Handle voice input
  const handleVoiceInput = (voiceText) => {
    setPrompt((prevPrompt) => prevPrompt + " " + voiceText);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Save file for later API use
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Preview
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
    setShowUploadDialog(false);
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  // Check user authentication
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/login");
          return;
        } else {
          const user = JSON.parse(storedUser);
          setEmail(user?.email || "No Email");
          setName(user?.name || "No Name");
          setUserId(user?.id);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [router]);

  // Handle textarea height
  const controlHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
    setPrompt(textarea.value);
  };

  // Show popup for unauthenticated users
  useEffect(() => {
    const handleClick = (event) => {
      const user = localStorage.getItem("user");
      if (!user && event.target.closest("textarea")) {
        setShowPopup(true);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  // Fetch user chats
  useEffect(() => {
    if (!userId) return;
    const fetchUserChats = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-by-userid/${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch chats");
        const data = await response.json();
        localStorage.setItem("remainingCredits", JSON.stringify(data.credits));
        setChatThread(
          Array.isArray(data?.chatMessages)
            ? data.chatMessages.map((chat) => ({
                chatId: chat.id,
                message: chat.userSearch?.[0]?.userMessage || "No message",
              }))
            : []
        );
      } catch (error) {
        console.error("Error fetching chats:", error);
        setChatThread([]);
      }
    };
    fetchUserChats();
  }, [userId, setChatThread]);

  // Handle Enter key for submitting prompt
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleResponse();
    }
  };

  // Navigate to chat by ID
  const getChatById = (c) => {
    router.push(`/chat/${c}`);
  };

  // Handle API response
  const handleResponse = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const current = prompt;
      setSelected(prompt);
      setMsg(current);
      setPrompt("");
      const cleanUserId = userId.trim();
      const [geminiRes, openAIRes] = await Promise.all([
        fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/search?userId=${encodeURIComponent(
            cleanUserId
          )}&message=${encodeURIComponent(current)}`
        ),
        fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/openai?userId=${encodeURIComponent(
            cleanUserId
          )}&message=${encodeURIComponent(current)}`
        ),
      ]);

      if (geminiRes.status === 402 || openAIRes.status === 400) {
        toast.error("Insufficient credits");
        setMsg(null);
        setLoading(false);
        return;
      }
      if (!geminiRes.ok || !openAIRes.ok)
        throw new Error("Error fetching bot response");

      const [geminiData, openAIData] = await Promise.all([
        geminiRes.json(),
        openAIRes.json(),
      ]);

      setResponses([
        { text: geminiData.botResponse, type: "Gemini" },
        { text: openAIData.botResponse, type: "OpenAI" },
      ]);
    } catch (error) {
      console.error("Error handling response:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Save selected response
  const chooseResponse = async (chosenResponse, modelType) => {
    try {
      const createChatRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userSearch: [
              { userMessage: selected, botResponse: chosenResponse },
            ],
            userId,
            type: modelType,
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
                type: modelType,
              },
            ];
          }
          return prev;
        });
      }
      router.push(`/Vchatmodel/${chatData.id}`);
    } catch (error) {
      console.error("Error choosing response:", error);
      toast.error(error.message);
    }
  };

  return (
    <>
      {hasCredits ? (
        <div className="flex min-h-screen bg-gray-50">
          <Toaster position="top-center" richColors />
          {/* Sidebar */}
          <Navbar />
          <SecondNavbar />

          <div className="flex-1 flex flex-col items-center p-4 relative">
            {/* Main Content Container with fixed height and scroll */}

            {msg ? (
              <div
                className="w-full max-w-4xl"
                style={{
                  height: "calc(100vh - 200px)", // Adjust based on your needs
                  overflowY: "auto",
                  paddingBottom: "120px", // Space for input area
                }}
              >
                <div className="w-full flex flex-col justify-start items-center">
                  {loading && (
                    <div className="flex flex-col gap-4 mt-16 px-4 w-full ">
                      {/* User message bubble */}
                      <div className="self-end bg-gray-200 text-gray-800 p-3 rounded-lg max-w-md">
                        {msg}
                      </div>

                      {/* Typing spinner animation */}
                      <div className="flex justify-start">
                        <div className="flex items-center space-x-3 px-5 py-3 rounded-xl  animate-pulse w-fit max-w-sm">
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
                    </div>
                  )}

                  {/* Only show responses when not loading and responses exist */}
                  {!loading && responses.length > 0 && (
                    <div className="w-full flex flex-col justify-center items-center px-4 mt-20">
                      <p className="text-center text-gray-600 text-sm mb-2">
                        Which response would you like?
                      </p>
                      <p className="text-center text-xs text-gray-500 mb-6">
                        Your response will help VChat improve
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                        {responses.map((response, index) => (
                          <div
                            key={index}
                            onClick={() =>
                              chooseResponse(response.text, response.type)
                            }
                            className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-500 hover:shadow-md transition-all cursor-pointer"
                          >
                            <div className="text-gray-800 text-sm prose max-w-none">
                              <ReactMarkdown>{response.text}</ReactMarkdown>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Source: {response.type}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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

            {/* Input Area - Fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[750px] px-4 py-2 z-20">
              <div className="w-full bg-gray-100 border border-gray-300 rounded-2xl px-4 py-2 flex justify-between shadow-sm flex-col">
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    controlHeight(e);
                    // Clear responses when user starts typing
                  }}
                  onKeyDown={(e) => {
                    handleKeyDown(e);
                    // Clear responses when user presses Enter
                    if (e.key === "Enter") {
                      setResponses([]);
                    }
                  }}
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
                    onClick={() => {
                      handleResponse();
                      // Clear responses when submitting new message
                      setResponses([]);
                    }}
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

export default Page;
