"use client";
import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import Navbar from "../../navbar";
import { useChat } from "../../chatContext";
import { useRouter } from "next/navigation";
import {
  Edit,
  Pencil,
  ChevronDown,
  ChevronUp,
  Check,
  Clipboard,
  Volume2,
  Sparkle,
} from "lucide-react";
import { Plus, Mic, File, Send } from "lucide-react";
import { useCredits } from "@/context/creditContext";
import InsufficientBalance from "@/components/InsufficientBalance";
import ReactMarkdown from "react-markdown";
import VoiceToText from "@/components/VoiceToText";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import hljs from "highlight.js";
import SpeechToSpeech from "@/components/SpeechToSpeech";
import SecondNavbar from "@/app/SecondNavbar";
import MobileSidebar from "@/app/MobileSidebar";

const CodeBlock = ({ code, language = "text", onCopy, copied }) => {
  const detectedLanguage =
    language === "text" ? hljs.highlightAuto(code).language : language;

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
  const [loading, setLoading] = useState(false);
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
  const [editIndex, setEditIndex] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [generatedImage, setGeneratedImage] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedIndexes, setExpandedIndexes] = useState([]);
  const [image, setImage] = useState("");
  const [fileName, setFileName] = useState("");
  const textareaRef = useRef(null);
  const uploadRef = useRef(null);
  const mirrorRef = useRef(null);

  useEffect(() => {
    adjustSize();
  }, [editMessage]);

  const adjustSize = () => {
    const textarea = textareaRef.current;
    const mirror = mirrorRef.current;
    if (textarea && mirror) {
      mirror.textContent = editMessage || " ";
      textarea.style.height = mirror.scrollHeight + "px";
      textarea.style.width = mirror.scrollWidth + "px";
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (uploadRef.current && !uploadRef.current.contains(event.target)) {
        setShowUploadDialog(false);
      }
    };
    if (showUploadDialog) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUploadDialog]);

  const controlHeight = (e) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
    setMoreChat(textarea.value);
  };

  const handleplusicon = () => {
    setIsVisible(!isVisible);
  };

  useEffect(() => {
    const storedImage = localStorage.getItem("image");
    if (storedImage) {
      setImage(storedImage);
    }
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setIsVisible(false);
    if (file) {
      setFileName(file.name);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          localStorage.setItem("image", reader.result);
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
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
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
  };

  const handleVoiceInput = (voiceText) => {
    setMoreChat((prevPrompt) => prevPrompt + " " + voiceText);
  };

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleSaveEdit = async (index) => {
    if (!editMessage.trim()) return;
    setLoading(true);
    try {
      let newBotResponse, newParsedResponse;
      if (chatModel === "ImageGeneration") {
        const imageRes = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/generate-image?userId=${encodeURIComponent(
            userId
          )}&prompt=${encodeURIComponent(editMessage)}`
        );
        if (!imageRes.ok) throw new Error("Error generating image");
        const imageData = await imageRes.json();
        newBotResponse = imageData.imageUrl;
        newParsedResponse = null;
      } else {
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/search?userId=${encodeURIComponent(
            userId
          )}&message=${encodeURIComponent(editMessage)}`
        );
        if (!response.ok)
          throw new Error("Error fetching updated bot response");
        const data = await response.json();
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
        throw new Error(`Error updating chat data: ${errorText}`);
      }
      fetchBotResponse();
      setEditIndex(null);
    } catch (error) {
      console.error("Error updating chat:", error);
    } finally {
      setLoading(false);
    }
  };

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
      const language = messageStr
        .substring(
          index + 3,
          index + 3 + messageStr.slice(index + 3).indexOf("\n")
        )
        .trim();
      const codeContent = code.trim();
      parts.push({ type: "code", content: codeContent, language });
      lastIndex = index + match.length;
    });
    if (lastIndex < messageStr.length) {
      parts.push({ type: "text", content: messageStr.slice(lastIndex) });
    }
    return parts.length > 0 ? parts : [{ type: "text", content: messageStr }];
  };

  const handleAddChat = async () => {
    if (!id || (!moreChat.trim() && !selectedFile)) return;

    const userMessage = moreChat;
    setMoreChat("");
    setIsVisible(false);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "40px";
      el.style.overflowY = "hidden";
    }

    // Add user message to chat history
    setChatHistory((prevChats) => [
      ...prevChats,
      {
        userMessage,
        botResponse: null,
        parsedResponse: null,
      },
    ]);
    setLoading(true);

    try {
      let newChat;
      if (chatModel === "ImageGeneration") {
        const imageRes = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/generate-image?userId=${encodeURIComponent(
            userId
          )}&prompt=${encodeURIComponent(userMessage)}`
        );
        if (!imageRes.ok) throw new Error("Error generating image");
        const imageData = await imageRes.json();
        newChat = {
          userMessage,
          botResponse: imageData.imageUrl,
          parsedResponse: null,
        };
        setGeneratedImage(imageData.imageUrl);
      } else {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("message", userMessage);
        if (selectedFile) {
          formData.append("file", selectedFile);
        }
        const searchRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/searchs`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (!searchRes.ok) throw new Error("Error fetching bot response");
        const data = await searchRes.json();
        if (data?.remainingCredits !== undefined) {
          localStorage.setItem("remainingCredits", data.remainingCredits);
        }
        newChat = {
          userMessage,
          botResponse: data.botResponse || "No response",
          parsedResponse: extractCodeBlocks(data.botResponse),
        };
      }

      // Update chat history with bot response
      setChatHistory((prevChats) => {
        const updatedChats = [...prevChats];
        updatedChats[updatedChats.length - 1] = newChat;
        return updatedChats;
      });
      setLoading(false); // Hide loader immediately after updating UI
      setSelectedFile(null);
      setImagePreview(null);

      // Update backend
      const requestBody = JSON.stringify({
        id,
        userSearch: [newChat],
      });
      const updateRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/update-by/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
        }
      );
      if (!updateRes.ok) {
        const updateResponseText = await updateRes.text();
        throw new Error(`Error updating chat data: ${updateResponseText}`);
      }
      fetchBotResponse();
    } catch (error) {
      console.error("Error adding new chat:", error);
      setChatHistory((prevChats) => prevChats.slice(0, -1));
      setLoading(false);
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddChat();
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
  }, [chatHistory, loading]);

  return (
    <>
      {hasCredits ? (
        <div className="flex w-full bg-gray-50 text-sm overflow-y-scroll">
          <Navbar />
          <SecondNavbar />
          <MobileSidebar />
          <div className="min-h-screen md:flex relative bg-gray-50 items-center w-full justify-center">
            <div
              className="absolute top-4 overflow-y-auto w-full rounded-md h-[70%] p-4 text-start mt-20 max-w-4xl mx-auto"
              ref={chatContainerRef}
            >
              <div className="flex flex-col sticky h-full w-full">
                {isloading ? (
                  <div className="flex flex-col gap-1">
                    {Array(1)
                      .fill(0)
                      .map((_, index) => (
                        <div
                          key={index}
                          className="animate-pulse flex flex-col gap-1"
                        ></div>
                      ))}
                  </div>
                ) : (
                  chatHistory.map((chat, index) => (
                    <div key={index} className="flex flex-col">
                      <div className="flex flex-col overflow-y-auto max-h-[500px]">
                        <div className="flex justify-end">
                          {editIndex !== index && (
                            <button
                              onClick={() => {
                                setEditIndex(index);
                                setEditMessage(chat.userMessage);
                              }}
                              className="text-black rounded-md text-sm"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          <div
                            className={`relative overflow-hidden px-3 py-2 text-lg flex flex-col rounded-[24px_4px_24px_24px] w-fit break-words gap-2 transition-all duration-200 ${
                              editIndex === index
                                ? "bg-[#dbdbdb]"
                                : "bg-[#e9eef6]"
                            }`}
                          >
                            {editIndex === index ? (
                              <div className="flex items-start w-full">
                                <div
                                  ref={mirrorRef}
                                  className="invisible absolute whitespace-pre-wrap break-words px-4 py-2 text-base leading-snug"
                                  style={{
                                    visibility: "hidden",
                                    whiteSpace: "pre-wrap",
                                    wordWrap: "break-word",
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    zIndex: -1,
                                    padding: "8px 16px",
                                    fontSize: "inherit",
                                    fontFamily: "inherit",
                                    maxWidth: "600px",
                                  }}
                                ></div>
                                <div className="bg-[#efefef] rounded-2xl px-4 py-2 max-w-[600px] w-full">
                                  <textarea
                                    ref={textareaRef}
                                    value={editMessage}
                                    onChange={(e) =>
                                      setEditMessage(e.target.value)
                                    }
                                    onInput={adjustSize}
                                    rows={1}
                                    autoFocus
                                    className="bg-transparent outline-none resize-none text-sm text-black w-full whitespace-pre-wrap break-words"
                                    style={{
                                      overflow: "hidden",
                                      fontFamily: "inherit",
                                      fontSize: "1rem",
                                      lineHeight: "1.5",
                                    }}
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button
                                      onClick={() => setEditIndex(null)}
                                      className="bg-white text-black border px-3 py-1 rounded-full text-sm hover:bg-gray-100"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleSaveEdit(index);
                                        setEditIndex(null);
                                      }}
                                      className="bg-black text-white px-4 py-1 rounded-full text-sm hover:opacity-90"
                                    >
                                      Send
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <div className="max-w-96 w-fit text-black break-words relative">
                                  <span
                                    className={`${
                                      !expandedIndexes.includes(index)
                                        ? "line-clamp-3"
                                        : ""
                                    }`}
                                  >
                                    <div className="mr-[25px]">
                                      {chat.userMessage || "No message"}
                                    </div>
                                  </span>
                                  {chat.userMessage &&
                                    chat.userMessage.length > 100 && (
                                      <button
                                        onClick={() => toggleExpand(index)}
                                        className="text-white bg-black rounded-full text-sm absolute right-0 top-0"
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
                          <img
                            src={chat.botResponse}
                            alt={`Generated image for ${chat.userMessage}`}
                            className="rounded-xl max-w-96 h-auto"
                          />
                        </div>
                      ) : (
                        chat.botResponse && (
                          <div className="self-start text-left text-lg text-black px-3 py-2 m-2 rounded-xl md:max-w-[70%] w-full break-words whitespace-pre-wrap">
                            {(chat.parsedResponse &&
                            chat.parsedResponse.length > 0
                              ? chat.parsedResponse
                              : [{ type: "text", content: chat.botResponse }]
                            ).map((part, i) =>
                              part.type === "code" ? (
                                <CodeBlock
                                  key={i}
                                  code={part.content}
                                  language={part.language || "text"}
                                  copied={copiedIndex === i}
                                  onCopy={() => handleCopy(part.content, i)}
                                />
                              ) : (
                                <ReactMarkdown key={i}>
                                  {part.content}
                                </ReactMarkdown>
                              )
                            )}
                          </div>
                        )
                      )}
                    </div>
                  ))
                )}
                {loading && (
                  <div className="flex justify-start mb-4">
                    {chatModel === "ImageGeneration" ? (
                      <div className="w-48 h-48 bg-gray-300 flex items-center justify-center rounded-xl my-5">
                        <div className="w-8 h-8 border-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="w-fit max-w-sm px-5 py-3 flex items-center space-x-3 animate-pulse">
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          className="animate-spin-slow"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <linearGradient
                              id="sparkleGradient"
                              x1="0"
                              y1="0"
                              x2="24"
                              y2="24"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#f9a8d4" />
                            </linearGradient>
                          </defs>
                          <path
                            fill="url(#sparkleGradient)"
                            stroke="#1f2937"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"
                          />
                        </svg>
                        <span className="text-gray-700 text-base font-medium flex items-center">
                          Just a second
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 mx-auto max-w-[750px] px-4 py-2 z-20">
              {showUploadDialog && (
                <div
                  ref={uploadRef}
                  className="absolute bottom-0 left-0 w-64 bg-white shadow-lg border border-gray-300 rounded-xl p-2"
                >
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
              <div className="w-full bg-gray-100 border border-gray-300 rounded-2xl px-4 py-2 flex justify-between shadow-sm flex-col">
                <div className="flex-grow overflow-y-auto">
                  <textarea
                    ref={textareaRef}
                    value={moreChat}
                    onChange={controlHeight}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Gemini..."
                    rows={1}
                    className="w-full resize-none focus:outline-none text-base text-black bg-transparent max-h-[200px] overflow-y-auto rounded-lg px-4 py-2 placeholder:text-gray-400"
                    style={{ minHeight: "40px", height: "auto" }}
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowUploadDialog((prev) => !prev)}
                      className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white"
                    >
                      <Plus className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                    <VoiceToText onResult={handleVoiceInput} />
                    <button
                      onClick={() => setIsOpen(true)}
                      className="w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-sm bg-white"
                    >
                      <Volume2 className="w-5 h-5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="w-full px-2">
                    {imagePreview && (
                      <div className="relative mb-2 w-full max-w-xs">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="rounded-lg h-[100px] w-[100px] object-contain"
                        />
                        <button
                          onClick={removeImage}
                          className="absolute top-1 right-1 bg-white text-black rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-gray-100"
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleAddChat}
                    className="bg-neutral-800 hover:bg-neutral-900 text-white p-2 rounded-full transition-all flex items-center justify-center h-10 w-10"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {isVisible && (
                  <div className="bg-white text-gray-700 p-3 rounded-md shadow-lg absolute z-10 bottom-[65px] left-[90px] space-y-2 w-40 border border-gray-200">
                    <button
                      onClick={() =>
                        document.getElementById("imageInput")?.click()
                      }
                      className="flex items-center space-x-2 hover:text-black"
                    >
                      <File className="w-5 h-5" />
                      <span>Image</span>
                    </button>
                    <button
                      onClick={() =>
                        document.getElementById("fileInput")?.click()
                      }
                      className="flex items-center space-x-2 hover:text-black"
                    >
                      <File className="w-5 h-5" />
                      <span>Files</span>
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
      {isOpen && (
        <SpeechToSpeech setIsOpen={setIsOpen} userId={userId} id={id} />
      )}
    </>
  );
};

export default ChatPage;
