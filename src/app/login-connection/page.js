"use client";

import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Link from "next/link";
import { signIn, signOut } from "next-auth/react";

export default function LoginConnectionPage() {
  const [user, setUser] = useState(null);
  const [isGmailUser, setIsGmailUser] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (
        storedUser &&
        storedUser.email &&
        storedUser.email.endsWith("@gmail.com")
      ) {
        setUser(storedUser);
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
                <h1 className="text-lg font-semibold text-gray-700">
                  Login Connection
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your login connections and authentication methods
                </p>
              </div>
              <Link
                href="/model"
                className="px-4 py-2 text-sm border rounded-md text-gray-500"
              >
                Back to Chat
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16" class="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"><path fill="currentColor" d="M13.896 11.43a8 8 0 0 1-.789 1.418q-.622.886-1.015 1.227-.608.559-1.306.575-.502 0-1.206-.288-.705-.288-1.298-.287-.623 0-1.335.287-.713.29-1.154.304-.668.028-1.335-.59-.425-.371-1.062-1.272a8.8 8.8 0 0 1-1.123-2.231Q1.8 9.2 1.8 7.913q0-1.474.638-2.541.501-.855 1.335-1.351a3.6 3.6 0 0 1 1.806-.51q.532.001 1.397.325.864.325 1.108.326.183 0 1.229-.384.987-.355 1.67-.296 1.85.149 2.777 1.462-1.656 1.004-1.639 2.807.016 1.404 1.017 2.333.453.43 1.016.666-.123.354-.26.68M11.066.294q0 1.1-.802 2.052c-.645.754-1.425 1.189-2.27 1.12a2 2 0 0 1-.017-.278c0-.704.307-1.457.85-2.074A3.3 3.3 0 0 1 9.865.336Q10.492.03 11.05 0q.016.147.016.294"></path></svg>
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
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500"></div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      Google
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isGmailUser && user ? user.email : ""}
                    </p>
                  </div>
                </div>
                <button
                  className={`px-4 py-2 border text-sm font-medium ${
                    isGmailUser
                      ? "border text-red-600 border-red-600"
                      : "text-gray-700 border-gray-300"
                  } bg-white rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                  onClick={() => {
                    if (isGmailUser) {
                      localStorage.removeItem("user"); // Clear user data
                      signOut(); // Logout the user
                    } else {
                      signIn("google"); // Trigger Google login
                    }
                  }}
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
