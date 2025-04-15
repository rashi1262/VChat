"use client";
import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import Navbar from "../../navbar";
import { useChat } from "../../chatContext";
import { useRouter } from "next/navigation";
import { Edit, Pencil,ChevronDown, ChevronUp, Check, Clipboard, Volume2 } from "lucide-react";
import { useCredits } from "@/context/creditContext";
import InsufficientBalance from "@/components/InsufficientBalance";
import ReactMarkdown from "react-markdown";
import VoiceToText from "@/components/VoiceToText";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

import hljs from 'highlight.js';
import SpeechToSpeech from "@/components/SpeechToSpeech";

const CodeBlock = ({ code, language = "text", onCopy, copied }) => {
  // Auto-detect the language if not provided
  const detectedLanguage = language === "text" ? hljs.highlightAuto(code).language : language;

  return (
    <div className="relative mt-4 rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center bg-[#f0f2f5] px-4 py-2 text-sm font-medium text-gray-600">
        <span>{detectedLanguage?.toUpperCase()}</span>
        <button
          onClick={onCopy}
          className="text-xs bg-white px-2 py-1 rounded-md border hover:bg-gray-100"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <SyntaxHighlighter
        language={detectedLanguage}
        style={oneLight}
        showLineNumbers
        wrapLines={true}
        customStyle={{
          margin: 0,
          padding: "1rem",
          backgroundColor: "#f6f8fa",
          fontSize: "14px",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};


const ChatPage = ({ params }) => {
  const fileInputRef = useRef(null);
  const { hasCredits, setHasCredits } = useCredits();
  const { id } = use(params);
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { chatThread, setChatThread } = useChat();
  const router = useRouter();
  const [botResponse, setBotResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [morePrompt, setMorePrompt] = useState("");
  const [moreResponse, setMoreResponse] = useState("");
  const [userId, setUserId] = useState(null);
  const [moreChat, setMoreChat] = useState("");
  const [chatModel, setChatModel] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const [isloading, setisLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [generatedImage, setGeneratedImage] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [response, setResponse] = useState("");
  const [displayedResponse, setDisplayedResponse] = useState("");
  const [expandedIndexes, setExpandedIndexes] = useState([]);
  const [image, setImage] = useState('');
  const [fileName, setFileName] = useState('');
  const textareaRef = useRef(null);
  const controlHeight = (e) => {
    const textarea = e.target;
  
    // Reset height to calculate scrollHeight accurately
    textarea.style.height = 'auto';
  
    // Limit height to max 200px
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  
    setMoreChat(textarea.value);
  };
  
  const handleplusicon =()=>{
    setIsVisible(!isVisible);
  }
  useEffect(() => {
    const storedImage = localStorage.getItem('image');
    if (storedImage) {
      setImage(storedImage);
    }
  }, []);
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setIsVisible(false);
    if (file) {
      setFileName(file.name);
  
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          localStorage.setItem('image', reader.result);
          setImage(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImage(null); 
      }
    }
  };
  const handleCancelSelection = () => {
    setImage(null);
    setFileName("");
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
  
  const toggleExpand = (index) => {
    setExpandedIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  }   
  const handleVoiceInput = (voiceText) => {
    setMoreChat((prevPrompt) => prevPrompt + " " + voiceText);
  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000); // Reset after 2s
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSaveEdit = async (index) => {
    if (!editMessage.trim()) return;
    setLoading(true);
    try {
      let newBotResponse, newParsedResponse;
      setLoading(true);
      if (chatModel === "ImageGeneration") {
        console.log("Generating updated image for prompt:", editMessage);
        const imageRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/generate-image?userId=${encodeURIComponent(
            userId
          )}&prompt=${encodeURIComponent(editMessage)}`
        );
        if (!imageRes.ok) throw new Error("Error generating image");
        const imageData = await imageRes.json();
        newBotResponse = imageData.imageUrl;
        newParsedResponse = null;
      } else {
        console.log("Fetching updated bot response for:", editMessage);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/search?userId=${encodeURIComponent(
            userId
          )}&message=${encodeURIComponent(editMessage)}`
        );
        if (!response.ok)
          throw new Error("Error fetching updated bot response");
        const data = await response.json();
        console.log("Updated bot response received:", data);
        newBotResponse = data.botResponse;
        newParsedResponse = extractCodeBlocks(newBotResponse);
      }
      setChatHistory((prevChats) =>
        prevChats.map((chat, i) =>
          i === index
            ? {
                ...chat,
                userMessage: editMessage,
                botResponse: newBotResponse,
                parsedResponse: newParsedResponse,
              }
            : chat
        )
      );
      const requestBody = JSON.stringify({
        id,
        userSearch: [
          {
            userMessage: editMessage,
            botResponse: newBotResponse,
            parsedResponse: newParsedResponse,
          },
        ],
      });
      console.log("PUT Request Body:", requestBody);
      const updateRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/update-by/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        }
      );
      if (!updateRes.ok) {
        const errorText = await updateRes.text();
        console.error("Update API Error Response:", errorText);
        throw new Error(`Error updating chat data: ${errorText}`);
      }
      console.log("Chat updated successfully!");
      fetchBotResponse();
      setEditIndex(null);
    } catch (error) {
      console.error("Error updating chat:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleCopy = (code, index) => {
  //   navigator.clipboard.writeText(code).then(() => {
  //     setCopiedIndex(index);
  //     setTimeout(() => setCopiedIndex(null), 2000);
  //   });
  // };

  useEffect(() => setisLoading(true), [id]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setEmail(user?.email || "No Email");
          setName(user?.name || "No Name");
          setUserId(user?.id);
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
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
        if (!response.ok) throw new Error("Failed to fetch chats");
        const data = await response.json();
        setChatThread(
          data.chatMessages.map((chat) => ({
            chatId: chat.id,
            message: chat.userSearch[0]?.userMessage,
          }))
        );
      } catch (error) {
        console.error("Error fetching user chats:", error);
      }
    };
    fetchUserChats();
  }, [userId]);
  const fetchBotResponse = async () => {
    try {
      const searchRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By/${id}`
      );
      if (!searchRes.ok) throw new Error("Error fetching bot response");
      const data = await searchRes.json();
      console.log(data, "datadata");
      setisLoading(false);
      setChatModel(data?.type);
      setChatHistory(
        (data?.userSearch || []).map((chat) => ({
          ...chat,
          parsedResponse: extractCodeBlocks(chat.botResponse),
        }))
      );
      if (data?.type === "ImageGeneration") setGeneratedImage(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (id) fetchBotResponse();
  }, [id]);
  const extractCodeBlocks = (message) => {
    if (!message) {
      console.error(
        "extractCodeBlocks error: message is null or undefined",
        message
      );
      return [{ type: "text", content: "Unknown message" }];
    }
    const messageStr =
      typeof message === "string" ? message : JSON.stringify(message);
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let parts = [],
      lastIndex = 0;
    messageStr.replace(codeBlockRegex, (match, code, index) => {
      if (index > lastIndex) {
        parts.push({
          type: "text",
          content: messageStr.slice(lastIndex, index),
        });
      }
      parts.push({ type: "code", content: code });
      lastIndex = index + match.length;
    });
    if (lastIndex < messageStr.length) {
      parts.push({ type: "text", content: messageStr.slice(lastIndex) });
    }
    return parts.length > 0 ? parts : [{ type: "text", content: messageStr }];
  };
  const handleAddChat = async () => {
    if (!id || (!moreChat.trim() && !selectedFile)) {
      return;
      }

    setMorePrompt(moreChat);
    setMoreChat("");
    setLoading(true);
    setIsVisible(false);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "40px";        
      el.style.overflowY = "hidden";    
    }
    try {
      console.log("Fetching existing chat for ID:", id);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By/${id}`
      );
      if (!response.ok) throw new Error("Error fetching existing chat data");
      const chatData = await response.json();
      const existingUserSearch = Array.isArray(chatData?.userSearch)
        ? chatData.userSearch
        : [];
      let newChat;
      if (chatModel === "ImageGeneration") {
        console.log("Generating image for prompt:", moreChat);
        const imageRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/generate-image?userId=${encodeURIComponent(
            userId
          )}&prompt=${encodeURIComponent(moreChat)}`
        );

        if (!imageRes.ok) throw new Error("Error generating image");
        const imageData = await imageRes.json();
        newChat = {
          userMessage: moreChat,
          botResponse: imageData.imageUrl,
          parsedResponse: null,
        };
        setGeneratedImage(imageData.imageUrl);
        setImgLoading(false);
      } else {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('message', moreChat);
        if (selectedFile) {
        formData.append('file', selectedFile); // 👈 Pass the file here
        }
        const searchRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/searchs`, {
        method: 'POST',
        body: formData,
        });
        if (!searchRes.ok) throw new Error("Error fetching bot response");
        const data = await searchRes.json();
        setSelectedFile(null);
        setImagePreview(null);
        setMoreChat('');
        if (
          typeof window !== "undefined" &&
          data?.remainingCredits !== undefined
        ) {
          localStorage.setItem("remainingCredits", data.remainingCredits);
        }
        const responseText =
          typeof data === "string" ? data : JSON.stringify(data);
        newChat = {
          userMessage: moreChat,
          botResponse: data.botResponse,
          parsedResponse: extractCodeBlocks(data.botResponse),
        };
      }
      const requestBody = JSON.stringify({
        id, // Ensuring ID is included in the request
        userSearch: [newChat],
      });
      console.log("PUT Request Body:", requestBody);
      console.log(newChat, "newChat");
      const updateRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/update-by/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        }
      );
      const updateResponseText = await updateRes.text();
      if (!updateRes.ok) {
        console.error("Update API Error Response:", updateResponseText);
        throw new Error(`Error updating chat data: ${updateResponseText}`);
      }
      console.log("Chat updated successfully!");
      setChatHistory((prevChats) => [...prevChats, newChat]);
    } catch (error) {
      console.error("Error adding new chat:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!id) return;
    fetchBotResponse();
  }, [id]);

  const handleKeyDown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
  e.preventDefault();
  handleAddChat();
  setMoreChat("");
  const el = textareaRef.current;
  if (el) {
  el.style.height = "40px";
  el.style.overflowY = "hidden";
  }
  }
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);
  return (
    <>
      {hasCredits ? (
        <div className="flex w-full justify-between bg-gray-50 text-sm overflow-y-scroll">
          <Navbar />
          <div className="h-screen w-full bg-gray-50  flex-col items-center justify-center  md:hidden">
            <div
              className="max-w absolute top-4  overflow-y-scroll rounded-md h-[75%] p-4 text-center  mt-20  "
              ref={chatContainerRef}
            >
              <div className="flex flex-col sticky  h-full w-full ">
                {isloading ? (
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
                ) : (
                  chatHistory.map((chat, index) => (
                    <div key={index} className="flex flex-col gap-1 ">
                      <div className="flex flex-col overflow-y-auto max-h-[500px]">
                        <div className="flex justify-end w-full ">
                          {editIndex !== index && (
                            <button
                              onClick={() => {
                                setEditIndex(index);
                                setEditMessage(chat.userMessage);
                              }}
                              className="text-black rounded-md text-sm "
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          <div
                            className={`relative mt-2 px-3 py-2  max-w-[70%] flex flex-col rounded-[24px_4px_24px_24px]  gap-2 transition-all duration-200 ${editIndex === index
                                ? "bg-gray-500 w-[70%]"
                                : "bg-gray-600"
                            }`}
                          >
                            {editIndex === index ? (
                              <div className="flex flex-col w-full">
                                <input
                                  type="text"
                                  value={editMessage}
                                  onChange={(e) =>
                                    setEditMessage(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSaveEdit(index);
                                      handleAddChat();
                                      setEditIndex(null);
                                    }
                                  }}
                                  className="w-full bg-transparent text-white p-2 rounded-md outline-none "
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <button
                                    onClick={() => setEditIndex(null)}
                                    className="px-3 py-1 bg-gray-400 text-white rounded-md"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleSaveEdit(index);
                                      handleAddChat();
                                      setEditIndex(null);
                                    }}
                                    className="px-3 py-1 bg-green-500 text-white rounded-md"
                                  >
                                    Send
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="break-words bg-black text-white">
                                {chat.userMessage}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                    </div>
                  ))
                )}
                {morePrompt !== "" && (
                  <div className="flex flex-col gap-1 ml-36">
                    {loading && (
                      <div className="mself-start bg-gray-300 text-black px-3 py-2 rounded-xl max-w-[5%] flex items-center gap-2">
                        <span className="animate-pulse">...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="mb-5 ml-10 w-3/4 p-1 flex bg-gray-100 justify-between items-center fixed bottom-0 left-1/2 transform -translate-x-1/2  rounded-l-full rounded-r-full">
                <input
                  type="text"
                  value={moreChat}
                  onChange={(e) => setMoreChat(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Send a messaghio3rqwl;kasz."
                  className="w-3/4 p-1 rounded focus:outline-none text-black bg-gray-100"
                />

                <button
                  onClick={handleAddChat}
                  className=" p-1 rounded-full bg-white flex items-center justify-center"
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
          <div className="min-h-screen md:block relative bg-gray-50  flex-col items-center justify-center  w-[80%] hidden">
            <div
              className="max-w absolute top-4  overflow-y-scroll w-full rounded-md h-[75%] p-4 text-start  mt-20  "
              ref={chatContainerRef}
            >
              <div className="flex flex-col sticky  h-full w-full ">
                {isloading ? (
                  <div className="flex flex-col gap-1 ">
                    {Array(1)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={index}
                          className="animate-pulse flex flex-col gap-1 "
                        >
                        
                        </div>
                      ))}
                  </div>
                ) : (
                  chatHistory.map((chat, index) => (
                    <div key={index} className="flex flex-col ">
                      <div className="flex flex-col overflow-y-auto max-h-[500px]">
                        <div className="flex justify-end">
                          {editIndex !== index && (
                            <button
                              onClick={() => {
                                setEditIndex(index);
                                setEditMessage(chat.userMessage);
                              }}
                              className="text-black rounded-md text-sm "
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          <div
                            className={`relative  px-3 py-2 text-lg flex flex-col rounded-[24px_4px_24px_24px] w-fit break-words gap-2 transition-all duration-200 ${
                              editIndex === index
                                ? "bg-gray-500"
                                : "bg-gray-600"
                            }`}
>
                            {editIndex === index ? (
                              <div className="flex flex-col w-full">
                                <input
                                  type="text"
                                  value={editMessage}
                                  onChange={(e) =>
                                    setEditMessage(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleSaveEdit(index);
                                      handleAddChat();
                                      setEditIndex(null);
                                    }
                                  }}
                                  className="w-full bg-transparent text-[#3d3d3d] p-2 rounded-md outline-none "
                                  autoFocus
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <button
                                    onClick={() => setEditIndex(null)}
                                    className="px-3 py-1 bg-black text-white rounded-md"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleSaveEdit(index);
                                      handleAddChat();
                                      setEditIndex(null);
                                    }}
                                    className="px-3 py-1 bg-green-500 text-white rounded-md"
                                  >
                                    Send
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <div className="max-w-96  w-fit text-white break-words relative">
                                  <span
                                    className={`${
                                      !expandedIndexes.includes(index)
                                        ? "line-clamp-3"
                                        : ""
                                    } `}
                                  >
                                    <div className="mr-3">
                                    {chat.userMessage}
                                    </div>          
                                  </span>

                                  {chat.userMessage.length > 100 && (
                                    <button
                                      onClick={() => toggleExpand(index)}
                                      className="text-blue-300 text-sm absolute right-0  top-0"
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
                            )}
                          </div>
                        </div>
                      </div>
                      {chatModel === "ImageGeneration" && chat.botResponse ? (
                        <div className="ml-36 self-start">
                          {loading && chat.userMessage === morePrompt ? (
                            <div className="w-48 h-48 bg-gray-300 flex items-center justify-center rounded-xl">
                              <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <img
                              src={chat.botResponse}
                              alt={`Generated image for ${chat.userMessage}`}
                              className="rounded-xl max-w-96  h-auto"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="ml-36  self-start text-left text-lg text-black px-3 py-2 m-2 rounded-xl max-w-[70%] break-words whitespace-pre-wrap">
                          {(chat.parsedResponse &&
                          chat.parsedResponse.length > 0
                            ? chat.parsedResponse
                            : [{ type: "text", content: chat.botResponse }]
                          ).map((part, i) =>
                            part.type === "code" ? (
                              <CodeBlock
                                key={i}
                                code={part.content}
                                language={part.language || "text"} // You can default to "text" or auto-detect
                                copied={copiedIndex === i}
                                onCopy={() => handleCopy(part.content, i)}
                              />
                            ) : (
                              <ReactMarkdown key={i}>{part.content}</ReactMarkdown>
                            )
                          )}
                        </div>

                      )}
                    </div>
                  ))
                )}

                {morePrompt !== "" && (
                  <div className="flex flex-col gap-1 ml-36">
                    {loading ? (
                      chatModel === "ImageGeneration" ? (
                        <div className="w-48 h-48 bg-gray-300 flex items-center justify-center rounded-xl my-5">
                          <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <div>
                     

                          <div className="self-start  bg-gray-300 text-black px-3 py-2 rounded-xl max-w-[5%] flex items-center gap-2">
                            <span className="animate-pulse">typing...</span>
                          </div>
                        </div>
                      )
                    ) : null}
                  </div>
                )}
              </div>

              {showUploadDialog && (
                    <div className="absolute bottom-20 left-70  w-64 bg-white shadow-lg border border-gray-300 rounded-xl p-2 ">
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
    fileInputRef.current.value = null; // Reset input so onChange fires even for same file
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
            
 

              <div className="fixed bottom-0 ml-[75px] left-1/2 transform -translate-x-1/2 w-[750px] max-h-[300px] bg-white border border-gray-300 shadow-md rounded-2xl px-4 py-2 flex flex-col">

  <div className="flex-grow overflow-y-auto">


    <textarea
      ref={textareaRef}
      value={moreChat}
      onChange={controlHeight}
      onKeyDown={handleKeyDown}
      placeholder="Ask Gemini..."
      rows={1}
      className="w-full resize-none focus:outline-none text-base text-[#444] bg-white max-h-[150px] overflow-y-auto"
      style={{ minHeight: '40px', height: 'auto' }}
    />
  </div>

  {/* Bottom Row: Plus Icon, Mic, and Send Button */}
  <div className="flex justify-between items-center mt-2" style={{ height: '35px' }}>
    
    {/* Plus Icon Button */}
    <button onClick={() => setShowUploadDialog((prev) => !prev)} className="text-gray-500 hover:text-black p-2 flex items-center justify-center h-7 w-7">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    </button>

    <div className="w-full p-2">
{/* {/ Image Preview /} */}
{imagePreview && (
<div className="relative mb-2 w-full max-w-xs">
<img src={imagePreview} alt="Preview" className="rounded-lg w-full h-auto object-cover" />
<button
onClick={removeImage}
className="absolute top-1 right-1 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-gray-100"
>
&times;
</button>
</div>
)}

</div>

    {/* Voice Mic */}
    <VoiceToText onResult={handleVoiceInput} />
    <Volume2 onClick={() => setIsOpen(true)} className="text-blue-500 ml-2 cursor-pointer" />
    {/* Send Button */}
    <button
      onClick={handleAddChat}
      className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-xl transition-all"
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

  
  {isVisible && (
    <div className="bg-white text-gray p-4 rounded-md shadow-lg absolute z-10" style={{ bottom: '65px', left: '90px' }}>
      <button
  onClick={() => document.getElementById('imageInput')?.click()}
  className="flex items-center mb-2"
>
  {/* Image Icon - Photo or Camera */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="w-4 h-4 text-gray"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 7h2l2-3h10l2 3h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1zm9 10a4 4 0 100-8 4 4 0 000 8z"
    />
  </svg>
  <span className="ml-2">Image</span>
</button>

<button
  onClick={() => document.getElementById('fileInput')?.click()}
  className="flex items-center"
>
 
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    className="w-4 h-4 text-gray"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 7h10M7 11h10M7 15h6M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
    />
  </svg>
  <span className="ml-2">Files</span>
</button>


      <input
        type="file"
        id="imageInput"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        id="fileInput"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )}
</div>
        
            </div>
          </div>
        </div>
      ) : (
        <InsufficientBalance />
      )}

      {isOpen && <SpeechToSpeech setIsOpen={setIsOpen} userId={userId} id={id}/>}
    </>
  );
};

export default ChatPage;
