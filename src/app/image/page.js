"use client";
import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../navbar";
import { useRouter } from "next/navigation";
import { useChat } from ".././chatContext";
import { toast, Toaster } from "sonner";
import { useCredits } from "@/context/creditContext";
import InsufficientBalance from "@/components/InsufficientBalance";
import { AuthPopup } from "../model/page";
import { Send, Plus, Volume2, Mic } from "lucide-react";

const page = () => {
  const { hasCredits } = useCredits();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prompt, setPrompt] = useState("");
  const [userId, setUserId] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const { chatThread, setChatThread } = useChat();
  const [showPopup, setShowPopup] = useState(false);
  const router = useRouter();
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     try {
  //       const storedUser = localStorage.getItem("user");
  //       if (!storedUser) {
  //         router.push("/home");
  //         return;
  //       } else {
  //         const user = JSON.parse(storedUser);
  //         setEmail(user?.email || "No Email");
  //         setName(user?.name || "No Name");
  //         setUserId(user?.id);
  //       }
  //     } catch (error) {}
  //   }
  // }, []);


  const controlHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
    setPrompt(textarea.value);
  };
  

  useEffect(() => {
    const handleClick = (event) => {
      const user = localStorage.getItem("user");

      if (!user) {
        const isTextarea = event.target.closest("textarea");
        if (isTextarea) {
          setShowPopup(true);
        }
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
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
    if (prompt.trim() === "") return;

    setLoading(true);
    try {
      const current = prompt;
      setMsg(current);
      setPrompt("");

      const searchRes = await fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_URL
        }/chatbot/generate-image?userId=${userId}&prompt=${encodeURIComponent(
          current
        )}`
      );

      if (searchRes.status === 400) {
        toast.error("Insufficient credits");
        setMsg(null);
        setLoading(false);
        return;
      }

      if (!searchRes.ok) throw new Error("Error fetching bot response");

      const data = await searchRes.json();
      const formattedResponse = data.imageUrl || "No Image URL";
      setResponse(formattedResponse);

      const createChatRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userSearch: [
              { userMessage: current, botResponse: formattedResponse },
            ],
            userId,
            type: "ImageGeneration",
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
              { chatId: chatData.id, message: firstMessage.userMessage },
            ];
          }
          return prev;
        });
      }

      router.push(`/imageChat/${chatData.id}`);
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
                      <div className="flex flex-col gap-1 ">
                        {Array(1)
                          .fill(0)
                          .map((_, index) => (
                            <div
                              key={index}
                              className="animate-pulse flex flex-col gap-1 "
                            >
                              <div className="self-end bg-gray-200 h-6 w-1/5 rounded-lg"></div>

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
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center  md:ml-auto md:w-full relative ">
              <div className="flex justify-center items-center h-screen">
                <div className="md:max-w-4xl w-full rounded-md p-6 text-center">
                  <div className="w-16 h-16 rounded-full md:ml-[240px] mx-auto mb-10 ">
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
                  <h1 className="text-2xl text-gray-900">Image Generation</h1>
                  <p className="text-[18px] mt-5 text-gray-400">
                    Bring your ideas to life—create stunning images from just a
                    few words!
                 </p>

                  <p></p>

               
                </div>
                <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[750px] px-4 py-2 z-2">
 <div className="w-full bg-gray-100 border border-gray-300 rounded-2xl px-4 py-2 flex justify-between shadow-sm flex-col">
 <textarea
    value={prompt}
    onChange={controlHeight}
    onKeyDown={handleKeyDown}
    placeholder="Send a message..."
    rows={1}
    className="w-full resize-none focus:outline-none text-base text-[#444] bg-transparent max-h-[200px] overflow-y-auto rounded-lg px-2 py-2 placeholder:text-gray-400"
    style={{ minHeight: "40px", height: "auto" }}
  />

  {/* Icons Section */}
  <div className="flex justify-between items-center mt-2">
    {/* Left Side Icons */}
    <div className="flex gap-x-2">
      {/* Upload/Plus */}
      <button
        onClick={() => setShowUploadDialog((prev) => !prev)}
        className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white"
      >
        <Plus className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
      </button>

      {/* Speaker */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white"
      >
        <Volume2 className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
      </button>

      {/* Mic */}
      <div className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white">
        <Mic className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
      </div>
    </div>

    {/* Send Button */}
    <button
      onClick={handleResponse}
      className="w-10 h-10 p-2 rounded-full flex items-center justify-center shadow-sm bg-neutral-800 text-white hover:bg-neutral-900 transition-all"
    >
      <Send className="w-5 h-5" />
    </button>
  </div>
  </div>

</div>
              </div>
            </div>
          )}
          {showPopup && <AuthPopup />}
        </div>
      ) : (
        <InsufficientBalance />
      )}
    </>
  );
};

export default page;
