// components/MobileSidebar.tsx
'use client'

import { useState, useEffect, useRef  } from 'react'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import clsx from 'clsx'
import React from "react";
// import Link from "next/link";
import { useChat } from "./chatContext";
import { useRouter } from "next/navigation";
import { Plus, Sparkle, SquareMenu } from "lucide-react";
import { EllipsisVertical } from "lucide-react";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { useNav } from "./NavProvider";

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Services', href: '/services' },
  { name: 'Contact', href: '/contact' },
]

export default function MobileSidebar() {

      const [name, setName] = useState("");
      const [email, setEmail] = useState("");
      const { chatThread, setChatThread, fetchChats } = useChat();
      const [userId, setUserId] = useState(null);
      const router = useRouter();
      const [openMenu, setOpenMenu] = useState(true);
      const { isNavVisible, setIsNavVisible } = useNav();
      const [shareLink, setShareLink] = useState("");
  const [isOpen, setIsOpen] = useState(false)

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
    <div className="md:hidden z-50 fixed">
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 focus:outline-none"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay */}
      <div
        className={clsx(
          'fixed inset-0 bg-black bg-opacity-50 transition-opacity z-40',
          { hidden: !isOpen }
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={clsx(
          'fixed top-0 left-0 h-full w-64 bg-black z-50 p-6 transition-transform duration-300 ease-in-out ',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button className='text-white' onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
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

              
                </button>

                <Link
                  href="/model"
                  className="relative flex items-center px-4 py-2 text-gray-700 border border-gray-300 bg-white rounded-full hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 group "
                >
                  <Plus size={12} className="mr-2" />
                  {isNavVisible && <div className="text-sm">New Chat</div>}

            
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
                    (
                      <div className="ml-2 text-sm text-white">{feature.title}</div>
                    )
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
            
            </ul>
            <ul className="">
              {isNavVisible && (
                <li>
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
                </li>
              )}

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
          </nav>
      </div>
    </div>
  )
}


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
  