"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { SquareMenu, X, EllipsisVertical } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useChat } from "./chatContext";
import { useSecondNav } from "../context/SecondNavContext";

const features = [
  { href: "/vChat", img: "/assests/vlogo.avif", title: "VChat" },
  { href: "/model", img: "/assests/gemini-color.png", title: "Gemini" },
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

const paths = ["Vchatmodel"];

const SecondNavbar = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const chatContainerRef = useRef(null);

  const { chatThread, setChatThread } = useChat();
  const { isSecondNavVisible, toggleSecondNav } = useSecondNav();
  const router = useRouter();
  const pathname = usePathname();
  // Fetch user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/model");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      setEmail(user?.email || "No Email");
      setName(user?.name || "No Name");
      setUserId(user?.id);
    } catch (err) {
      console.error("Error parsing user data", err);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        chatContainerRef.current &&
        !chatContainerRef.current.contains(e.target)
      ) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getChatById = async (c) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By/${c}`
      );
      if (!response.ok) throw new Error("Failed to fetch chat data");

      const chatData = await response.json();
      if (!chatData?.type) throw new Error("Invalid chat data");

      const routes = {
        Gemini: "chat",
        ImageGeneration: "imageChat",
        openAI: "openAIchat",
      };
      const route = routes[chatData.type] || "chat";
      router.push(`/${route}/${chatData.id}`);
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    }
  };

  const deleteChat = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/delete-by/${id}`,
        { method: "DELETE", headers: { "Content-Type": "application/json" } }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete chat");

      toast.success("Chat deleted successfully!");
      setChatThread((prev) => prev.filter((chat) => chat.chatId !== id));
      router.push("/model");
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  const isChatRoute =
    pathname === "/model" ||
    pathname.startsWith("/chat") ||
    pathname === "/" ||
    pathname.startsWith("/openAI") ||
    pathname.startsWith("/vChat") ||
    pathname.startsWith("/Vchat");

  const displayedFeatures = (() => {
    if (isChatRoute) {
      return features.filter((f) =>
        ["VChat", "Gemini", "OpenAI"].includes(f.title)
      );
    } else if (pathname === "/image") {
      return features.filter((f) => f.href === "/image");
    } else if (pathname === "/upload") {
      return features.filter((f) => f.href === "/upload");
    } else {
      return features;
    }
  })();

  return (
    <div className="md:block hidden">
      <div className="relative z-40">
        <Toaster position="top-center" richColors />
        <div
          className={`h-screen overflow-x-hidden overflow-y-auto bg-white text-black left-0 top-0 flex flex-col items-center transition-all duration-300 ${
            isSecondNavVisible ? "w-64 p-4" : "w-24 p-2"
          }`}
        >
          <nav className="w-full flex flex-col justify-between flex-grow">
            <ul>
              {/* Toggle Button */}
              <li className="flex flex-col gap-y-7">
                <button
                  onClick={toggleSecondNav}
                  aria-label="Toggle Sidebar"
                  className="group p-2 rounded-full bg-gray-200 hover:bg-gray-300 w-8 h-8 flex justify-center items-center"
                >
                  {isSecondNavVisible ? (
                    <X className="w-6 h-6" strokeWidth={1} />
                  ) : (
                    <SquareMenu className="w-6 h-6" strokeWidth={1} />
                  )}
                </button>
              </li>

              {/* Features */}
              {displayedFeatures.map((feature) => (
                <div className="group relative mt-6" key={feature.title}>
                  <Link
                    href={feature.href}
                    className={`flex items-center justify-center px-2 py-1 mb-4 text-sm text-gray-600 rounded-[30px] transition ${
                      pathname === feature.href ||
                      pathname
                        .toLowerCase()
                        .split("/")[1]
                        .startsWith(feature.title.toLowerCase())
                        ? "bg-[#dedede]"
                        : "hover:bg-[#dedede]"
                    }`}
                  >
                    <div className="w-10 h-10 p-2 bg-white rounded-full shadow-md flex items-center justify-center">
                      <Image
                        src={feature.img}
                        width={26}
                        height={26}
                        alt={feature.title}
                      />
                    </div>
                    {isSecondNavVisible && (
                      <div className="ml-2">{feature.title}</div>
                    )}
                  </Link>
                </div>
              ))}

              {/* Recent Chats */}
              {isSecondNavVisible && (
                <li className="mt-6">
                  <div className="mb-2 text-sm text-gray-600">Recent Chats</div>
                  {Array.isArray(chatThread) &&
                    chatThread.map((chat) => (
                      <div
                        key={chat.chatId}
                        className="relative flex items-center justify-between pl-5 pr-2 py-1 mb-3 rounded-lg hover:bg-gray-200"
                      >
                        <div
                          onClick={() => getChatById(chat.chatId)}
                          className="flex-1 truncate cursor-pointer"
                        >
                          {chat.message}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu((prev) =>
                              prev === chat.chatId ? null : chat.chatId
                            );
                          }}
                          className="rounded-full p-2 hover:bg-gray-200"
                          aria-label="Chat Options"
                        >
                          <EllipsisVertical size={18} />
                        </button>

                        {openMenu === chat.chatId && (
                          <div
                            ref={chatContainerRef}
                            className="absolute right-3 top-10 z-50 w-36 py-2 bg-white shadow-lg rounded-lg"
                          >
                            <button
                              onClick={() => {
                                deleteChat(chat.chatId);
                                setOpenMenu(null);
                              }}
                              className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50"
                            >
                              Delete
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const link = `${window.location.origin}/share/chat/${chat.chatId}`;
                                setShareLink(link);
                                navigator.clipboard.writeText(link);
                                toast.success(`Link copied: ${link}`);
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-100"
                            >
                              Copy
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default SecondNavbar;
