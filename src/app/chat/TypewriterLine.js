import { useEffect, useState } from 'react';

const TypewriterLine = ({ text, delay = 0 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
        if (index >= text.length) clearInterval(interval);
      }, 20); // speed of typing per character
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return <div className="text-green-300">{displayedText}</div>;
};

export default TypewriterLine;
