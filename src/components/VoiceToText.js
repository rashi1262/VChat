import React, { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Mic, MicOff } from "lucide-react";

const VoiceToText = ({ onResult }) => {
  const [isListening, setIsListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const { transcript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    if (transcript && transcript !== lastTranscript) {
      const newText = transcript.replace(lastTranscript, "").trim();
      if (newText) {
        onResult(newText); // Send only the new part
      }
      setLastTranscript(transcript); // Update last seen transcript
    }
  }, [transcript, lastTranscript, onResult]);

  const toggleListening = () => {
    if (isListening) {
      SpeechRecognition.stopListening();
      setIsListening(false);
    } else {
      resetTranscript();
      setLastTranscript(""); // Reset tracking
      SpeechRecognition.startListening({ continuous: true });
      setIsListening(true);
    }
  };

  return (
    <button
      onClick={toggleListening}
      type="button"
      className={`w-10 h-10 p-1 rounded-full flex items-center justify-center shadow-md ${
        isListening ? "bg-red-500" : "bg-white"
      }`}
    >
      {isListening ? (
        <Mic className="text-white" size={18} />
      ) : (
        <Mic className="text-gray-400" size={18} />
      )}
    </button>
  );
};

export default VoiceToText;
