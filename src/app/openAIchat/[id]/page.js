"use client";
import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import Navbar from "../../navbar";
import { useChat } from "../../chatContext";
import { useRouter } from "next/navigation";
import { Edit, Pencil } from "lucide-react";
import { Clipboard } from "lucide-react";
const ChatPage = ({ params }) => {
  const { id } = use(params);
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
  const[imgLoading,setImgLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editMessage, setEditMessage] = useState("");
  const [generatedImage, setGeneratedImage] = useState([]);
  console.log(chatHistory, "chatHistorychatHistory");

  // const handleSaveEdit = async (index) => {
  //   if (!editMessage.trim()) return;
  
  //   setLoading(true);
  
  //   try {
  //     console.log("Fetching updated bot response for:", editMessage);
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/search?userId=${encodeURIComponent(userId)}&message=${encodeURIComponent(editMessage)}`
  //     );
  
  //     if (!response.ok) throw new Error("Error fetching updated bot response");
  
  //     const data = await response.json(); 
  //     console.log("Updated bot response received:", data);
  
  //     const newBotResponse = data.botResponse;
  //     const newParsedResponse = extractCodeBlocks(newBotResponse);
  
  //     setChatHistory((prevChats) =>
  //       prevChats.map((chat, i) =>
  //         i === index
  //           ? {
  //               ...chat,
  //               userMessage: editMessage,
  //               botResponse: newBotResponse,
  //               parsedResponse: newParsedResponse,
  //             }
  //           : chat
  //       )
  //     );
  
  //     // Constructing request body similar to handleAddChat
  //     const requestBody = JSON.stringify({
  //       id,
  //       userSearch: [
  //         {
  //           userMessage: editMessage,
  //           botResponse: newBotResponse,
  //           parsedResponse: newParsedResponse,
  //         },
  //       ],
  //     });
  
  //     console.log("PUT Request Body:", requestBody);
  
  //     const updateRes = await fetch(
  //       `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/update-by/${id}`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: requestBody,
  //       }
  //     );
  
  //     if (!updateRes.ok) {
  //       const errorText = await updateRes.text();
  //       console.error("Update API Error Response:", errorText);
  //       throw new Error(`Error updating chat data: ${errorText}`);
  //     }
  
  //     console.log("Chat updated successfully!");
  //     fetchBotResponse(); // Refresh chat history
  //     setEditIndex(null);
  //   } catch (error) {
  //     console.error("Error updating chat:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSaveEdit = async (index) => {
    if (!editMessage.trim()) return;
  
    setLoading(true);
  
    try {
      let newBotResponse, newParsedResponse;
      setLoading(true)
  
     
        console.log("Fetching updated bot response for:", editMessage);
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/openai?userId=${encodeURIComponent(userId)}&message=${encodeURIComponent(editMessage)}`

        );
  
        if (!response.ok) throw new Error("Error fetching updated bot response");
  
        const data = await response.json();
        console.log("Updated bot response received:", data);
  
        newBotResponse = data.botResponse;
        newParsedResponse = extractCodeBlocks(newBotResponse);
      
  
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
  

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
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

      if (!response.ok) throw new Error("Error fetching existing chat data");

      const chatData = await response.json();
      const existingUserSearch = Array.isArray(chatData?.userSearch)
        ? chatData.userSearch
        : [];

      let newChat;

   
      
        console.log("Fetching bot response for message:", moreChat);
        const searchRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/openai?userId=${encodeURIComponent(userId)}&message=${encodeURIComponent(moreChat)}`

        );

        if (!searchRes.ok) throw new Error("Error fetching bot response");

        const data = await searchRes.json();
        console.log("Bot response received:", data);

        const responseText =
          typeof data === "string" ? data : JSON.stringify(data);
        newChat = {
          userMessage: moreChat,
          botResponse: data.botResponse,
          parsedResponse: extractCodeBlocks(data.botResponse)

        };
      

      const requestBody = JSON.stringify({
        id, 
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
      <div className="flex w-full justify-between bg-gray-50 text-sm overflow-y-scroll">
        <Navbar />
        <div className="h-screen w-full bg-gray-50  flex-col items-center justify-center  md:hidden">
          <div
            className="max-w absolute top-4  overflow-y-scroll rounded-md h-[75%] p-4 mr-5 text-center  mt-20  "
            ref={chatContainerRef}
          >
            <div className="flex flex-col sticky  h-full w-full ">
              {isloading ? (
                <div className="flex flex-col gap-1 mr-36">
                  {Array(1)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse flex flex-col gap-1 mr-36"
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
                            className="text-black rounded-md text-sm mr-3"
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        <div
                          className={`relative mt-2 px-3 py-2 rounded-xl max-w-[70%] flex flex-col gap-2 transition-all duration-200 ${
                            editIndex === index
                              ? "bg-gray-500 w-[70%]"
                              : "bg-gray-600"
                          }`}
                        >
                          {editIndex === index ? (
                            <div className="flex flex-col w-full">
                              <input
                                type="text"
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
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
                            <span className="break-words w-full text-white">
                              {chat.userMessage}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    g
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
                placeholder="Send a message..."
                className="w-3/4 p-1 rounded focus:outline-none text-black bg-gray-100"
              />

              <button
                onClick={handleAddChat}
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
        <div className="min-h-screen md:block relative bg-gray-50  flex-col items-center justify-center  w-4/5 hidden">
          <div
            className="max-w absolute top-4  overflow-y-scroll w-full rounded-md h-[75%] p-4 text-center  mt-20  "
            ref={chatContainerRef}
          >
            <div className="flex flex-col sticky  h-full w-full ">
              {isloading ? (
                <div className="flex flex-col gap-1 mr-36">
                  {Array(1)
                    .fill(0)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse flex flex-col gap-1 mr-36"
                      >
                        <div className="self-end bg-gray-200 h-6 w-1/5 rounded-lg"></div>

                        <div className="self-start bg-gray-300 h-6 w-1/3 rounded-lg ml-36"></div>
                      </div>
                    ))}
                </div>
              ) : (
                chatHistory.map((chat, index) => (
                  <div key={index} className="flex flex-col gap-1 mr-36">
                    <div className="flex flex-col overflow-y-auto max-h-[500px]">
                      <div className="flex justify-end w-full pr-36">
                        {editIndex !== index && (
                          <button
                            onClick={() => {
                              setEditIndex(index);
                              setEditMessage(chat.userMessage);
                            }}
                            className="text-black rounded-md text-sm mr-3"
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        <div
                          className={`relative mt-2 px-3 py-2 rounded-xl max-w-[70%] flex flex-col gap-2 transition-all duration-200 ${
                            editIndex === index
                              ? "bg-gray-500 w-[70%]"
                              : "bg-gray-200"
                          }`}
                        >
                          {editIndex === index ? (
                            <div className="flex flex-col w-full">
                              <input
                                type="text"
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
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
                            <span className="break-words w-full  text-[#3d3d3d]">
                              {chat.userMessage}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

 
      <div className="ml-36 self-start text-left bg-gray-300 text-black px-3 py-2 m-2 rounded-xl max-w-[70%] break-words whitespace-pre-wrap">
        {(
          chat.parsedResponse && chat.parsedResponse.length > 0
            ? chat.parsedResponse
            : [{ type: "text", content: chat.botResponse }]
        ).map((part, i) =>
          part.type === "code" ? (
            <div key={i} className="relative">
              <pre className="bg-gray-900 text-green-300 px-3 py-2 rounded-md overflow-x-auto relative">
                <code>{part.content}</code>
              </pre>
              {/* <button
                onClick={() => handleCopy(part.content, i)}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-1 rounded"
              >
                <Clipboard size={16} />
              </button> */}
              {/* {copiedIndex === i && (
                <span className="absolute top-2 right-10 bg-gray-700 text-white px-2 py-1 text-xs rounded">
                  Copied!
                </span>
              )} */}
            </div>
          ) : (
            <span key={i}>{part.content}</span>
          )
        )}
      </div>
    
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
        <div className="self-start bg-gray-300 text-black px-3 py-2 rounded-xl max-w-[5%] flex items-center gap-2">
          <span className="animate-pulse">...</span>
        </div>
      )
    ) : null}
  </div>
)}

            </div>

            <div className="mb-5 ml-20 w-2/4 p-1 flex bg-gray-100 justify-between items-center fixed bottom-0 left-1/2 transform -translate-x-1/2  rounded-l-full rounded-r-full">
              <input
                type="text"
                value={moreChat}
                onChange={(e) => setMoreChat(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a messe..."
                className="w-3/4 p-1 rounded focus:outline-none text-black bg-gray-100"
              />

              <button
                onClick={handleAddChat}
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

    
    </>
  );
};

export default ChatPage;
