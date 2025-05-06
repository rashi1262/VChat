"use client";
import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import Navbar from "../../navbar";
import { useChat } from "../../chatContext";
import { useRouter } from "next/navigation";
import { Edit, Pencil, X } from "lucide-react";
import { useCredits } from "@/context/creditContext";
import { Check, Clipboard } from "lucide-react";
import { toast, Toaster } from "sonner";
import InsufficientBalance from "@/components/InsufficientBalance";
import SecondNavbar from "@/app/SecondNavbar";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

const ChatPage = ({ params }) => {
  const { id } = use(params);
  const { hasCredits, setHasCredits } = useCredits();
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
  const [isloading, setisLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const [imgLoading, setImgLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [generatedImage, setGeneratedImage] = useState([]);
  console.log(chatHistory, "chatHistorychatHistory");
  const [copiedIndex, setCopiedIndex] = useState(null);
  const textareaRef = useRef(null);
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

      if (chatModel === "openAI") {
        console.log("Fetching updated bot response for:", editMessage);
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/openai?userId=${encodeURIComponent(
            userId
          )}&message=${encodeURIComponent(editMessage)}`
        );

        if (!response.ok)
          throw new Error("Error fetching updated bot response");

        const data = await response.json();
        console.log("Updated bot response received:", data);

        newBotResponse = data.botResponse;
        newParsedResponse = extractCodeBlocks(newBotResponse);
      } else {
        console.log("Fetching updated bot response for:", editMessage);
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
      if (searchRes.ok === 402) {
        toast.error("Insufficient credits");

        setMsg(null);
        setLoading(false);
        return;
      }
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
    if (!id || !moreChat) {
      return;
    }

    setMorePrompt(moreChat);
    setMoreChat("");
    setLoading(true);

    try {
      console.log("Fetching existing chat for ID:", id);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By/${id}`
      );

      const chatData = await response.json();

      const existingUserSearch = Array.isArray(chatData?.userSearch)
        ? chatData.userSearch
        : [];

      let newChat;

      if (chatModel === "openAI") {
        const searchRes = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/openai?userId=${encodeURIComponent(
            userId
          )}&message=${encodeURIComponent(current)}`
        );

        if (searchRes.status === 402) {
          toast.error("Insufficient credits");
          return;
        }

        if (searchRes.message) {
          toast.error("Insufficient credits");

          return;
        }

        const data = await searchRes.json();
        if (data?.remainingCredits !== undefined) {
          localStorage.setItem("remainingCredits", data.remainingCredits);
        }

        const responseText =
          typeof data === "string" ? data : JSON.stringify(data);
        newChat = {
          userMessage: moreChat,
          botResponse: data.botResponse || "no data found",
          parsedResponse: extractCodeBlocks(data.botResponse),
        };
      } else {
        console.log("Fetching bot response for message:", moreChat);
        const searchRes = await fetch(
          `${
            process.env.NEXT_PUBLIC_BASE_URL
          }/chatbot/search?userId=${encodeURIComponent(
            userId
          )}&message=${encodeURIComponent(moreChat)}`
        );

        if (searchRes.status === 402) {
          toast.error("Insufficient credits");
          return;
        }

        if (searchRes.message) {
          toast.error("Insufficient credits");

          return;
        }

        const data = await searchRes.json();
        if (data?.remainingCredits !== undefined) {
          localStorage.setItem("remainingCredits", data.remainingCredits);
        }

        const responseText =
          typeof data === "string" ? data : JSON.stringify(data);
        newChat = {
          userMessage: moreChat,
          botResponse: data.botResponse || "no data found",
          parsedResponse: extractCodeBlocks(data.botResponse),
        };
      }

      // Constructing the correct PUT request body
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
      toast.error("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    fetchBotResponse();
  }, [id]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
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
  }, [chatHistory]);

  return (
    <>
      <Toaster position="top-center" richColors />

      {hasCredits ? (
        <div className="flex w-full justify-between bg-gray-50 text-sm h-screen">
          {/* Sidebars - visible on desktop */}
          <div className="hidden md:flex">
            <Navbar />
            <SecondNavbar />
          </div>

          {/* Main chat area */}
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Chat content area */}
            <div
              className="flex-1 overflow-y-auto p-4 mt-14"
              ref={chatContainerRef}
            >
              {isloading ? (
                <div className="flex flex-col jurisdictions-4 p-4">
                  {Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse flex flex-col gap-2"
                      >
                        <div className="self-end bg-gray-200 h-6 w-1/4 rounded-lg"></div>
                        <div className="self-start bg-gray-300 h-6 w-1/2 rounded-lg"></div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="space-y-6 max-w-4xl mx-auto">
                  {chatHistory.map((chat, index) => (
                    <div key={index} className="flex flex-col gap-4">
                      {/* User message */}
                      <div className="flex justify-end">
                        <div className="flex items-start gap-2 max-w-[70%]">
                          {editIndex !== index && (
                            <button
                              onClick={() => {
                                setEditIndex(index);
                                setEditMessage(chat.userMessage);
                              }}
                              className="text-gray-500 hover:text-gray-700 mt-2"
                            >
                              <Pencil size={15} />
                            </button>
                          )}

                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              editIndex === index
                                ? "bg-gray-100 w-full"
                                : "bg-blue-500 text-white"
                            } max-w-full break-words`}
                          >
                            {editIndex === index ? (
                              <div className="flex items-start w-full">
                                {/* Hidden Mirror Element for height adjustment */}
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

                                {/* Main editable container */}
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

                                  {/* Buttons */}
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
                                        handleAddChat();
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
                              <span
                                className="whitespace-pre-wrap break-words"
                                style={{ fontSize: "inherit" }}
                              >
                                {chat.userMessage}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bot response */}
                      <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-2xl max-w-[70%] break-words">
                          {(chat.parsedResponse?.length > 0
                            ? chat.parsedResponse
                            : [{ type: "text", content: chat.botResponse }]
                          ).map((part, i) =>
                            part.type === "code" ? (
                              <div
                                key={i}
                                className="my-4 border border-gray-300 rounded-md overflow-hidden"
                              >
                                <div className="flex justify-between items-center bg-gray-100 px-3 py-2 text-sm text-gray-700 font-medium">
                                  <span className="capitalize">
                                    {part.language || "Code"}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopy(part.content, i);
                                    }}
                                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                                  >
                                    {copiedIndex === i ? (
                                      <>
                                        <Check size={12} />
                                        Copied!
                                      </>
                                    ) : (
                                      <>
                                        <Clipboard size={12} />
                                        Copy code
                                      </>
                                    )}
                                  </button>
                                </div>

                                <SyntaxHighlighter
                                  style={oneLight}
                                  language={part.language || "javascript"}
                                  customStyle={{
                                    margin: 0,
                                    fontSize: "0.875rem",
                                    lineHeight: "1.5",
                                    backgroundColor: "#f8fafc",
                                  }}
                                  codeTagProps={{
                                    style: {
                                      fontFamily: "monospace",
                                    },
                                  }}
                                  wrapLongLines={true}
                                  showLineNumbers={true}
                                >
                                  {String(part.content).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                              </div>
                            ) : (
                              <span
                                key={i}
                                className="whitespace-pre-wrap break-words"
                                style={{ fontSize: "inherit" }}
                              >
                                <ReactMarkdown>{part.content}</ReactMarkdown>
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Loading indicator for additional prompts */}
                  {morePrompt !== "" && loading && (
                    <div className="flex justify-start px-4 py-2">
                      <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-2xl max-w-xs">
                        <div className="flex space-x-1">
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.1s]"></span>
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.2s]"></span>
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:.3s]"></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input area - fixed at bottom */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-end gap-2 max-w-3xl mx-auto bg-gray-100 rounded-xl px-3 py-2">
                <div className="flex-1 relative">
                  <textarea
                    value={moreChat}
                    onChange={(e) => {
                      setMoreChat(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = `${Math.min(
                        e.target.scrollHeight,
                        150
                      )}px`;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddChat();
                      }
                    }}
                    placeholder="Ask anything..."
                    className="w-full p-3 pr-10 bg-transparent focus:outline-none resize-none max-h-[150px] whitespace-pre-wrap break-words"
                    style={{
                      minHeight: "24px",
                      overflowY: "auto",
                      fontSize: "inherit",
                      // Inherit font size
                    }}
                    rows={1}
                  />
                  <button
                    onClick={handleAddChat}
                    disabled={loading || !moreChat.trim()}
                    className={`absolute right-3 bottom-3 p-1 rounded-md ${
                      loading
                        ? "text-gray-400"
                        : moreChat.trim()
                        ? "text-gray-600 hover:bg-gray-200"
                        : "text-gray-400"
                    }`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <InsufficientBalance />
      )}
    </>
  );
};

export default ChatPage;
