"use client";
import { useState, useEffect, useRef } from "react";
import React from "react";
import Link from "next/link";
import { useChat } from "./chatContext";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
  const [openMenu, setOpenMenu] = useState(null);
  const [shareLink, setShareLink] = useState("");

//   const [isNavVisible, setIsNavVisible] = useState(() => {
//   return localStorage.getItem("hasLoggedIn") === "true";
// });

// useEffect(() => {
//   localStorage.setItem("hasLoggedIn", isNavVisible);
// }, [isNavVisible]);

const {isNavVisible,setIsNavVisible} = useNav()






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
      `https://chatbot-2vqr.onrender.com/chatbot/get-By/${c}`
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

        {!isNavVisible && (
          <button
            className="block p-0.5 border text-black  ml-3 mt-5 hover:bg-gray-100 rounded"
            onClick={() => setIsNavVisible(true)}
          >
            <div className="w-6 h-6 p-1 ">
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
                  d="M9 9h6.75M9 2.25v13.5M5.85 2.25h6.3c1.26 0 1.89 0 2.371.245.424.216.768.56.984.984.245.48.245 1.11.245 2.371v6.3c0 1.26 0 1.89-.245 2.371a2.25 2.25 0 0 1-.984.984c-.48.245-1.11.245-2.371.245h-6.3c-1.26 0-1.89 0-2.371-.245a2.25 2.25 0 0 1-.984-.984c-.245-.48-.245-1.11-.245-2.371v-6.3c0-1.26 0-1.89.245-2.371a2.25 2.25 0 0 1 .984-.984c.48-.245 1.11-.245 2.371-.245"
                ></path>
              </svg>
            </div>
          </button>
        )}

        <div
          className={`h-screen w-64 bg-white  text-black overflow-y-auto fixed left-0 top-0 flex flex-col items-center p-4 transition-transform duration-300 ${
            !isNavVisible ? "-translate-x-64" : "translate-x-0 "
          }`}
        >
          <nav className="w-full flex flex-col justify-between flex-grow">
            <ul>
              <li className=" flex rounded items-center  ">
                <Link
                  href="/model"
                  className="flex w-full p-1 border  text-gray-700 hover:bg-gray-100 rounded mr-2 pl-2 items-center"
                >
                  <Plus size={12} />
                  <div className="ml-2 text-sm ">New Chat</div>
                </Link>
                <button
                  onClick={() => setIsNavVisible(false)}
                  className="block p-0.5 border hover:bg-gray-100 rounded"
                >
                  <div className="w-6 h-6 p-1 ">
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
                        d="M9 9h6.75M9 2.25v13.5M5.85 2.25h6.3c1.26 0 1.89 0 2.371.245.424.216.768.56.984.984.245.48.245 1.11.245 2.371v6.3c0 1.26 0 1.89-.245 2.371a2.25 2.25 0 0 1-.984.984c-.48.245-1.11.245-2.371.245h-6.3c-1.26 0-1.89 0-2.371-.245a2.25 2.25 0 0 1-.984-.984c-.245-.48-.245-1.11-.245-2.371v-6.3c0-1.26 0-1.89.245-2.371a2.25 2.25 0 0 1 .984-.984c.48-.245 1.11-.245 2.371-.245"
                      ></path>
                    </svg>
                  </div>
                </button>
              </li>
              <li>
                <Link
                  href="/mybot"
                  className="flex block p-2 hover:bg-gray-100 rounded text-sm mt-[10%]"
                >
                  <div className="w-5  h-[2%] p-1 ">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 18 18"
                      className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--tiny___trsDz"
                    >
                      <g clipPath="url(#your-bots_svg__a)">
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="m9 1.5-.976 3.904c-.19.762-.286 1.143-.484 1.453a2.25 2.25 0 0 1-.683.683c-.31.198-.69.293-1.453.484L1.5 9l3.904.976c.762.19 1.143.286 1.453.484.275.176.507.408.683.683.198.31.293.69.484 1.452L9 16.5l.976-3.905c.19-.761.286-1.142.484-1.452.176-.275.408-.507.683-.683.31-.198.69-.293 1.452-.484L16.5 9l-3.905-.976c-.761-.19-1.142-.286-1.452-.484a2.25 2.25 0 0 1-.683-.683c-.198-.31-.293-.69-.484-1.453z"
                        ></path>
                      </g>
                      <defs>
                        <clipPath id="your-bots_svg__a">
                          <path fill="currentColor" d="M0 0h18v18H0z"></path>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="ml-1">My Bot</div>
                </Link>
              </li>
              <li>
                <Link
                  href="/vChat"
                  className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
                >
                  <div className="w-8  h-[2%] p-1 ">
                    <Image
                      src="/assests/vlogo.avif"
                      width={18}
                      height={18}
                      alt="logo"
                    />
                  </div>
                  <div className="ml-1 mt-[2%]">VChat</div>
                </Link>
              </li>
              <li>
                <Link
                  href="/model"
                  className="flex items-center p-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
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
                  <div className="ml-1 mt-[2%]">Gemini</div>
                </Link>
              </li>
              <li>
                <Link
                  href="/openAI"
                  className="flex items-center p-2 text-gray-600  hover:bg-gray-100 rounded text-sm"
                >
                  <div className="w-8  h-[2%] p-1 ">
                    <svg
                      viewBox="0 0 42 42"
                      fill="none"
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
                  <div className="ml-1 mt-[2%]">OpenAI</div>
                </Link>
              </li>

              <li>
                <Link
                  href="/image"
                  className="flex items-center p-2 text-gray-600  hover:bg-gray-100 rounded text-sm"
                >
                  <div className="w-8  h-[2%] p-1 ">
                    <svg
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 42 42"
                      className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--large___HBGvG"
                    >
                      <path
                        d="M.5 21C.5 9.678 9.678.5 21 .5S41.5 9.678 41.5 21 32.322 41.5 21 41.5.5 32.322.5 21Z"
                        fill="#fff"
                      ></path>
                      <rect
                        x="0.656"
                        y="0.656"
                        width="40.688"
                        height="40.688"
                        rx="20.344"
                        stroke="#EEE"
                        strokeWidth="1.313"
                      ></rect>
                      <path
                        d="M19.164 22.32c.289 0 .548-.07.778-.213a1.71 1.71 0 0 0 .566-.573 1.49 1.49 0 0 0 .213-.786c0-.279-.071-.536-.213-.77a1.565 1.565 0 0 0-.566-.566 1.492 1.492 0 0 0-.778-.206c-.29 0-.551.069-.786.206a1.566 1.566 0 0 0-.566.565 1.504 1.504 0 0 0-.205.771c0 .29.068.551.205.786.142.235.33.426.566.573.235.142.497.213.786.213Zm-3.114 4.15h9.886c.254 0 .445-.061.573-.184.132-.122.198-.318.198-.587v-1.05l-2.615-2.454a1.315 1.315 0 0 0-.419-.264 1.241 1.241 0 0 0-.484-.096c-.157 0-.311.032-.463.096a1.497 1.497 0 0 0-.433.264L19.53 24.62l-1.102-.991a1.251 1.251 0 0 0-.389-.25 1.156 1.156 0 0 0-.845 0c-.132.049-.26.127-.381.235l-1.536 1.44v.646c0 .269.064.465.191.587.133.123.326.184.58.184Zm-.213 2.086c-.847 0-1.501-.23-1.961-.69-.456-.456-.683-1.105-.683-1.947v-7.433c0-.837.227-1.483.683-1.939.46-.46 1.114-.69 1.96-.69H26.15c.842 0 1.493.23 1.953.69.465.456.698 1.102.698 1.94v7.432c0 .842-.233 1.491-.698 1.946-.46.46-1.111.69-1.953.69H15.837Zm-.992-13.94c.04-.392.176-.703.411-.933.24-.23.59-.345 1.05-.345h9.372c.466 0 .816.115 1.05.345.236.23.375.54.42.933H14.845Zm1.44-2.395c.034-.372.169-.66.404-.867.235-.205.548-.308.94-.308h6.727c.397 0 .713.103.948.309.235.205.367.494.397.866h-9.416Z"
                        fill="#857DDD"
                      ></path>
                    </svg>
                  </div>
                  <div className="ml-1 mt-[2%]">Image Generation</div>
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="flex items-center p-2 text-gray-600  hover:bg-gray-100 rounded text-sm"
                >
                  <div className="w-8  h-[2%] p-1 ">
                    <svg
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 42 42"
                      className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--large___HBGvG"
                    >
                      <path
                        d="M.5 21C.5 9.678 9.678.5 21 .5S41.5 9.678 41.5 21 32.322 41.5 21 41.5.5 32.322.5 21Z"
                        fill="#fff"
                      ></path>
                      <rect
                        x="0.656"
                        y="0.656"
                        width="40.688"
                        height="40.688"
                        rx="20.344"
                        stroke="#EEE"
                        strokeWidth="1.313"
                      ></rect>
                      <path
                        d="M27.918 17.253 22.7 12.036v5.217h5.217Z"
                        fill="#D47070"
                      ></path>
                      <path
                        d="M22.7 18.744c-.822 0-1.49-.669-1.49-1.491v-5.217h-5.217a1.49 1.49 0 0 0-1.491 1.49v14.907a1.49 1.49 0 0 0 1.49 1.49l10.435.002c.823 0 1.491-.668 1.491-1.49v-9.691h-5.217Z"
                        fill="#D47070"
                      ></path>
                    </svg>
                  </div>
                  <div className="ml-1 mt-[2%]">Upload & Ask PDF</div>
                </Link>
              </li>
              <li>
                <Link
                  href="/model"
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
                  <div className="ml-1 mt-[2%]">Chats</div>
                </Link>
                <div className="md:h-56 md:max-h-56 h-32 border-t border-gray">
                  <div className="md:max-h-[220px] max-h-40 overflow-y-auto scrollbar-none text-gray-700 bg-white p-3 rounded-lg ">
                    {Array.isArray(chatThread) &&
                      chatThread.map((chat) => (
                        <div
                          key={chat.chatId}
                          className="relative flex items-center justify-between py-1 px-3 rounded-lg hover:bg-gray-100 transition duration-200"
                        >
                          {/* Chat Message */}
                          <div
                            onClick={() => getChatById(chat.chatId)}
                            className="flex-1 cursor-pointer truncate text-ellipsis whitespace-nowrap"
                          >
                            {chat.message}
                          </div>

                          {/* Options Button */}
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

                          {/* Dropdown Menu */}
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
                                  navigator.clipboard.writeText(generatedLink);
                                  toast.success(
                                    "Link copied: " + generatedLink
                                  );
                                }}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 transition duration-200"
                              >
                                Share
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </li>
            </ul>
            <ul className="">
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
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default page;
