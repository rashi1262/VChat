"use client";
import { useState, useEffect } from "react";

export default function ChatInputBox() {
  const [query, setQuery] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("User query:", query);
      setQuery("");
    }
  };

  const handleRedirect = (path) => {
    setShowPopup(false);
    window.location.href = path;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white relative">
      <div className="absolute top-4 right-6 flex space-x-4">
        <button
          onClick={() => handleRedirect("/login")}
          className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100"
        >
          Log in
        </button>
        <button
          onClick={() => handleRedirect("/signup")}
          className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-600"
        >
          Sign up
        </button>
      </div>
      <h1 className="text-3xl font-semibold mb-6">What can I help with?</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-4 rounded-lg shadow-md w-96 flex items-center"
      >
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Ask anything"
          className="w-full p-2 bg-gray-700 text-white rounded-lg focus:outline-none"
        />
      </form>
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-semibold mb-4">Welcome back</h2>
            <p className="mb-4">
            Log in or sign up to unlock smarter responses, upload files, and make the most of VChat—your AI assistant.
            </p>
            <button
              onClick={() => handleRedirect("/login")}
              className="w-full text-black px-4 border  py-2 mb-2 bg-white rounded-full hover:bg-white"
            >
              Log in
            </button>
            <button
              onClick={() => handleRedirect("/signup")}
              className="w-full px-4 py-2 border  bg-gray-700 rounded-full "
            >
              Sign up
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
