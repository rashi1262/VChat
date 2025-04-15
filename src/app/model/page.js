"use client";
import { useState, useEffect, useRef } from "react";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { useCredits } from "@/context/creditContext";
import VoiceToText from "@/components/VoiceToText";
import Navbar from "../navbar";
import { ChevronDown, ChevronUp } from "lucide-react";
import InsufficientBalance from "@/components/InsufficientBalance";
import { cards, Card } from "@/components/utils";
const page = ({ params }) => {
  const { hasCredits } = useCredits();
  const [showPopup, setShowPopup] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const [showButtons, setShowButtons] = useState(false);
  const [expandedIndexes, setExpandedIndexes] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isSpeechOpen, setIsSpeechOpen] = useState(false);
  const [chatId, setChatId] = useState(null);
  
  const handleVoiceInput = (voiceText) => {
    setPrompt((prevPrompt) => prevPrompt + " " + voiceText);
  };

  useEffect(() => {
    const handleClick = (event) => {
      const user = localStorage.getItem("user");
  
      if (!user) {
        const isTextarea =
          event.target.closest("textarea");
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

  const toggleExpand = (index) => {
    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
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


      } catch (error) {


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
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("message", current); // `current` is your message text

      if (selectedFile) {
        formData.append("file", selectedFile); // Attach the file if selected
      }

      const searchRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/searchs`, {
        method: "POST",
        body: formData, // No need to set headers — browser auto-handles it
      });



      if (searchRes.status === 402) {
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
      }

      router.push(`/chat/${chatData.id}`);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleResponse();
    }
  };
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file); // Save file for later API use
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Preview
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
    setShowUploadDialog(false);
  };

  const removeImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
  };

  return (
    <>
      {hasCredits ? (
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
                                className="flex flex-col gap-2 p-4"
                                key={index}
                              >
                                {/* User Message - Right Side */}
                                <div className="flex justify-end">
                                  <div className={`text-white w-fit bg-gray-500 rounded-[24px_4px_24px_24px] max-w-[444px] px-4 py-2 text-center text-lg relative ${!expandedIndexes.includes(index) ? "line-clamp-3" : ""
                                    } mr-3`}>
                                    {msg}
                                    {msg.length > 100 && (
                                      <button
                                        onClick={() => toggleExpand(index)}
                                        className="text-blue-300 text-sm absolute right-0 top-0"
                                      >
                                        {expandedIndexes.includes(index) ? (
                                          <ChevronUp />
                                        ) : (
                                          <ChevronDown />
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Bot Typing - Left Side */}
                                <div className="flex justify-start">
                                  <div className="bg-gray-300 w-fit text-lg px-4 py-1 rounded-lg animate-pulse text-left">
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

                    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-[750px] max-h-[300px] bg-white border border-gray-300 shadow-md rounded-2xl px-4 py-2 flex flex-col z-50">
                      <div className="flex-grow overflow-y-auto">
                        <textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder="Send a message..."
                          rows={1}
                          className="w-full resize-none focus:outline-none text-base text-[#444] bg-white max-h-[150px] overflow-y-auto"
                          style={{ minHeight: '40px', height: 'auto' }}
                        />
                      </div>

                      {imagePreview && (
                        <div className="relative mt-2 w-full max-w-xs">
                          <img src={imagePreview} alt="Preview" className="rounded-lg w-full h-auto object-cover" />
                          <button
                            onClick={removeImage}
                            className="absolute top-1 right-1 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-gray-100"
                          >
                            &times;
                          </button>
                        </div>
                      )}

                      {/* Bottom Row */}
                      <div className="flex justify-between items-center mt-2">
                        {/* + Button for file menu */}
                        <button onClick={() => setShowUploadDialog((prev) => !prev)} className="text-gray-500 hover:text-black p-2 flex items-center justify-center h-7 w-7">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>

                        <VoiceToText onResult={handleVoiceInput} />

                        <button
                          onClick={handleResponse}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-all ml-2"
                        >
                          {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 18" className="w-5 h-5">
                              <path
                                fillRule="evenodd"
                                d="M2.017 2.25c-.053.135.02.355.166.795l1.713 5.162A1 1 0 0 1 4 8.2h5.5a.8.8 0 1 1 0 1.6H4a1 1 0 0 1-.151-.014l-1.66 4.96c-.148.44-.222.66-.169.796a.4.4 0 0 0 .267.242c.14.039.352-.056.776-.247l13.45-6.053c.415-.186.622-.28.686-.409a.4.4 0 0 0 0-.356c-.064-.13-.271-.223-.685-.41L3.059 2.256c-.423-.19-.635-.285-.775-.246a.4.4 0 0 0-.267.24"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>

                      {showUploadDialog && (
                        <div className="absolute bottom-20 left-10 w-64 bg-white shadow-lg border border-gray-300 rounded-xl p-2 z-50">
                          <button
                            onClick={() => {
                              console.log("Google Drive clicked");
                              setShowUploadDialog(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm flex items-center gap-2"
                          >
                            <span>📁</span> Connect to Google Drive
                          </button>
                          <button
                            onClick={() => {
                              console.log("OneDrive clicked");
                              setShowUploadDialog(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm flex items-center gap-2"
                          >
                            <span>☁️</span> Connect to Microsoft OneDrive
                          </button>
                          <button
                            onClick={() => {
                              fileInputRef.current.value = null;
                              fileInputRef.current.click();
                            }}
                            className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 text-sm flex items-center gap-2"
                          >
                            <span>🖼️</span> Upload from computer
                          </button>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </>
            )}
          </div>
          {showPopup && (
          <AuthPopup />
          )}
        </div>
      ) : (
        <InsufficientBalance />
      )}
    </>
  );
};

export default page;

export const AuthPopup = () => {
  return (
    <>
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
    </>
  )
}


