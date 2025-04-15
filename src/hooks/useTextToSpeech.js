const useTextToSpeech = () => {
    const speak = (text) => {
      if (!text || window.speechSynthesis.speaking) return; // Prevent overlap
  
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;
  
      window.speechSynthesis.speak(utterance);
    };
  
    return { speak };
  };
  
  export default useTextToSpeech;
  