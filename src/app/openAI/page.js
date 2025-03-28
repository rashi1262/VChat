"use client";

import { useState, useEffect } from "react";
import React from "react";
import Link from "next/link";
import Navbar from "../navbar";
import { useRouter } from "next/navigation";
import { useChat } from "../chatContext";
import { toast, Toaster } from "sonner";
import { useCredits } from "@/context/creditContext";
export const cards = [
  {
    prompt: "Solve a debate: which came first, the chiken or the egg?",
    image: "/assests/icon1.svg",
  },
  {
    prompt:
      "I want to get promated at work.Lat's make a detailed plan together.",
    image: "/assests/icon2.svg",
  },
  {
    prompt: "Describe how blockchain technology works.",
    image: "/assests/icon3.svg",
  },
  {
    prompt: "Can you help me brainstorm ideas for a brand campaign",
    image: "/assests/icon4.svg",
  },
];
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
  const router = useRouter();
  useEffect(() => {
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
        setHasCredits(false);
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

          {msg ? (
            <>
              <div className="flex w-full justify-between bg-gray-50 text-sm overflow-y-scroll">
                <Navbar />

                <div className="min-h-screen relative bg-gray-50 flex flex-col items-center justify-center  w-4/5">
                  <div className="max-w absolute top-4  overflow-y-scroll w-full rounded-md h-[75%] p-4 text-center  mt-20  ">
                    <div className="flex flex-col sticky  h-full w-full ">
                      <div className="flex flex-col gap-1 mr-36">
                        {Array(1)
                          .fill(0)
                          .map((_, index) => (
                            <div
                              key={index}
                              className="animate-pulse flex flex-col gap-1 mr-36"
                            >
                              <div className="self-end bg-gray-200 h-6 w-1/5 rounded-lg"></div>

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
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center  ml-auto w-full md:max-w-[calc(100%-256px)]">
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
                <div className="mb-5 w-full md:ml-20 md:w-2/4 p-1 flex bg-gray-100 justify-between items-center fixed bottom-0 left-1/2 transform -translate-x-1/2 rounded-l-full rounded-r-full">
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
                    className="p-1 mr-2 rounded-full flex items-center justify-center bg-white"
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
          )}
        </div>
      ) : (
        <div className="z-50 fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="bg-neutral-800 p-12  w-96 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl  font-bold">Insufficient Credit</h2>
            <p className=" p-2  text-lg ">
              You hit your free credit limit .Please Consider buying our plans
              for uninterrupted services
            </p>
            <div className=" p-2 mt-4">
              <Link href="/plans">Show Plans</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default page;
const Card = ({ prompt, image, bgColor, setPrompt }) => {
  return (
    <div
      className={`relative border rounded-md p-4 hover:bg-white cursor-pointer ${bgColor}`}
      onClick={() => setPrompt(prompt)}
    >
      <div className="w-10 h-10 mb-2">
        <img
          src={image}
          alt="Card image"
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-gray-500 text-sm">{prompt}</p>
    </div>
  );
};
