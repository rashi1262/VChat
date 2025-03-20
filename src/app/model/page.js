"use client";

import { useState, useEffect } from "react";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useChat } from ".././chatContext";
import { toast, Toaster } from "sonner";

import Navbar from "../navbar";
import { ChevronDown } from "lucide-react";
const page = ({ params }) => {
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

  useEffect(() => {
    const hasLoggedIn = localStorage.getItem("hasLoggedIn") === "true";
    if (hasLoggedIn) {
      setShowPopup(false); // Popup hata do
    } else {
      // Agar login nahi hai toh 2 sec baad popup dikhao
      setShowPopup(true);
      
    }
  }, []);
  const handleRedirect = (path) => {
    setShowPopup(false);
    if (path === "/login") {
      // localStorage.setItem("hasLoggedIn", "true");
      setShowPopup(false);
    }
    window.location.href = path;
  };

  console.log("showPopup ", showPopup);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
        } else {
          const user = JSON.parse(storedUser);
          setEmail(user?.email || "No Email");
          setName(user?.name || "No Name");
          setUserId(user?.id);
        }
      } catch (error) {
        console.error("Error reading user data:", error);
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
        console.log("Fetched data:", data);

        // Ensure chatMessages is an array before mapping
        setChatThread(
          Array.isArray(data?.chatMessages)
            ? data.chatMessages.map((chat) => ({
                chatId: chat.id,
                message: chat.userSearch?.[0]?.userMessage || "No message",
              }))
            : []
        );
      } catch (error) {
        console.error("Error fetching user chats:", error);
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/search?userId=${encodeURIComponent(userId)}&message=${encodeURIComponent(msg)}`

      );
      if (searchRes.status === 402) {
        toast.error("Insufficient credits");
        setMsg(null);
        setLoading(false);
        return; 
      }
  
      if (!searchRes.ok) throw new Error("Error fetching bot response");
      

      const data = await searchRes.json();
      
      
      
      const formattedResponse = data.botResponse
        // .split(/[*-]\s+/)
        // .filter((point) => point.trim())
        // .join(" ");

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
  const getChatById = (c) => {
    router.push(`/chat/${c}`);
  };

  return (
    <div className="bg-gray-50">
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
                            key={index}
                            className="animate-pulse flex flex-col gap-1 mr-36"
                          >
                            {/* User Message Skeleton */}
                            <div className="self-end bg-gray-200 h-6 w-1/5 rounded-lg"></div>

                            {/* Response Skeleton */}
                            <div className="self-start bg-gray-300 h-6 w-1/3 rounded-lg ml-36"></div>
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
          <>
            <div className="h-screen w-full bg-gray-50  flex-col items-center justify-center  md:hidden">
              <div className="max-w-4xl w-full  rounded-md p-6 text-center">
                <button
                  className="h-6 mt-10 flex w-full justify-center items-center text-center text-black rounded"
                  onClick={() => setShowButtons(!showButtons)}
                >
                  Gemini <ChevronDown />
                </button>
                {showPopup && (
        <div className="z-50 fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="bg-neutral-800 p-12  w-96 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl  font-bold">Welcome back</h2>
            <p className=" p-2  text-lg ">
              Log in or sign up to get smarter responses, upload files, and
              more.
            </p>
            <div className=" p-2 mt-4">
              <button
                onClick={() => handleRedirect("/login")}
                className="w-full px-4 py-2 mb-2 bg-white text-gray-800 border border-white rounded-full hover:bg-gray-100"
              >
                Log in
              </button>
              <button
                onClick={() => handleRedirect("/signup")}
                className="  w-full px-4 py-2 bg-transparent text-white border border-white rounded-full hover:bg-gray-600"
              >
                Sign up
              </button>
            </div>
            {/* <button
              className="mt-4 text-sm text-gray-400 underline"
              onClick={() => setShowPopup(false)}
            >
              Stay logged out
            </button> */}
          </div>
        </div>
      )}
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
                          <div className="ml-1 text-white mt-[2%]">Gemini</div>
                        </Link>
                      </li>
                    </ul>
                  </div>
                )}
                <h1 className="text-3xl mt-48 text-gray-600 ">
                  How can I help you today?
                </h1>

                <div className="mb-5 ml-5 w-3/4 p-1 flex bg-gray-100 justify-between items-center fixed bottom-0 left-1/2 transform -translate-x-1/2  rounded-l-full rounded-r-full">
                  {/* <button className="ml-2 p-2 rounded-full bg-white">
        <div className="w-7 h-6 p-1 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
            className="text-gray-400 CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 3.75v10.5M3.75 9h10.5"
            ></path>
          </svg>
        </div>
      </button> */}

                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Send a message..."
                    className="w-3/4 p-1 rounded focus:outline-none text-black bg-gray-100"
                  />
                  {/* <button className="p-1 rounded-full bg-gray-200">
        <div className="w-7 h-6 p-1 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
            className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M2.25 7.5v3m3.375-6v9M9 2.25v13.5M12.375 4.5v9m3.375-6v3"
            ></path>
          </svg>
        </div>
      </button> */}
                  <button
                    onClick={handleResponse}
                    className="p-1 mr-2 rounded-full bg-gray-200 flex items-center justify-center bg-white"
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
            <div className="h-screen md:block bg-gray-50   items-center justify-center ml-auto w-full hidden">
              <div className="max-w-4xl w-full rounded-md p-6 text-center ml-auto mr-auto">
                <h1 className="text-3xl mt-48 text-gray-600 mb-16">
                  How can I help you today?
                </h1>
                <div className="grid grid-cols-4 gap-6">
                  <div
                    className="relative border rounded-md p-4 hover:bg-white cursor-pointer"
                    onClick={() =>
                      setPrompt("Solve a debate: is a hot dog a sandwich?")
                    }
                  >
                    <div className="w-10 h-10 mb-2">
                      {" "}
                      <svg
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 46 46"
                        className="_container__icon_1n4zg_21"
                      >
                        <g opacity="0.9">
                          <path
                            d="M0 23C0 10.297 10.297 0 23 0s23 10.297 23 23-10.297 23-23 23S0 35.703 0 23Z"
                            fill="#F3FAFF"
                          ></path>
                          <g clipPath="url(#clipPath)">
                            <path
                              d="m17.73 32.129 5.27-9.13m4.583-7.938c-3.953-2.283-8.9-1.286-11.69 2.148-.273.335-.41.502-.449.742-.031.191.015.444.113.611.123.21.34.336.775.587l13.336 7.7c.435.251.652.377.896.378.193 0 .436-.085.586-.208.188-.155.265-.356.419-.76 1.578-4.132-.032-8.916-3.986-11.198Zm0 0c-1.753-1.013-5.227 1.72-7.758 6.105m7.758-6.105c1.754 1.012 1.124 5.387-1.408 9.771m5.992 7.334H13.833"
                              stroke="#0281C7"
                              strokeWidth="1.833"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                          </g>
                        </g>
                        <defs>
                          <clipPath id="clipPath">
                            <path
                              fill="#fff"
                              transform="translate(12 12)"
                              d="M0 0h22v22H0z"
                            ></path>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      "Solve a debate: is a hot dog a sandwich?"
                    </p>
                  </div>
                  <div
                    className="relative border rounded-md p-4 hover:bg-white cursor-pointer"
                    onClick={() =>
                      setPrompt(
                        "Im thinking about moving to a new city. Can you help me plan the move?"
                      )
                    }
                  >
                    <div className="w-10 h-10 mb-2">
                      {" "}
                      <svg
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 46 46"
                        className="_container__icon_1n4zg_21"
                      >
                        <g opacity="0.9">
                          <path
                            d="M0 23C0 10.297 10.297 0 23 0s23 10.297 23 23-10.297 23-23 23S0 35.703 0 23Z"
                            fill="#FFF3F3"
                          ></path>
                          <g clipPath="url(#clipPath)">
                            <path
                              d="M23 17.5v14.667M23 17.5h-3.241c-.478 0-.936-.193-1.273-.537a1.85 1.85 0 0 1-.528-1.296c0-.486.19-.953.528-1.297a1.785 1.785 0 0 1 1.273-.537C22.279 13.833 23 17.5 23 17.5Zm0 0h3.241c.478 0 .936-.193 1.273-.537a1.85 1.85 0 0 0 .528-1.296c0-.486-.19-.953-.528-1.297a1.785 1.785 0 0 0-1.273-.537C23.721 13.833 23 17.5 23 17.5Zm7.333 4.583v7.15c0 1.027 0 1.54-.2 1.933a1.833 1.833 0 0 1-.8.8c-.393.2-.906.2-1.933.2h-8.8c-1.027 0-1.54 0-1.932-.2a1.833 1.833 0 0 1-.801-.8c-.2-.393-.2-.906-.2-1.933v-7.15m-1.834-3.116v1.65c0 .513 0 .77.1.966a.918.918 0 0 0 .4.4c.197.1.454.1.967.1h15.4c.513 0 .77 0 .966-.1a.918.918 0 0 0 .4-.4c.1-.196.1-.453.1-.966v-1.65c0-.514 0-.77-.1-.966a.917.917 0 0 0-.4-.401c-.196-.1-.453-.1-.966-.1H15.3c-.513 0-.77 0-.966.1a.917.917 0 0 0-.4.4c-.1.197-.1.453-.1.967Z"
                              stroke="#C60F0F"
                              strokeWidth="1.833"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                          </g>
                        </g>
                        <defs>
                          <clipPath id="clipPath">
                            <path
                              fill="#fff"
                              transform="translate(12 12)"
                              d="M0 0h22v22H0z"
                            ></path>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <p className="text-gray-500  ">
                      "I'm thinking about moving to a new city. Can you help me
                      plan the move?"
                    </p>
                  </div>
                  <div
                    className="relative border rounded-md p-4 hover:bg-white cursor-pointer"
                    onClick={() =>
                      setPrompt("Can you help me write a bedtime story?")
                    }
                  >
                    <div className="w-10 h-10 mb-2">
                      {" "}
                      <svg
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 46 46"
                        className="_container__icon_1n4zg_21"
                      >
                        <g opacity="0.9">
                          <path
                            d="M0 23C0 10.297 10.297 0 23 0s23 10.297 23 23-10.297 23-23 23S0 35.703 0 23Z"
                            fill="#FFFBF3"
                          ></path>
                          <g clipPath="url(#clipPath)">
                            <path
                              d="M17.5 30.413h2.393c.312 0 .622.037.924.112l2.529.614c.548.134 1.12.147 1.674.039l2.795-.544a3.855 3.855 0 0 0 1.95-1.015l1.978-1.924a1.378 1.378 0 0 0 0-1.988 1.476 1.476 0 0 0-1.889-.13l-2.305 1.68a1.94 1.94 0 0 1-1.145.372h-2.226 1.417c.799 0 1.446-.63 1.446-1.406v-.281c0-.645-.452-1.208-1.095-1.364l-2.187-.531a4.608 4.608 0 0 0-1.086-.13c-.884 0-2.485.732-2.485.732L17.5 25.773m-3.667-.39V30.7c0 .513 0 .77.1.966a.917.917 0 0 0 .4.4c.197.1.454.1.967.1h.733c.514 0 .77 0 .966-.1a.917.917 0 0 0 .401-.4c.1-.196.1-.453.1-.966v-5.317c0-.513 0-.77-.1-.966a.917.917 0 0 0-.4-.4c-.197-.1-.453-.1-.967-.1H15.3c-.513 0-.77 0-.966.1a.918.918 0 0 0-.4.4c-.1.196-.1.453-.1.966Zm13.926-10.09c-.547-1.145-1.809-1.751-3.035-1.166-1.227.585-1.75 1.974-1.236 3.192.317.754 1.227 2.216 1.875 3.224.24.372.36.558.535.667a.94.94 0 0 0 .514.138c.206-.007.403-.108.797-.311 1.065-.548 2.584-1.36 3.235-1.854a2.44 2.44 0 0 0 .526-3.382c-.79-1.116-2.165-1.226-3.211-.508Z"
                              stroke="#B45909"
                              strokeWidth="1.833"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            ></path>
                          </g>
                        </g>
                        <defs>
                          <clipPath id="clipPath">
                            <path
                              fill="#fff"
                              transform="translate(12 12)"
                              d="M0 0h22v22H0z"
                            ></path>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      "Can you help me write a bedtime story?"
                    </p>
                  </div>
                  <div
                    className="relative border rounded-md p-4 hover:bg-white cursor-pointer"
                    onClick={() =>
                      setPrompt("Get advice on preparing for a job interview.")
                    }
                  >
                    <div className="w-10 h-10 mb-2">
                      {" "}
                      <svg
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 46 46"
                        className="_container__icon_1n4zg_21"
                      >
                        <g opacity="0.9">
                          <path
                            d="M0 23C0 10.297 10.297 0 23 0s23 10.297 23 23-10.297 23-23 23S0 35.703 0 23Z"
                            fill="#FFF4FF"
                          ></path>
                          <g
                            clipPath="url(#clipPath)"
                            stroke="#AF1CA1"
                            strokeWidth="1.833"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M23 32.167a9.167 9.167 0 1 0 0-18.334 9.167 9.167 0 0 0 0 18.334Z"></path>
                            <path d="M25.495 19.577c.448-.15.672-.224.82-.17.13.046.232.148.279.277.053.149-.022.373-.171.82l-1.364 4.091a.997.997 0 0 1-.1.245.459.459 0 0 1-.12.12c-.052.036-.116.057-.243.1l-4.091 1.363c-.448.15-.672.224-.82.17a.458.458 0 0 1-.279-.277c-.053-.149.022-.373.171-.82l1.364-4.091a.996.996 0 0 1 .1-.245.457.457 0 0 1 .12-.12c.052-.035.116-.057.243-.1l4.091-1.363Z"></path>
                          </g>
                        </g>
                        <defs>
                          <clipPath id="clipPath">
                            <path
                              fill="#fff"
                              transform="translate(12 12)"
                              d="M0 0h22v22H0z"
                            ></path>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <p className="text-gray-500">
                      "Get advice on preparing for a job interview."
                    </p>
                  </div>
                </div>
                <div className="mb-5 ml-20 w-2/4 p-1 flex bg-gray-100 justify-between items-center fixed bottom-0 left-1/2 transform -translate-x-1/2  rounded-l-full rounded-r-full">
                  {/* <button className="ml-2 p-2 rounded-full bg-white">
                <div className="w-7 h-6 p-1 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                    className="text-gray-400 CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 3.75v10.5M3.75 9h10.5"
                    ></path>
                  </svg>
                </div>
              </button> */}

                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Send a message..."
                    className="w-3/4 p-1 rounded focus:outline-none text-black bg-gray-100"
                  />
                  {/* <button className="p-1 rounded-full bg-gray-200">
                <div className="w-7 h-6 p-1 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                    className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M2.25 7.5v3m3.375-6v9M9 2.25v13.5M12.375 4.5v9m3.375-6v3"
                    ></path>
                  </svg>
                </div>
              </button> */}
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

      {/* <div className="fixed top-3 right-5 flex items-center ">
        <button className="flex items-center text-black border rounded-l-full rounded-r-full p-1 bg-yellow-200">
          <div className="w-5 h-5 m1-2 mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 18"
              className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.552"
                d="M1.628 6.906h14.744M7.448 2.25 5.896 6.906 9 15.83l3.104-8.924-1.552-4.656M9.477 15.646l6.952-8.343c.118-.14.177-.212.2-.29a.4.4 0 0 0 0-.213c-.023-.08-.082-.15-.2-.291l-3.363-4.036c-.068-.082-.102-.123-.144-.152a.4.4 0 0 0-.123-.058c-.05-.013-.103-.013-.21-.013H5.411c-.107 0-.16 0-.21.013a.4.4 0 0 0-.122.058c-.042.03-.077.07-.145.152L1.571 6.51c-.118.141-.176.212-.199.29a.4.4 0 0 0 0 .213c.023.08.081.15.2.291l6.951 8.343c.164.196.246.295.344.33.086.032.18.032.266 0 .098-.035.18-.134.344-.33"
              ></path>
            </svg>
          </div>
          Go Pro
        </button>
        <button className="flex md:block items-center hidden">
          <Link
            href="/model"
            className="flex items-center hover:bg-gray-200 rounded text-black text-base p-2"
          >
            <div className="w-7 h-6 p-1 ">
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
                    <rect width="42" height="42" fill="white"></rect>
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
            Gemini
          </Link>
        </button>
      </div> */}

      {showPopup && (
        <div className="z-50 fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="bg-neutral-800 p-12  w-96 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl  font-bold">Welcome back</h2>
            <p className=" p-2  text-lg ">
              Log in or sign up to get smarter responses, upload files, and
              more.
            </p>
            <div className=" p-2 mt-4">
              <button
                onClick={() => handleRedirect("/login")}
                className="w-full px-4 py-2 mb-2 bg-white text-gray-800 border border-white rounded-full hover:bg-gray-100"
              >
                Log in
              </button>
              <button
                onClick={() => handleRedirect("/signup")}
                className="  w-full px-4 py-2 bg-transparent text-white border border-white rounded-full hover:bg-gray-600"
              >
                Sign up
              </button>
            </div>
            {/* <button
              className="mt-4 text-sm text-gray-400 underline"
              onClick={() => setShowPopup(false)}
            >
              Stay logged out
            </button> */}
          </div>
        </div>
      )}
    </div>
  );
};

export default page;