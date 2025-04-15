import { AnimatePresence, motion } from "framer-motion";
import { Mic, MicOff, StopCircle, X } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import GradientCircleCanvas from "./GradientCircleCanvas";

const SpeechToSpeech = ({ setIsOpen, userId, id: initialId }) => {
  const [transcript, setTranscript] = useState("Listening...");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState(initialId || null);
  const [chatHistory, setChatHistory] = useState([]);
  const recognitionRef = useRef(null);
  const voiceRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Setup voice
  useEffect(() => {
    const setPreferredVoice = () => {
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes("Samantha")
      );
      if (preferred) voiceRef.current = preferred;
      console.log("Voice set to:", voiceRef.current ? voiceRef.current.name : "Samantha");
    };

    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = setPreferredVoice;
    }

    setPreferredVoice();
  }, []);

  // Speech recognition effect
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      setTranscript("Speech recognition not supported in this browser.");
      setIsMicOn(false);
      console.log("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = async (event) => {

      const message = event.results[0][0].transcript;
      setTranscript(`You said: "${message}"`);
      setIsSpeaking(true);
      console.log("Speech recognized:", message);

      try {
        const searchRes = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyAgrOTx5__YJrVFPRWRui9iEzxtfxYysa4`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: message }] }],
            }),
          }
        );

        if (!searchRes.ok) throw new Error("Error fetching bot response");

        const data = await searchRes.json();
        const botResponse =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "No response found";

        const utterance = new SpeechSynthesisUtterance(botResponse);
        utterance.voice = voiceRef.current || null;

        const newChat = {
          userMessage: message,
          botResponse,
          parsedResponse: null,
        };

        // Speak response
        utterance.onend = () => {
          console.log("Speech synthesis finished.");
          setIsSpeaking(false);
          setIsLoading(false);
          if (isMicOn) {
            try {
              recognition.stop();
              recognition.start();
            } catch (err) {
              console.error("Error restarting recognition:", err);
            }
          }
        };

        speechSynthesis.speak(utterance);
        console.log("Speaking bot response:", botResponse);
        setTranscript(`Bot: ${botResponse}`);

        // Save chat entry to history
        const updatedHistory = [...chatHistory, newChat];
        setChatHistory(updatedHistory);

        // If no chatId yet → create one
        if (!chatId) {
          const createChatRes = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/create`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userSearch: [newChat],
                userId,
                type: "Gemini",
              }),
            }
          );

          const createdData = await createChatRes.json();
          if (!createdData.id) {
            throw new Error("Failed to create new chat.");
          }

          setChatId(createdData.id);
        } else {
          // Chat exists, update it
          await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/update-by/${chatId}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: chatId,
                userSearch: updatedHistory,
              }),
            }
          );
        }
      } catch (err) {
        console.error(err);
        setTranscript("Error getting bot response.");
      } finally {
        setIsLoading(false);
      }
    };

    recognition.onerror = () => {
      setTranscript("Error with speech recognition.");
      console.error("Speech recognition error.");
    };

    recognitionRef.current = recognition;

    if (isMicOn && !speechSynthesis.speaking) {
      try {
        recognition.start();
        console.log("Started speech recognition.");
      } catch (err) {
        console.error("Error starting speech recognition:", err);
      }
    }

    return () => recognition.stop();
  }, [isMicOn, chatId, chatHistory]);

  // Toggle mic
  const handleToggleMic = () => {
    setIsMicOn((prev) => !prev);
    if (!isMicOn) {
      setTranscript("Listening...");
      console.log("Mic turned on.");
    } else {
      console.log("Mic turned off.");
    }
  };

  // Stop speaking
  const handleStopSpeech = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setTranscript("Speech stopped.");
      console.log("Speech stopped.");
    }

    // Stop speech recognition if it's currently running
    if (recognitionRef.current && recognitionRef.current.stop) {
      try {
        recognitionRef.current.stop();
        console.log("Speech recognition stopped.");
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
      }
    }

    // Reset recognition after stopping and start listening again
    setTimeout(() => {
      if (isMicOn && !speechSynthesis.speaking) {
        try {
          // Check if recognition is in a state where it can start
          if (recognitionRef.current && recognitionRef.current.start) {
            recognitionRef.current.start();
            console.log("Speech recognition restarted and ready to listen.");
          }
        } catch (err) {
          console.error("Error restarting speech recognition:", err);
        }
      }
    }, 500); // Delay before restarting speech recognition
  };



  // Close modal: save and clean up
  const handleClose = async () => {
    recognitionRef.current?.stop();
    console.log("Recognition stopped on close.");

    if (chatId && chatHistory.length > 0) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/update-by/${chatId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: chatId,
              userSearch: chatHistory,
            }),
          }
        );
        console.log("Chat history updated before closing.");
      } catch (err) {
        console.error("Failed to update chat before closing:", err);
      }
    }

    setTranscript("Listening stopped.");
    setTimeout(() => {
      setChatId(null); // reset for new session
      setChatHistory([]);
      setIsOpen(false);
      console.log("Session closed, state reset.");
    }, 1000);
  };

  return (
    <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white w-full h-full p-6 relative flex flex-col items-center justify-center"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        exit={{ y: 100 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        <button
          className="absolute top-4 right-4 text-black"
          onClick={handleClose}
        >
          <X size={30} />
        </button>

        {/* <motion.div
          className="p-8 rounded-full bg-blue-100"
          animate={
            isMicOn
              ? {
                  scale: [1, 1.1, 1],
                  boxShadow: [
                    "0 0 0 0px #3b82f6",
                    "0 0 0 20px rgba(59,130,246,0)",
                    "0 0 0 0px #3b82f6",
                  ],
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 1.8 }}
        >
          <Mic
            size={64}
            className={`text-blue-500 ${isMicOn ? "" : "opacity-30"}`}
          />
        </motion.div> */}

        <div className="relative w-64 h-64 flex items-center justify-center">
            <div className="absolute inset-0 z-0 rounded-full overflow-hidden">
              <GradientCircleCanvas />
            </div>

            {/* <motion.div
              className="z-10"
              animate={
                isMicOn
                  ? {
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 0 0px #3b82f6",
                        "0 0 0 20px rgba(59,130,246,0)",
                        "0 0 0 0px #3b82f6",
                      ],
                    }
                  : {}
              }
              transition={{ repeat: Infinity, duration: 1.8 }}
            >
              <Mic
                size={64}
                className={`text-blue-500 ${isMicOn ? "" : "opacity-30"}`}
              />
            </motion.div> */}
          </div>

        <p className="text-xl text-gray-800 mt-6 text-center w-full h-24 overflow-y-auto">
          {isLoading ? "Loading response..." : transcript}
        </p>

        {/* <div className="flex justify-center gap-4 fixed bottom-6 w-full">
        <button
          onClick={handleToggleMic}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition-all"
        >
          {isMicOn ? "Turn Mic Off" : "Turn Mic On"}
        </button>
        <button
          onClick={handleStopSpeech}
          disabled={!isSpeaking}
          className={`mt-4 px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-all ${
            !isSpeaking ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSpeaking ? "Stop Speech" : "No Speech to Stop"}
        </button>
        </div> */}


<div className="flex justify-center gap-4 fixed bottom-6 w-full">
            <button
              onClick={handleToggleMic}
              className="mt-4 p-4 bg-blue-500 text-white rounded-full shadow hover:bg-blue-600 transition-all"
              aria-label={isMicOn ? "Turn Mic Off" : "Turn Mic On"}
            >
              {isMicOn ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button
              onClick={handleStopSpeech}
              disabled={!isSpeaking}
              className={`mt-4 p-4 bg-red-500 text-white rounded-full shadow hover:bg-red-600 transition-all ${
                !isSpeaking ? "opacity-50 cursor-not-allowed" : ""
              }`}
              aria-label="Stop Speech"
            >
              <StopCircle size={24} />
            </button>
          </div>
     
      </motion.div>
    </motion.div>
  </AnimatePresence>
  );
};

export default SpeechToSpeech;
