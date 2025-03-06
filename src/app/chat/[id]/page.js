"use client";
import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import Navbar from "../../navbar";
import { useChat } from "../../chatContext";
import { useRouter } from "next/navigation";
import { Clipboard } from "lucide-react";

const ChatPage = ({ params }) => {
  const { id } = use(params);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const { chatThread, setChatThread } = useChat();
  const router = useRouter()
  const [botResponse, setBotResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [morePrompt, setMorePrompt] = useState("");
  const [moreResponse, setMoreResponse] = useState("");
    const [userId, setUserId] = useState(null);
  
  const [chatHistory, setChatHistory] = useState([]);

  const chatContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (code, index) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };



  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

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
  

  const getChatById = (c) => {
    router.push(`/chat/${c}`);
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, morePrompt]);

  // const fetchBotResponse = async () => {
  //   try {
  //     const searchRes = await fetch(
  //       `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By/${id}`
  //     );

  //     if (!searchRes.ok) {
  //       throw new Error("Error fetching bot response");
  //     }

  //     const data = await searchRes.json();
  //     setChatHistory(data?.userSearch || []);
  //   } catch (error) {
  //     setError(error.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchBotResponse = async () => {
    try {
      const searchRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By/${id}`
      );
  
      if (!searchRes.ok) {
        throw new Error("Error fetching bot response");
      }
  
      const data = await searchRes.json();
      const formattedChats = (data?.userSearch || []).map((chat) => ({
        ...chat,
        parsedResponse: extractCodeBlocks(chat.botResponse),
      }));
  
      setChatHistory(formattedChats);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  // const handleAddChat = async () => {
  //   if (!id || !morePrompt) return;

  //   setLoading(true);

  //   try {
  //     const searchRes = await fetch(
  //       `${
  //         process.env.NEXT_PUBLIC_BASE_URL
  //       }/chatbot/search?message=${encodeURIComponent(morePrompt)}`
  //     );

  //     if (!searchRes.ok) {
  //       throw new Error("Error fetching bot response");
  //     }

  //     const data = await searchRes.text();
  //     const formattedResponse = data
  //       .split(/[*-]\s+/)
  //       .filter((point) => point.trim())
  //       .join(" ");

  //     setMoreResponse(formattedResponse);

  //     const newChat = {
  //       userMessage: morePrompt,
  //       botResponse: formattedResponse,
  //     };

  //     setChatHistory((prevChats) => [...prevChats, newChat]);

  //     await fetch(
  //       `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/update-by/${id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ userSearch: [newChat] }),
  //       }
  //     );

  //     setLoading(false);
  //     setMorePrompt("");
  //     setMoreResponse("");
  //   } catch (error) {
  //     setError(error.message);
  //     setLoading(false);
  //   }
  // };
  const handleAddChat = async () => {
    if (!id || !morePrompt) return;
  
    setLoading(true);
  
    try {
      const searchRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/search?message=${encodeURIComponent(morePrompt)}`
      );
  
      if (!searchRes.ok) {
        throw new Error("Error fetching bot response");
      }
  
      const data = await searchRes.text();
      const formattedResponse = extractCodeBlocks(data);
  
      const newChat = {
        userMessage: morePrompt,
        botResponse: data,
        parsedResponse: formattedResponse, // Ensure code blocks are separated
      };
  
      setChatHistory((prevChats) => [...prevChats, newChat]);
  
      await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/update-by/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userSearch: [newChat] }),
        }
      );
  
      setLoading(false);
      setMorePrompt("");
      setMoreResponse("");
    } catch (error) {
      setError(error.message);
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
  const extractCodeBlocks = (message) => {
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let parts = [];
    let lastIndex = 0;
  
    message.replace(codeBlockRegex, (match, code, index) => {
      if (index > lastIndex) {
        parts.push({ type: "text", content: message.slice(lastIndex, index) });
      }
      parts.push({ type: "code", content: code });
      lastIndex = index + match.length;
    });
  
    if (lastIndex < message.length) {
      parts.push({ type: "text", content: message.slice(lastIndex) });
    }
  
    return parts.length > 0 ? parts : [{ type: "text", content: message }];
  };
  
  return (
    <>
      <div className="flex w-full justify-between bg-gray-50 text-sm overflow-y-scroll">
      <Navbar/>
   
        <div className="min-h-screen relative bg-gray-50 flex flex-col items-center justify-center  w-4/5">
          <div className="max-w absolute top-4  overflow-y-scroll w-full rounded-md h-[75%] p-4 text-center  mt-20  ">
          <div
      ref={chatContainerRef}
      className="flex flex-col sticky  h-full w-full "
    >
     
      {chatHistory.map((chat, index) => (
  <div key={index} className="flex flex-col gap-1 mr-36">
    {/* User Message */}
    <div className="mr-36 mt-2 self-end bg-blue-500 text-white px-3 py-2 rounded-xl max-w-[70%]">
      {chat.userMessage}
    </div>

    {/* Bot Response */}
    <div className="ml-36 self-start text-left bg-gray-300 text-black px-3 py-2 m-2 rounded-xl max-w-[70%] break-words whitespace-pre-wrap">
      {chat.parsedResponse.map((part, i) =>
        part.type === "code" ? (
          <div key={i} className="relative">
            <pre className="bg-gray-900 text-green-300 px-3 py-2 rounded-md overflow-x-auto relative">
              <code>{part.content}</code>
            </pre>
            <button
              onClick={() => handleCopy(part.content, i)}
              className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white p-1 rounded"
            >
              <Clipboard size={16} />
            </button>
            {copiedIndex === i && (
              <span className="absolute top-2 right-10 bg-gray-700 text-white px-2 py-1 text-xs rounded">
                Copied!
              </span>
            )}
          </div>
        ) : (
          <span key={i}>{part.content}</span>
        )
      )}
    </div>
  </div>
))}


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
                value={morePrompt}
                onChange={(e) => setMorePrompt(e.target.value)}
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

      <div className="fixed top-3 right-5 flex items-center ">
        {/* <button className="flex items-center text-black border rounded-l-full rounded-r-full p-1 bg-yellow-200">
          <div className="w-5 h-5 m1-2 mr-2">
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
                strokeWidth="1.552"
                d="M1.628 6.906h14.744M7.448 2.25 5.896 6.906 9 15.83l3.104-8.924-1.552-4.656M9.477 15.646l6.952-8.343c.118-.14.177-.212.2-.29a.4.4 0 0 0 0-.213c-.023-.08-.082-.15-.2-.291l-3.363-4.036c-.068-.082-.102-.123-.144-.152a.4.4 0 0 0-.123-.058c-.05-.013-.103-.013-.21-.013H5.411c-.107 0-.16 0-.21.013a.4.4 0 0 0-.122.058c-.042.03-.077.07-.145.152L1.571 6.51c-.118.141-.176.212-.199.29a.4.4 0 0 0 0 .213c.023.08.081.15.2.291l6.951 8.343c.164.196.246.295.344.33.086.032.18.032.266 0 .098-.035.18-.134.344-.33"
              ></path>
            </svg>
          </div>
          Go Pro
        </button> */}
      <button className="flex items-center">
                <Link
                  href="/model"
                  className="flex items-center hover:bg-gray-200 rounded text-black p-2"
                >
                  <div className="w-7 h-6 p-1 ">
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
                  OpenAI GPT-4o mini
                </Link>
              </button>
      </div>
    </>
  );
};

export default ChatPage;
