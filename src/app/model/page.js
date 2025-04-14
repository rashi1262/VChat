"use client";

import { useState, useEffect } from "react";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChat } from ".././chatContext";
import { toast, Toaster } from "sonner";
import { useCredits } from "@/context/creditContext";
import ReactMarkdown from "react-markdown";
import VoiceToText from "@/components/VoiceToText";

import Navbar from "../navbar";
import { ChevronDown } from "lucide-react";
import InsufficientBalance from "@/components/InsufficientBalance";

export const cards = [
  {
    prompt: "Solve a debate: is a hot dog a sandwich?",
    image: "/assests/icon1.svg",
  },
  {
    prompt:
      "I'm thinking about moving to a new city. Can you help me plan the move?",
    image: "/assests/icon2.svg",
  },
  {
    prompt: "Can you help me write a bedtime story?",
    image: "/assests/icon3.svg",
  },
  {
    prompt: "Get advice on preparing for a job interview.",
    image: "/assests/icon4.svg",
  },
];

const page = ({ params }) => {
  const { hasCredits } = useCredits();
  const { chatThread, setChatThread } = useChat();
  const [showPopup, setShowPopup] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [msg, setMsg] = useState("");

  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [creditPopup, setShowCreditPopup] = useState(false);

  const handleVoiceInput = (voiceText) => {
    setPrompt((prevPrompt) => prevPrompt + " " + voiceText);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasLoggedIn = localStorage.getItem("hasLoggedIn") === "true";
      setShowPopup(!hasLoggedIn);
    }
  }, []);

  const handleRedirect = (path) => {
    localStorage.setItem("showPopup", "false");

    setTimeout(() => {
      window.location.href = path;
    }, 100);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/model");
          return;
        } else {
          const user = JSON.parse(storedUser);
          setEmail(user?.email || "No Email");
          setName(user?.name || "No Name");
          setUserId(user?.id);
        }
      } catch (error) {

      }
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
        }/chatbot/search?userId=${encodeURIComponent(
          userId
        )}&message=${encodeURIComponent(current)}`
      );
      if (searchRes.status === 402) {
        setShowCreditPopup(true);
        toast.error("Insufficient credits");

        setMsg(null);
        setLoading(false);
        return;
      }

      if (!searchRes.ok) throw new Error("Error fetching bot response");

      const data = await searchRes.json();

      if (
        typeof window !== "undefined" &&
        data?.remainingCredits !== undefined
      ) {
        localStorage.setItem("remainingCredits", data.remainingCredits);
      }

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
            type: "Gemini",
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

      router.push(`/chat/${chatData.id}`);
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
        <div className="bg-gray-50">
          ``
          <Toaster position="top-center" richColors />
          <div className="flex w-full justify-between bg-gray-50 text-sm">
            <Navbar />

            {msg ? (
              <>
                <div className="flex w-full justify-between bg-gray-50 text-sm overflow-y-scroll">
                  <Navbar />

                  <div className="min-h-screen relative bg-gray-50 flex flex-col items-center justify-center  w-[80%]">
                    <div className="max-w absolute top-4  overflow-y-scroll w-full rounded-md h-[75%] p-4 text-center  mt-20  ">
                      <div className="flex flex-col sticky  h-full w-full ">
                        <div className="flex flex-col gap-1 mr-36">
                          {Array(1)
                            .fill(0)
                            .map((_, index) => (
                              <div
                                className="flex flex-col gap-2 p-4"
                                key={index}
                              >
                                {/* User Message - Right Side */}
                                <div className="flex justify-end">
                                  <div className="bg-gray-500 text-white w-fit max-w-[70%] px-4 py-2 rounded-lg text-left">
                                    {msg}
                                  </div>
                                </div>

                                {/* Bot Typing - Left Side */}
                                <div className="flex justify-start">
                                  <div className="bg-gray-300 w-fit px-4 py-1 rounded-lg animate-pulse text-left">
                                    <span className="text-gray-600 font-mono after:content-[''] after:animate-typing-dots inline-block">
                                      typing
                                    </span>
                                  </div>
                                </div>

                              </div>

                            ))}
                        </div>
                      </div>

                      <div className="mb-5 ml-20 w-2/4 p-1 flex bg-white justify-between items-center fixed bottom-0 left-1/2 transform -translate-x-1/2  rounded-l-full rounded-r-full">
                        <input
                          type="text"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Send a ..."
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
              <>
                <div className="h-screen w-full bg-gray-50  flex-col items-center justify-center  hidden">
                  <div className="max-w-4xl w-full  rounded-md p-6 text-center">
                    <button
                      className="h-6 mt-10 flex w-full justify-center items-center text-center text-black rounded"
                      onClick={() => setShowButtons(!showButtons)}
                    >
                      Gemini <ChevronDown />
                    </button>



                    {showButtons && (
                      <div className="flex flex-col  items-center justify-center  ">
                        <ul className="bg-gray-200  rounded-lg w-4/5">
                          <li className="text-center">
                            <Link
                              href="/mybot"
                              className="flex border-black p-2 ml-16 hover:bg-gray-300 rounded text-sm mt-[10%] mr-5"
                            >
                              <div className="w-5  h-[2%] p-1 ">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 18 18"
                                  className=" bg-white rounded-full  CustomIcon-module__icon___zGR29 CustomIcon-module__icon--tiny___trsDz"
                                >
                                  <g clipPath="url(#your-bots_svg__a)">
                                    <path
                                      stroke="currentColor"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="1.5"
                                      d="m9 1.5-.976 3.904c-.19.762-.286 1.143-.484 1.453a2.25 2.25 0 0 1-.683.683c-.31.198-.69.293-1.453.484L1.5 9l3.904.976c.762.19 1.143.286 1.453.484.275.176.507.408.683.683.198.31.293.69.484 1.452L9 16.5l.976-3.905c.19-.761.286-1.142.484-1.452.176-.275.408-.507.683-.683.31-.198.69-.293 1.452-.484L16.5 9l-3.905-.976c-.761-.19-1.142-.286-1.452-.484a2.25 2.25 0 0 1-.683-.683c-.198-.31-.293-.69-.484-1.453z"
                                      fill="black"
                                    ></path>
                                  </g>
                                  <defs>
                                    <clipPath id="your-bots_svg__a">
                                      <path
                                        fill="currentColor"
                                        d="M0 0h18v18H0z"
                                      ></path>
                                    </clipPath>
                                  </defs>
                                </svg>
                              </div>
                              <div className="ml-1 text-white">My Bot</div>
                            </Link>
                          </li>
                          <li>
                            <Link
                              href="/model"
                              className="flex border-black items-center ml-16 p-[1%] text-gray-400 hover:bg-gray-100 rounded text-sm mr-5"
                            >
                              <div className="w-8  h-[2%] p-1 ">
                                <svg
                                  viewBox="0 0 42 42"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--large___HBGvG"
                                >
                                  <g clipPath="url(#clip0_11185_26182)">
                                    <path
                                      d="M0.5 21C0.5 9.678 9.678 0.5 21 0.5C32.322 0.5 41.5 9.678 41.5 21C41.5 32.322 32.322 41.5 21 41.5C9.678 41.5 0.5 32.322 0.5 21Z"
                                      fill="white"
                                    ></path>
                                    <g clipPath="url(#clip1_11185_26182)">
                                      <path
                                        d="M31.2789 18.8229C31.8234 17.1886 31.6359 15.3984 30.7652 13.9119C29.4557 11.6319 26.8232 10.4589 24.2522 11.0109C23.1084 9.72236 21.4652 8.98961 19.7424 9.00011C17.1144 8.99411 14.7827 10.6861 13.9742 13.1866C12.2859 13.5324 10.8287 14.5891 9.97594 16.0869C8.65669 18.3609 8.95744 21.2274 10.7199 23.1774C10.1754 24.8116 10.3629 26.6019 11.2337 28.0884C12.5432 30.3684 15.1757 31.5414 17.7467 30.9894C18.8897 32.2779 20.5337 33.0106 22.2564 32.9994C24.8859 33.0061 27.2184 31.3126 28.0269 28.8099C29.7152 28.4641 31.1724 27.4074 32.0252 25.9096C33.3429 23.6356 33.0414 20.7714 31.2797 18.8214L31.2789 18.8229ZM22.2579 31.4311C21.2057 31.4326 20.1864 31.0644 19.3787 30.3901C19.4154 30.3706 19.4792 30.3354 19.5204 30.3099L24.2994 27.5499C24.5439 27.4111 24.6939 27.1509 24.6924 26.8696V20.1324L26.7122 21.2986C26.7339 21.3091 26.7482 21.3301 26.7512 21.3541V26.9334C26.7482 29.4144 24.7389 31.4259 22.2579 31.4311ZM12.5949 27.3039C12.0677 26.3934 11.8779 25.3261 12.0587 24.2904C12.0939 24.3114 12.1562 24.3496 12.2004 24.3751L16.9794 27.1351C17.2217 27.2769 17.5217 27.2769 17.7647 27.1351L23.5989 23.7661V26.0986C23.6004 26.1226 23.5892 26.1459 23.5704 26.1609L18.7397 28.9501C16.5879 30.1891 13.8399 29.4526 12.5957 27.3039H12.5949ZM11.3372 16.8721C11.8622 15.9601 12.6909 15.2626 13.6779 14.9004C13.6779 14.9416 13.6757 15.0144 13.6757 15.0654V20.5861C13.6742 20.8666 13.8242 21.1269 14.0679 21.2656L19.9022 24.6339L17.8824 25.8001C17.8622 25.8136 17.8367 25.8159 17.8142 25.8061L12.9827 23.0146C10.8354 21.7711 10.0989 19.0239 11.3364 16.8729L11.3372 16.8721ZM27.9317 20.7339L22.0974 17.3649L24.1172 16.1994C24.1374 16.1859 24.1629 16.1836 24.1854 16.1934L29.0169 18.9826C31.1679 20.2254 31.9052 22.9771 30.6624 25.1281C30.1367 26.0386 29.3087 26.7361 28.3224 27.0991V21.4134C28.3247 21.1329 28.1754 20.8734 27.9324 20.7339H27.9317ZM29.9417 17.7084C29.9064 17.6866 29.8442 17.6491 29.7999 17.6236L25.0209 14.8636C24.7787 14.7219 24.4787 14.7219 24.2357 14.8636L18.4014 18.2326V15.9001C18.3999 15.8761 18.4112 15.8529 18.4299 15.8379L23.2607 13.0509C25.4124 11.8096 28.1634 12.5484 29.4039 14.7009C29.9282 15.6099 30.1179 16.6741 29.9402 17.7084H29.9417ZM17.3034 21.8656L15.2829 20.6994C15.2612 20.6889 15.2469 20.6679 15.2439 20.6439V15.0646C15.2454 12.5806 17.2607 10.5676 19.7447 10.5691C20.7954 10.5691 21.8124 10.9381 22.6202 11.6101C22.5834 11.6296 22.5204 11.6649 22.4784 11.6904L17.6994 14.4504C17.4549 14.5891 17.3049 14.8486 17.3064 15.1299L17.3034 21.8641V21.8656ZM18.4007 19.5001L20.9994 17.9994L23.5982 19.4994V22.5001L20.9994 24.0001L18.4007 22.5001V19.5001Z"
                                        fill="black"
                                      ></path>
                                    </g>
                                    <path
                                      d="M41.3443 21.0002C41.3443 9.76457 32.2359 0.65625 21.0002 0.65625C9.76457 0.65625 0.65625 9.76457 0.65625 21.0002C0.65625 32.2359 9.76457 41.3443 21.0002 41.3443C32.2359 41.3443 41.3443 32.2359 41.3443 21.0002Z"
                                      stroke="#EEEEEE"
                                      strokeWidth="1.313"
                                    ></path>
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_11185_26182">
                                      <rect
                                        width="42"
                                        height="42"
                                        fill="white"
                                      ></rect>
                                    </clipPath>
                                    <clipPath id="clip1_11185_26182">
                                      <rect
                                        width="24"
                                        height="24"
                                        fill="white"
                                        transform="translate(9 9)"
                                      ></rect>
                                    </clipPath>
                                  </defs>
                                </svg>
                              </div>
                              <div className="ml-1 text-white mt-[2%]">
                                Gemini
                              </div>
                            </Link>
                          </li>
                        </ul>
                      </div>
                    )}
                    <h1 className="text-3xl mt-48 text-gray-600 ">
                      How can I help you today?
                    </h1>
                  </div>
                </div>
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center  md:ml-auto md:w-full md:max-w-[calc(100%-256px)]">
                  <div className="max-w-4xl w-full rounded-md p-6 text-center ">
                    <h1 className="text-3xl  text-gray-600 mb-16">
                      How can I help you today ?
                    </h1>
                    <div className="grid md:grid-cols-4 grid-cols-2 gap-6">
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

                    <div className="mb-5 w-full md:ml-20 md:w-2/4 p-1 flex bg-white  border border-gray-400 h-20
                     justify-between items-start fixed bottom-0 left-1/2 transform -translate-x-1/2 rounded-l-3xl rounded-r-3xl
"
                    >
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        className="w-full min-h-[3rem]  p-2 rounded-lg resize-none  focus:outline-none text-black bg-white"
                      />
                      <VoiceToText onResult={handleVoiceInput} />
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
              </>
            )}
          </div>
          {showPopup && (
            <div className="z-50 fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
              <div className="bg-neutral-800 p-12  w-96 rounded-lg shadow-lg text-center text-white">
                <h2 className="text-2xl  font-bold">Welcome back</h2>
                <p className=" p-2  text-lg ">
                  Log in or sign up to unlock smarter responses, upload files,
                  and make the most of VChat — your AI assistant.
                </p>
                <div className=" p-2 mt-4">
                  <button
                    onClick={() => router.push("/login")}
                    className="w-full px-4 py-2 mb-2 bg-white text-gray-800 border border-white rounded-full hover:bg-gray-100"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => router.push("/signup")}
                    className="  w-full px-4 py-2 bg-transparent text-white border border-white rounded-full hover:bg-gray-600"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <InsufficientBalance />
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
