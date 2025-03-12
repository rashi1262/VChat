"use client";
import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../navbar";
import { useRouter } from "next/navigation";
import { useChat} from ".././chatContext";
const page = () => {
  const [name, setName] = useState("");
      const [email, setEmail] = useState("");
      const[prompt,setPrompt] = useState("")
      const[userId,setUserId] = useState(null)
      const[msg,setMsg] = useState('')
     const [error, setError] = useState("");
       const [response, setResponse] = useState("");
       const [loading, setLoading] = useState(false);
         const { chatThread, setChatThread } = useChat();
       const router = useRouter()
      useEffect(() => {
        if (typeof window !== "undefined") {
          try {
            const storedUser = localStorage.getItem("user");
            if (!storedUser) {
              router.push("/login");
              return;
            } else {
              const user = JSON.parse(storedUser);
              setEmail(user?.email || "No Email");
              setName(user?.name || "No Name");
              setUserId(user?.id)
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
              console.log("Fetched data:", data); 
        
              
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
        if(prompt==''){return;}
        setLoading(true);
        try {
          const current = prompt
          setMsg(current)
          setPrompt("")
          const searchRes = await fetch(
            `${
              process.env.NEXT_PUBLIC_BASE_URL
            }/chatbot/search?message=${encodeURIComponent(current)}`
          );
          
          if (!searchRes.ok) throw new Error("Error fetching bot response");
    
          const data = await searchRes.text();
          const formattedResponse = data
            .split(/[*-]\s+/)
            .filter((point) => point.trim())
            .join(" ");
    
          setResponse(formattedResponse);
          
    
          const createChatRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/create`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userSearch: [
                  { userMessage: prompt, botResponse: formattedResponse},
                ],
                userId,
                type:"deepSeek"
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
                  { chatId: chatData.id, message: firstMessage.userMessage},
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
      <div className="flex w-full justify-between bg-gray-50">
     <Navbar/>
    
        {msg?(        <>
   <div className="flex w-full justify-between bg-gray-50 text-sm overflow-y-scroll">
     <Navbar />

     <div className="min-h-screen relative bg-gray-50 flex flex-col items-center justify-center  w-4/5">
       <div
         className="max-w absolute top-4  overflow-y-scroll w-full rounded-md h-[75%] p-4 text-center  mt-20  "
         
       >
         <div className="flex flex-col sticky  h-full w-full ">
      

<div className="flex flex-col gap-1 mr-36">
 {Array(1)
   .fill(0)
   .map((_, index) => (
     <div key={index} className="animate-pulse flex flex-col gap-1 mr-36">
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

   <div className="fixed top-3 right-5 flex items-center ">
    
   </div>
 </>):(
  <>
  <div className="h-screen w-full bg-gray-50  flex-col items-center justify-center  md:hidden">

<div className="max-w-4xl w-full  rounded-md p-6 text-center">


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
  <div className="min-h-screen md:block bg-gray-50 flex flex-col items-center justify-center  ml-auto w-4/5 hidden">
  <div className="max-w-4xl w-full rounded-md p-6 text-center ml-auto mr-auto ">
  <h1 className="text-3xl mt-48  text-gray-600 mb-16">
              How can I help you today?
            </h1>
            <div className="grid grid-cols-4 gap-6">
              <div className="relative border rounded-md p-4 hover:bg-white cursor-pointer"
              onClick={() =>
                setPrompt("Solve a debate: is a tamato a fruit or a vegetable?")
              }>
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
                <p className="text-gray-500 text-sm">
                  "Solve a debate: is a tamato a fruit or a vegetable?"
                </p>
              </div>
              <div className="relative border rounded-md p-4 hover:bg-white cursor-pointer"
               onClick={() =>
                setPrompt( "Help me write a cover letter.Ask me about my education to get started")
              }>
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
                <p className="text-gray-500 text-sm">
                  "Help me write a cover letter.Ask me about my education to get
                  started"
                </p>
              </div>
              <div className="relative border rounded-md p-4 hover:bg-white cursor-pointer"
               onClick={() =>
                setPrompt("Help me plan meals for the week.")
              }>
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
                <p className="text-gray-500 text-sm">
                  "Help me plan meals for the week."
                </p>
              </div>
              <div className="relative border rounded-md p-4 hover:bg-white cursor-pointer"
               onClick={() =>
                setPrompt( "Can you help me write a function?")
              }>
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
                <p className="text-gray-500 text-sm">
                  "Can you help me write a function?"
                </p>
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
        </div>
  </>
  
  )}
      </div>
      <div className="fixed md:block top-3 right-5  items-center hidden">
        <button className="flex items-center">
          <Link
            href="/deepSeek"
            className="flex items-center hover:bg-gray-200 rounded text-black text-base p-2"
          >
            <div className="w-8 h-7 pl-1 pr-1 ">
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
                <g clipPath="url(#a)">
                  <path
                    d="M33 13.674v.53c-.197.576-.272 1.192-.581 1.73-.61 1.064-1.534 1.676-2.732 1.908-.291.057-.59.07-.584.518.018 1.56-.442 3.02-1.07 4.427-.466 1.04-1.167 1.929-1.949 2.76-.42.444-.396.47.164.676.414.153.825.318 1.225.503.244.112.584.18.515.569-.067.37-.36.501-.688.569a5.912 5.912 0 0 1-2.996-.15c-.332-.104-.522-.034-.752.14a8.46 8.46 0 0 1-1.295.818c-1.662.84-3.474.892-5.212.634-3.484-.519-5.893-2.569-7.344-5.745-.36-.79-.44-1.653-.702-2.466V19.08c.125-.084.087-.22.108-.336.359-1.94 1.297-3.53 2.939-4.661 1.578-1.086 3.37-1.225 5.206-1.004.43.052.797-.01 1.188-.142.938-.315 1.863-.71 2.893-.557.173.026.396.006.439.215.037.185-.192.223-.309.313-.649.503-.729 1.264-.097 1.686 1.191.797 2.149 1.84 3.166 2.822.485.469 1.004.893 1.636 1.159.146.061.286.159.44.02.345-.308.31-1.116-.061-1.41-1.492-1.18-1.987-3.152-1.23-4.854.108-.244.215-.452.536-.393.16.156.202.368.262.567.13.426.37.777.776.954.787.344 1.456.784 1.647 1.747.595-.56 1.228-.846 1.962-.837.681.007 1.252-.202 1.68-.734.298-.367.562-.35.818.036l.001.002ZM22.651 27.467c.094.36.205.644.537.143.044-.067.14-.1.21-.15.162-.158-.015-.216-.098-.275-1.334-.978-2.329-2.253-3.217-3.621-1.268-1.954-2.767-3.668-4.971-4.622-1.248-.54-2.538-.89-3.923-.71-.419.054-.635.238-.595.693.072.81.19 1.61.439 2.386.692 2.16 1.938 3.904 3.896 5.105.585.359 1.22.588 1.916.404.386-.103.572-.325.297-.745-.19-.292-.351-.613-.371-.98-.018-.32.116-.454.444-.415.292.036.54.17.784.312.612.359 1.209.741 1.754 1.194.847.7 1.749 1.267 2.9 1.282l-.002-.001Zm.089-6.797c-.192 1.174 1.195 1.769 1.91 1.325.267-.165.345-.32.214-.6-.371-.792-.864-1.498-1.54-2.058-.403-.334-.866-.566-1.418-.427-.207.052-.432.154-.442.4-.011.295.25.28.456.325.727.151.842.303.821 1.036l-.001-.001Zm-.58-.272c-.023-.18-.128-.301-.308-.292-.15.008-.266.12-.254.282.011.17.101.301.302.287.166-.011.243-.117.26-.276v-.001Z"
                    fill="#506BFC"
                  ></path>
                  <path
                    d="m22.652 27.469.746-.007c-.07.05-.165.084-.209.15-.332.501-.443.216-.537-.143Z"
                    fill="#4C6EF2"
                  ></path>
                </g>
                <defs>
                  <clipPath id="a">
                    <path
                      fill="#fff"
                      transform="translate(9 11.933)"
                      d="M0 0h24v17.513H0z"
                    ></path>
                  </clipPath>
                </defs>
              </svg>
            </div>
            DeepSeek
          </Link>
        </button>
      </div>
    </>
  );
};

export default page;
