import { AnimatePresence, motion } from "framer-motion";
import { Mic, X } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";

const SpeechToSpeech = ({ setIsOpen, userId, id }) => {
  const [transcript, setTranscript] = useState("Listening...");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef(null);
  const voiceRef = useRef(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const setPreferredVoice = () => {
      const voices = speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes("Google US English") || // Chrome
          v.name.includes("Google UK English Female") || // Chrome alt
          v.name.includes("Samantha") // Safari/macOS
      );
      if (preferred) {
        voiceRef.current = preferred;
      }
    };
  
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = setPreferredVoice;
    }
  
    setPreferredVoice();
  }, []);
  

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      setTranscript("Speech recognition not supported in this browser.");
      setIsMicOn(false);
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

      try {
        // Step 1: Get bot response
        const searchRes = await fetch(
          'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=AIzaSyAgrOTx5__YJrVFPRWRui9iEzxtfxYysa4',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: message, // user input
                    },
                  ],
                },
              ],
            }),
          }
        );
        
   
        
        if (!searchRes.ok) throw new Error("Error fetching bot response");
        const data = await searchRes.json();
        const botResponse =   data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response found';

        // Step 2: Add user + bot response to chat history
        const newChat = {
          userMessage: message,
          botResponse,
          parsedResponse: null,
        };
        const utterance = new SpeechSynthesisUtterance(botResponse);
        
        utterance.voice = voiceRef.current || null;

        utterance.onend = () => {
            setIsSpeaking(false);
            setIsLoading(false);
            if (isMicOn) {
              try {
                recognition.stop(); // just in case it's still running
                recognition.start(); // 🔁 Start listening again!
              } catch (err) {
              }
            }
          };
        speechSynthesis.speak(utterance);
        setTranscript(`Bot: ${botResponse}`);

        const updateRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/update-by/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id,
              userSearch: [newChat],
            }),
          }
        );        

        const updateResponseText = await updateRes.text();
        if (!updateRes.ok) {
          throw new Error(`Error updating chat data: ${updateResponseText}`);
        }

        // Step 3: Fetch the updated chat history

        // Step 4: Speak out and show response
     
      } catch (err) {
        setTranscript("Error getting bot response.");
      } finally {
        setIsLoading(false);
      }
    };

    recognition.onerror = (event) => {
      setTranscript("Error with speech recognition.");
    };

    recognitionRef.current = recognition;

    if (isMicOn && !speechSynthesis.speaking) {
        try {
          recognition.start();
        } catch (err) {
        }
      }
      

    return () => recognition.stop();
  }, [isMicOn]);

  const handleToggleMic = () => {
    setIsMicOn((prev) => !prev);
    if (!isMicOn) {
      setTranscript("Listening...");
    }
  };

  const handleClose = () => {
    recognitionRef.current?.stop();
    setTranscript("Listening stopped.");
    setTimeout(() => setIsOpen(false), 1000);
  };

  const handleStopSpeech = () => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setTranscript("Speech stopped.");
    }
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

          <motion.div
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
          </motion.div>

          <p className="text-xl text-gray-800 mt-6 text-center w-full h-24 overflow-y-auto">
            {isLoading ? "Loading response..." : transcript}
          </p>

          <div className="flex justify-center gap-4 fixed bottom-6 w-full">
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
          </div>
       
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SpeechToSpeech;
