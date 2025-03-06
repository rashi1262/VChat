"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState ,use } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from '../../../navbar'
const SharedChatPage = ({ params }) => {
  const router = useRouter();
  const { chatId } = use(params);
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    if (!chatId) return;

    const fetchBotResponse = async () => {
        try {
          const searchRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/get-By/${chatId}`
          );
    
          if (!searchRes.ok) {
            throw new Error("Error fetching bot response");
          }
    
          const data = await searchRes.json();
          setChatHistory(data?.userSearch || []);
        } catch (error) {
        //   setError(error.message);
        } }
        fetchBotResponse()
  }, [chatId]);

  if (!chatHistory) return <p className="text-red-400 ">Loading chat...</p>;

  return (
   <div className="p-6 bg-gray-50 ">
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <Navbar/>
        <div className="min-h-screen relative bg-gray-50 flex flex-col items-center justify-center ml-auto w-4/5">
          <div className="max-w-4xl  absolute top-4  w-full rounded-md h-[700px] p-4 text-center ">
            <div className="flex flex-col gap-2 sticky overflow-y-scroll h-full w-full  ">
              {chatHistory.map((chat, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <div className="self-end bg-blue-500 text-white px-3 py-2 rounded-xl max-w-[70%]">
                    {chat.userMessage}
                  </div>

                  <div className="self-start bg-gray-300 text-black px-3 py-2 m-2 rounded-xl max-w-[70%]">
                    {chat.botResponse}
                  </div>
                </div>
              ))}
{/* 
              {morePrompt !== "" && (
                <div className="flex flex-col gap-1">
       {loading && (
                    <div className="self-start bg-gray-300 text-black px-3 py-2 rounded-xl max-w-[70%] flex items-center gap-2">
                      <span className="animate-pulse">...</span>
                    </div>
                  )}
                </div>
              )} */}
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

              {/* <input
                type="text"
                // value={morePrompt}
                // onChange={(e) => setMorePrompt(e.target.value)}
                // onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                className="w-3/4 p-1 rounded focus:outline-none text-black bg-gray-100"
              /> */}
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
                // onClick={handleAddChat}
                className=" p-1 mr-2 rounded-full bg-white flex items-center justify-center"
              >
                {/* {loading ? (
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
                )} */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedChatPage;
