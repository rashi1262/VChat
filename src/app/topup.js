"use client"; // Use this in Next.js App Router for client components

import { useState, useEffect } from "react";

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 10000); // 10 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl">Welcome to My Next.js App</h1>

      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">Welcome Back</h2>
            <p className="mt-2">Log in or sign up to get smarter responses, upload files, and more.</p>
            <div className="mt-4 flex space-x-2">
              <button className="px-4 py-2 bg-blue-600 rounded-md">Log in</button>
              <button className="px-4 py-2 bg-gray-600 rounded-md">Sign up</button>
            </div>
            <button className="mt-4 text-gray-400" onClick={() => setShowPopup(false)}>
              Stay logged out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
