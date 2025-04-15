import { useState, useEffect } from "react";

const useTypingEffect = (text, speed = 15) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let index = 0;

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayedText;
};

export default useTypingEffect;
