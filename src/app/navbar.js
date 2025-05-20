"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast, Toaster } from "sonner";
import {
  Bot,
  ChevronRight,
  ChevronsRight,
  FileText,
  ImagePlus,
  MessageCircleMore,
  Music,
  Plus,
  SquareMenu,
  Video,
  X,
} from "lucide-react";
import Image from "next/image";
import { useChat } from "./chatContext";
import { useNav } from "./NavProvider";
import { useSecondNav } from "@/context/SecondNavContext";

const Page = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [openMenu, setOpenMenu] = useState(null);
  const chatContainerRef = useRef(null);
  const { isSecondNavVisible, toggleSecondNav } = useSecondNav();

  const { chatThread, setChatThread } = useChat();
  const { isNavVisible, setIsNavVisible } = useNav();
  const [showUser, setShowUser] = useState(false);

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

  useEffect(() => {
    const user = localStorage.getItem("user");
    let isLoggedIn = false;
    try {
      if (user) {
        isLoggedIn = true;
      } else {
        isLoggedIn = false;
      }
    } catch (e) {
      isLoggedIn = false;
    }
    setShowUser(isLoggedIn);
  }, []);

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

  return (
    <div className="relative z-40">
      <Toaster position="top-center" richColors />

      <div
        className={`h-screen custom-scrollbar bg-[#f4f4f5] text-black overflow-y-auto top-0 flex flex-col items-center overflow-x-hidden transition-all duration-300 fixed md:static ${
          isNavVisible
            ? "w-60 p-4 left-0"
            : "w-0 md:w-20 p-0 md:p-2 left-0 md:left-0"
        } md:w-24 md:p-2 md:flex md:flex-col md:items-center md:transition-all md:duration-300 ${
          isNavVisible ? "md:w-60 md:p-4" : ""
        }`}
      >
        <nav className="w-full flex flex-col justify-between flex-grow">
          <ul>
            <li
              className={`${
                isNavVisible ? "flex" : "inline-flex"
              } rounded flex-col gap-y-7`}
            >
              <div className="flex justify-between items-center">
                {isNavVisible ? (
                  <div className="flex items-center gap-3 w-10 h-10 p-2 bg-white rounded-full shadow-md">
                    <Image
                      src="/assests/vlogo.avif"
                      width={26}
                      height={26}
                      alt="vchat"
                    />
                    <span className="pl-2 text-sm font-bold uppercase">
                      Vchat
                    </span>
                  </div>
                ) : (
                  ""
                )}
                <button
                  onClick={() => setIsNavVisible(!isNavVisible)}
                  className="w-10 h-10 p-2 bg-transparent"
                >
                  {isNavVisible ? (
                    <X strokeWidth={2} size={20} />
                  ) : (
                    <SquareMenu strokeWidth={1} className="w-6 h-6" />
                  )}
                </button>
              </div>
              <Link
                href="/model"
                className="relative flex items-center px-2 py-1 text-black gap-1 border font-bold border-gray-300 rounded-[8px] bg-white hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 group"
              >
                <Plus size={30} strokeWidth={1} />
                {isNavVisible && <div className="text-sm">New Chat</div>}
              </Link>
            </li>

            {[
              { label: "My Bot", href: "/mybot" },
              { label: "Chat", href: "/model", active: isChatRoute },
              { label: "Image", href: "/image" },
              { label: "PDF", href: "/upload" },
              { label: "Music", href: "" },
              { label: "Video", href: "" },
            ].map(({ label, href, active }) => (
              <li key={label} className="realtive">
                <Link
                  onClick={() => setIsNavVisible(false)}
                  href={href}
                  className={`${
                    isNavVisible ? "flex" : "inline-flex"
                  } items-center px-2 py-1 mb-2 mt-2 text-gray-600 font-bold rounded-[8px] text-sm transition ${
                    active ?? pathname === href
                      ? "bg-black text-white"
                      : "hover:bg-[#dedede] active:bg-[#dedede]"
                  }`}
                >
                  <div className="w-8 h-8 p-1 flex items-center justify-center">
                    {label === "Chat" && (
                      <MessageCircleMore strokeWidth={2} size={30} />
                    )}
                    {label === "My Bot" && <Bot strokeWidth={2} size={30} />}
                    {label === "Music" && <Music strokeWidth={2} size={30} />}
                    {label === "Video" && <Video strokeWidth={2} size={30} />}
                    {label === "Image" && (
                      <ImagePlus strokeWidth={2} size={30} />
                    )}
                    {label === "PDF" && <FileText strokeWidth={2} size={30} />}
                  </div>
                  {isNavVisible && ["Chat", "Image", "PDF"].includes(label) && (
                    <div className=" flex items-center justify-between ml-2 text-md">
                      {label}
                      <ChevronRight
                        onClick={() => {
                          toggleSecondNav(true);
                          setIsNavVisible(false);
                        }}
                        className="absolute right-10"
                        strokeWidth={2}
                        size={20}
                      />
                    </div>
                  )}
                  {isNavVisible &&
                    !["Chat", "Image", "PDF"].includes(label) && (
                      <div className="ml-2 text-md">{label}</div>
                    )}
                </Link>
              </li>
            ))}
          </ul>

          {isNavVisible && (
            <ul>
              <li>
                <Link
                  href="/explore"
                  className={`flex items-center  p-2 rounded-lg text-sm font-medium transition duration-200 ${
                    pathname === "/explore"
                      ? "bg-gray-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <span className="ml-2 font-bold text-gray-600">Explore</span>
                  <div className="w-7 h-7 flex items-center justify-center">
                    <ChevronsRight strokeWidth={2} size={30} color="gray" />
                  </div>
                </Link>
              </li>
              {showUser && (
                <div className="ml-2 text-sm">
                  <li className="mt-[5%] flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-sm cursor-pointer border-t border-gray-400 relative">
                    <Link href="/profile" className="flex">
                      {email ? (
                        <div className="w-5 h-5 p-5 flex items-center justify-center rounded-full text-white font-bold bg-green-700">
                          {email ? email[0].toUpperCase() : "?"}
                        </div>
                      ) : (
                        ""
                      )}
                      <div className="flex flex-col ml-3">
                        <span className="font-medium text-gray-900">
                          {name ? name : ""}
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
  );
};

export default Page;
