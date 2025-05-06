"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Plus, Sparkle, SquareMenu, X } from "lucide-react";

import { useChat } from "./chatContext";
import { useNav } from "./NavProvider";

const Page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const chatContainerRef = useRef(null);

  const { chatThread, setChatThread } = useChat();
  const { isNavVisible, setIsNavVisible } = useNav();

  const router = useRouter();
  const pathname = usePathname();

  const isChatRoute = useMemo(() => {
    return (
      pathname === "/model" ||
      pathname.startsWith("/chat") ||
      pathname === "/" ||
      pathname.startsWith("/openAI") ||
      pathname.startsWith("/vChat") ||
      pathname.includes("/Vchat")
    );
  }, [pathname]);

  // Auth Check
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/model");
    } else {
      try {
        const user = JSON.parse(storedUser);
        setEmail(user?.email || "No Email");
        setName(user?.name || "No Name");
        setUserId(user?.id);
      } catch (error) {
        console.error("Invalid user data", error);
      }
    }
  }, [router]);

  // Close menu when clicking outside
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch & Redirect to chat
  const getChatById = async (chatId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By/${chatId}`
      );
      if (!res.ok) throw new Error("Failed to fetch chat");

      const chatData = await res.json();
      const { id, type } = chatData || {};

      if (!type || !id) throw new Error("Invalid chat data");

      const routes = {
        Gemini: `/chat/${id}`,
        ImageGeneration: `/imageChat/${id}`,
        openAI: `/openAI/${id}`,
      };

      router.push(routes[type] || `/chat/${id}`);
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // Delete Chat
  const deleteChat = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/delete-by/${id}`,
        { method: "DELETE", headers: { "Content-Type": "application/json" } }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete chat");

      toast.success("Chat deleted!");
      setChatThread((prev) => prev.filter((chat) => chat.chatId !== id));
      router.push("/model");
    } catch (err) {
      toast.error(`Error: ${err.message}`);
    }
  };

  // Component JSX
  return (
    <div className="hidden md:block">
      <div className="relative z-40">
        <Toaster position="top-center" richColors />

        <div
          className={`h-screen custom-scrollbar bg-[#f4f4f5] text-black overflow-y-auto left-0 top-0 flex flex-col items-center overflow-x-hidden transition-all duration-300 ${
            isNavVisible ? "w-64 p-4" : "w-24 p-2"
          }`}
        >
          <nav className="w-full flex flex-col justify-between flex-grow">
            <ul>
              <li className="flex rounded flex-col gap-y-7">
                <button
                  onClick={() => setIsNavVisible(!isNavVisible)}
                  className="relative group p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200 w-8 h-8 flex justify-center items-center"
                >
                  {isNavVisible ? (
                    <X strokeWidth={1} className="w-6 h-6" />
                  ) : (
                    <SquareMenu strokeWidth={1} className="w-6 h-6" />
                  )}
                </button>

                <Link
                  href="/model"
                  className="relative flex items-center px-4 py-2 text-gray-700 border border-gray-300 rounded-full bg-white hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 group"
                >
                  <Plus size={12} className="mr-2" />
                  {isNavVisible && <div className="text-sm">New Chat</div>}
                </Link>
              </li>

              {[
                { label: "My Bot", href: "/mybot" },
                { label: "Chat", href: "/model", active: isChatRoute },
                { label: "Image", href: "/image" },
                { label: "PDF", href: "/upload" },
              ].map(({ label, href, active }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className={`flex items-center px-2 py-1 mb-4 mt-4 text-gray-600 rounded-[30px] text-sm transition ${
                      active ?? pathname === href
                        ? "bg-[#dedede]"
                        : "hover:bg-transparent active:bg-[#dedede]"
                    }`}
                  >
                    <div className="w-8 h-8 p-1 bg-white rounded-full flex items-center justify-center">
                      <Sparkle className="w-4 h-4" strokeWidth={1} />
                    </div>
                    {isNavVisible && (
                      <div className="ml-2 text-sm">{label}</div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Explore */}
            {isNavVisible && (
              <ul>
                <li>
                  <Link
                    href="/explore"
                    className={`flex items-center p-2 rounded-lg text-sm font-medium transition duration-200 ${
                      pathname === "/explore"
                        ? "bg-gray-200"
                        : "hover:bg-gray-200"
                    }`}
                  >
                    <div className="w-7 h-7 flex items-center justify-center">
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
                          <path d="M6.3 2.25H3.45..." />
                        </g>
                      </svg>
                    </div>
                    <span className="ml-2">Explore</span>
                  </Link>
                </li>
                {isNavVisible && (
                  <div className="ml-2 text-sm ">
                    {" "}
                    <li className="mt-[5%] flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-sm cursor-pointer border-t border-gray-400 relative">
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
                    </li>
                  </div>
                )}
              </ul>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Page;
