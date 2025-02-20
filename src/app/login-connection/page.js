"use client";

import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Link from "next/link";

export default function LoginConnectionPage() {
  const [user, setUser] = useState(null);
  const [isGmailUser, setIsGmailUser] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUser(storedUser);
      if (storedUser && storedUser.email && storedUser.email.endsWith("@gmail.com")) {
        setIsGmailUser(true);
      }
    }
  }, []);

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen bg-gray-50 flex flex-col ml-auto w-4/5">
        <div className="flex gap-7 p-6">
          <Sidebar />

          <div className="flex-1 mr-64">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-700">Login Connection</h1>
                <p className="text-sm text-gray-500">
                  Manage your login connections and authentication methods
                </p>
              </div>
              <Link href="/model" className="px-4 py-2 text-sm border rounded-md text-gray-500">
                Back to Chat
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                    <div className="w-5 h-5 bg-white"></div> {/* Placeholder for Apple icon */}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Apple</h3>
                    <p className="text-sm text-gray-500">Connect with Apple</p>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Connect
                </button>
              </div>

              {/* Google Connection */}
              <div
                className={`flex items-center justify-between p-4 border rounded-lg "border-gray-300" ${
                  isGmailUser  
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500"></div> {/* Placeholder for Google icon */}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Google</h3>
                    <p className="text-sm text-gray-500">{isGmailUser && user ? user.email : ""}</p>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    isGmailUser
                      ? "border text-red-600 border-red-600"
                      : "text-gray-700 border-gray-300"
                  } bg-white rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 `}
                >
                  {isGmailUser ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
