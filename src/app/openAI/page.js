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
  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   if (typeof window !== "undefined") {
  //     try {
  //       const storedUser = localStorage.getItem("user");
  //       if (!storedUser) {
  //         router.push("/login");
  //         return;
  //       } else {
  //         const user = JSON.parse(storedUser);

  //         setUserId(user?.id);
  //       }
  //     } catch (error) {}
  //   }
  // }, []);

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
              <div className="flex w-full justify-between bg-gray-50 text-sm overflow-y-scroll">
                {/* <Navbar /> */}

                <div className="min-h-screen relative bg-gray-50 flex flex-col items-center justify-center  w-4/5">
                  <div className="max-w absolute top-4  overflow-y-scroll w-full rounded-md h-[75%] p-4 text-center  mt-20  ">
                    <div className="flex flex-col sticky  h-full w-full ">
                      <div className="flex flex-col gap-1 ">
                        {Array(1)
                          .fill(0)
                          .map((_, index) => (
                            <div
                              key={index}
                              className="animate-pulse flex flex-col gap-1 "
                            >
                              {/* <div className="self-end bg-gray-200 h-6 w-1/5 rounded-lg"></div> */}
                              <p>{msg}</p>
                              <div className="self-start bg-white shadow-lg  py-2 rounded-2xl flex items-center w-[50px] px-3">
                                <div className="flex space-x-1">
                                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="mb-5 ml-20 w-2/4 p-1 flex bg-gray-100 justify-between items-center fixed bottom-0 left-1/2 transform -translate-x-1/2  rounded-l-full rounded-r-full">
                      <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        className="w-3/4 p-1 rounded focus:outline-none text-black bg-gray-100"
                      />

                      <button
                        onClick={handleResponse}
                        className=" p-1 mr-2 rounded-full bg-white flex items-center justify-center"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <div className="w-7 h-6 p-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 18 18"
                              className="text-gray-400 CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
                            >
                              <path
                                fill="currentColor"
                                fillRule="evenodd"
                                d="M2.017 2.25c-.053.135.02.355.166.795l1.713 5.162A1 1 0 0 1 4 8.2h5.5a.8.8 0 1 1 0 1.6H4a1 1 0 0 1-.151-.014l-1.66 4.96c-.148.44-.222.66-.169.796a.4.4 0 0 0 .267.242c.14.039.352-.056.776-.247l13.45-6.053c.415-.186.622-.28.686-.409a.4.4 0 0 0 0-.356c-.064-.13-.271-.223-.685-.41L3.059 2.256c-.423-.19-.635-.285-.775-.246a.4.4 0 0 0-.267.24"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

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
