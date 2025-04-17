"use client";
import { useState, useEffect, useRef } from "react";
import React from "react";
import Link from "next/link";
import { useChat } from "./chatContext";
import { useRouter } from "next/navigation";
import { Plus, Sparkle, SquareMenu } from "lucide-react";
import { EllipsisVertical } from "lucide-react";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { useNav } from "./NavProvider";
const page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { chatThread, setChatThread, fetchChats } = useChat();
  const [userId, setUserId] = useState(null);
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState(true);
  const { isNavVisible, setIsNavVisible } = useNav();
  const [shareLink, setShareLink] = useState("");
  console.log(isNavVisible, "isNavVisibleisNavVisible");

  //   const [isNavVisible, setIsNavVisible] = useState(() => {
  //   return localStorage.getItem("hasLoggedIn") === "true";
  // });

  // useEffect(() => {
  //   localStorage.setItem("hasLoggedIn", isNavVisible);
  // }, [isNavVisible]);

  // const { isNavVisible, setIsNavVisible } = useNav(true);

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
      } catch (error) {}
    }
  }, []);

  const chatContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(event.target)
      ) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getChatById = async (c) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By/${c}`
    );
    if (!response.ok) throw new Error("Failed to fetch chat data");

    const chatData = await response.json();
    if (!chatData || !chatData.type) throw new Error("Invalid chat data");

    switch (chatData.type) {
      case "Gemini":
        router.push(`/chat/${chatData.id}`);
        break;
      case "ImageGeneration":
        router.push(`/imageChat/${chatData.id}`);
        break;
      case "openAI":
        router.push(`/openAIchat/${chatData.id}`);
        break;
      default:
        router.push(`/chat/${chatData.id}`);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleResponse();
    }
  };

  const deleteChat = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/delete-by/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete chats");
      }
      toast.success(" Chat deleted successfully!");
      setChatThread((prevChats) =>
        prevChats.filter((chat) => chat.chatId !== id)
      );
      router.push("/model");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    }
    {
      duration: Infinity;
    }
  };

  return (
    <div>
      <div className="relative z-40">
        <Toaster position="top-center" richColors />

        <div
          className={`h-screen custom-scrollbar bg-[#f0f4f9] text-black overflow-y-auto left-0 top-0 flex flex-col items-center  transition-all duration-300 ${
            !isNavVisible ? " w-24 p-2" : " w-80 p-4" // or w-[50%] if you want a larger expanded sidebar
          }`}
        >
          <nav className="w-full flex flex-col justify-between flex-grow">
            <ul>
              <li className=" flex rounded  flex-col gap-y-7  ">
                <button
                  onClick={() => setIsNavVisible(!isNavVisible)}
                  className="relative group p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200 w-10 h-10"
                >
                  <div className="w-6 h-6 flex items-center justify-center">
                    <SquareMenu strokeWidth={1} />
                  </div>

                  {/* Extended Menu (Shown on Hover) */}
                  {/* <div className="absolute  bottom-[-20px] ml-2 w-20  bg-black border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                 
                    <span className="text-white text-[10px] md:text-[12px]">
                      Expand menu
                    </span>
                  </div> */}
                </button>

                <Link
                  href="/model"
                  className="relative flex items-center px-4 py-2 text-gray-700 border border-gray-300 bg-white rounded-full hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 group "
                >
                  <Plus size={12} className="mr-2" />
                  {isNavVisible && <div className="text-sm">New Chat</div>}

                  {/* Tooltip (shown on hover) */}
                  {/* <div className="absolute bottom-[-20px] ml-2 w-20 bg-black border  text-center rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-white text-[10px] md:text-[12px]">
                      New Chat
                    </span>
                  </div> */}
                </Link>
              </li>
              <li>
                <Link
                  href="/mybot"
                  className="flex items-center px-2 py-1 mb-4 mt-4 text-gray-600 hover:bg-[#dedede] active:bg-[#dedede] rounded-[30px] text-sm transition "
                >
                  <div className="w-8 h-8 p-1 bg-white rounded-full flex items-center justify-center">
                    <Sparkle className="w-4 h-4" strokeWidth={1} />
                  </div>
                  {/* <Plus size={12} /> */}
                  {isNavVisible && <div className="ml-2 text-sm ">My Bot</div>}
                  {/* <div className="ml-1">My Bot</div> */}
                </Link>
              </li>
              {features.map((feature) => (
                <div className=" group relative" key={feature.title}>
                  <Link
                    href={feature.href}
                    className="flex items-center px-2 py-1 mb-4 text-gray-600 hover:bg-[#dedede] active:bg-[#dedede] rounded-[30px] text-sm transition"
                  >
                    <div className="w-8 h-8 p-1 bg-white rounded-full flex items-center justify-center">
                      <Image
                        src={feature.img}
                        width={26}
                        height={26}
                        alt={feature.title}
                      />
                    </div>
                    {isNavVisible && (
                      <div className="ml-2 text-sm">{feature.title}</div>
                    )}
                  </Link>

                  {/* Tooltip when nav is collapsed */}
                  {/* {!isNavVisible && (
  <div className="absolute -top-3 left-full ml-2 z-20 w-max max-w-[10rem] px-3 py-2 text-xs bg-black text-white border border-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
    {feature.title}

    <div className="absolute -bottom-1 left-2 w-3 h-3 bg-black rotate-45 border-l border-t border-gray-700 z-[-1]"></div>
  </div>
)} */}
                </div>
              ))}
              {isNavVisible && (
                <li>
                  <Link
                    href=""
                    className="flex  mb-2 items-center p-2 hover:bg-gray-100 rounded text-sm"
                  >
                    <div className="w-6 h-4 p-1 flex items-center ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 18 18"
                        className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--tiny___trsDz"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="m1.5 5.25 6.124 4.287c.496.347.744.52 1.013.587.238.06.488.06.726 0 .27-.067.517-.24 1.013-.587L16.5 5.25M5.1 15h7.8c1.26 0 1.89 0 2.371-.245a2.25 2.25 0 0 0 .984-.984c.245-.48.245-1.11.245-2.371V6.6c0-1.26 0-1.89-.245-2.371a2.25 2.25 0 0 0-.983-.984C14.79 3 14.16 3 12.9 3H5.1c-1.26 0-1.89 0-2.371.245a2.25 2.25 0 0 0-.984.984C1.5 4.709 1.5 5.339 1.5 6.6v4.8c0 1.26 0 1.89.245 2.371.216.424.56.768.984.984C3.209 15 3.839 15 5.1 15"
                        ></path>
                      </svg>
                    </div>

                    {/* My Bot */}
                    {isNavVisible && <div className="ml-2 text-sm ">Chats</div>}
                    {/* <div className="ml-1 mt-[2%]">Chats</div> */}
                  </Link>
                  <div className="md:h-56 h-32">
                    <div className=" overflow-y-auto custom-scrollbar  md:h-[200px] md:max-h-[200px]  text-gray-600">
                      {Array.isArray(chatThread) &&
                        chatThread.map((chat) => (
                          <div
                            key={chat.chatId}
                            className="relative rounded-lg pl-5 flex items-center justify-between hover:bg-gray-200 mb-3"
                          >
                            <div
                              onClick={() => getChatById(chat.chatId)}
                              className="flex-1 cursor-pointer truncate text-ellipsis whitespace-nowrap p-1"
                            >
                              {isNavVisible && (
                                <div className="ml-2 text-sm  ">
                                  {chat.message}
                                </div>
                              )}
                            </div>

                            {/***** Options Button *****/}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenu(
                                  openMenu === chat.chatId ? null : chat.chatId
                                );
                              }}
                              className="rounded-full p-2 hover:bg-gray-200 transition duration-200"
                            >
                              <EllipsisVertical size={18} />
                            </button>

                            {/***** Dropdown Menu *****/}
                            {openMenu === chat.chatId && (
                              <div
                                ref={chatContainerRef}
                                className="absolute right-3 top-10 z-50 bg-white shadow-lg rounded-lg w-36 py-2 transition-all duration-300"
                              >
                                <button
                                  onClick={() => {
                                    deleteChat(chat.chatId);
                                    setOpenMenu(null);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 transition duration-200"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const generatedLink = `${window.location.origin}/share/chat/${chat.chatId}`;
                                    setShareLink(generatedLink);
                                    navigator.clipboard.writeText(
                                      generatedLink
                                    );
                                    toast.success(
                                      "Link copied: " + generatedLink
                                    );
                                  }}
                                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition duration-200"
                                >
                                  Copy
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </li>
              )}
            </ul>
            <ul className="">

            {isNavVisible && <li>
                <Link
                  href="/explore"
                  className="flex items-center p-2 hover:bg-gray-200 rounded-lg text-sm font-medium transition duration-200"
                >
                  <div className="w-7  h-[2%] flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 18 18"
                      className="w-5 h-5 text-gray-600"
                    >
                      <g
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                      >
                        <path d="M6.3 2.25H3.45c-.42 0-.63 0-.79.082a.75.75 0 0 0-.328.328c-.082.16-.082.37-.082.79V6.3c0 .42 0 .63.082.79a.75.75 0 0 0 .328.328c.16.082.37.082.79.082H6.3c.42 0 .63 0 .79-.082a.75.75 0 0 0 .328-.328c.082-.16.082-.37.082-.79V3.45c0-.42 0-.63-.082-.79a.75.75 0 0 0-.328-.328c-.16-.082-.37-.082-.79-.082M14.55 2.25H11.7c-.42 0-.63 0-.79.082a.75.75 0 0 0-.328.328c-.082.16-.082.37-.082.79V6.3c0 .42 0 .63.082.79a.75.75 0 0 0 .327.328c.16.082.371.082.791.082h2.85c.42 0 .63 0 .79-.082a.75.75 0 0 0 .328-.328c.082-.16.082-.37.082-.79V3.45c0-.42 0-.63-.082-.79a.75.75 0 0 0-.327-.328c-.16-.082-.371-.082-.791-.082M14.55 10.5H11.7c-.42 0-.63 0-.79.082a.75.75 0 0 0-.328.327c-.082.16-.082.371-.082.791v2.85c0 .42 0 .63.082.79a.75.75 0 0 0 .327.328c.16.082.371.082.791.082h2.85c.42 0 .63 0 .79-.082a.75.75 0 0 0 .328-.327c.082-.16.082-.371.082-.791V11.7c0-.42 0-.63-.082-.79a.75.75 0 0 0-.327-.328c-.16-.082-.371-.082-.791-.082M6.3 10.5H3.45c-.42 0-.63 0-.79.082a.75.75 0 0 0-.328.327c-.082.16-.082.371-.082.791v2.85c0 .42 0 .63.082.79a.75.75 0 0 0 .328.328c.16.082.37.082.79.082H6.3c.42 0 .63 0 .79-.082a.75.75 0 0 0 .328-.327c.082-.16.082-.371.082-.791V11.7c0-.42 0-.63-.082-.79a.75.75 0 0 0-.328-.328c-.16-.082-.37-.082-.79-.082"></path>
                      </g>
                    </svg>
                  </div>
                  <span className="ml-2 text-gray-700">Explore Bots</span>
                </Link>
              </li>}
              

              {isNavVisible && <div className="ml-2 text-sm "> <li className="mt-[5%] flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-sm cursor-pointer border-t border-gray-400 relative">
                <Link href="/profile" className="flex">
                  <div className="w-5 h-5 p-5 flex items-center justify-center rounded-full text-white font-bold bg-green-700">
                    {email ? email[0].toUpperCase() : "?"}
                  </div>

                  <div className="flex flex-col ml-3">
                    <span className="font-medium text-gray-900">
                      {name ? name : "User"}
                    </span>
                    <div className="text-xs overflow-hidden text-gray-500">
                      {email}
                    </div>
                  </div>
                </Link>
              </li></div>}

             
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default page;

const features = [
  { href: "/vChat", img: "/assests/vlogo.avif", title: "VChat" },
  { href: "/model", img: "/assests/gemini.png", title: "Gemini" },
  { href: "/openAI", img: "/assests/svgviewer-output.svg", title: "OpenAI" },
  {
    href: "/image",
    img: "/assests/svgviewer-output (2).svg",
    title: "Image Generation",
  },
  {
    href: "/upload",
    img: "/assests/svgviewer-output (3).svg",
    title: "Upload & Ask PDF",
  },
];
