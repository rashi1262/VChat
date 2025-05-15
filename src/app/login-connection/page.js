"use client";

import { useEffect, useState } from "react";
import Sidebar from "../Sidebar";
import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BackButton } from "../profile/page";
import { CONNECT, DISCONNECT } from "@/constants";

export default function LoginConnectionPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState(null);
  const [isGmailUser, setIsGmailUser] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (session) {
      setUser(session.user);
      setIsGmailUser(session.user.email);
      localStorage.setItem("user", JSON.stringify(session.user));
    } else {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsGmailUser(parsedUser.email);
      } else {
        router.push("/model");
        localStorage.setItem("hasLoggedIn", false);
      }
    }
  }, [session, router]);

  const handleClick = async () => {
    setLoading(true);
    if (isGmailUser) {
      await signOut({ redirect: false });
      localStorage.removeItem("user");
      localStorage.setItem("hasLoggedIn", false);
      router.push("/model");
    } else {
      await signIn("google");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 flex flex-col sm:py-12">
      <div className="relative py-3 sm:max-w-3xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative bg-white shadow-lg sm:rounded-3xl p-8">
          <div className="lg:flex lg:gap-10">
            {" "}
            {/* Increased gap to lg:gap-10 */}
            <div className="lg:w-1/4 mb-8 lg:mb-0">
              {" "}
              {/* Added mb-8 for mobile spacing */}
              <Sidebar />
            </div>
            <div className="flex-1">
              <div className="mb-8 flex justify-between items-center">
                {" "}
                {/* Added mb-8 for spacing */}
                <div>
                  <h1 className="text-xl font-semibold text-gray-700">
                    Login Connection
                  </h1>
                  <p className="text-sm text-gray-500">
                    Manage your login connections and authentication methods
                  </p>
                </div>
                <BackButton />
              </div>

              <div className="rounded-lg p-6 space-y-8">
                {" "}
                {/* Increased space-y-6 to space-y-8 */}
                <div className="flex flex-col md:flex-row items-center justify-between p-6 border rounded-lg">
                  {" "}
                  {/* Increased padding to p-6 */}
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    {" "}
                    {/* Increased gap and margin for mobile */}
                    <div className="w-8 h-8 rounded-full flex border items-center justify-center">
                      {" "}
                      {/* Increased icon size */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                        className="ml-1 w-5 h-4" // Adjusted svg size
                      >
                        <g clipPath="url(#google_svg__a)">
                          <path
                            fill="#4285F4"
                            d="M15.844 8.184c0-.544-.044-1.09-.138-1.625H8.16v3.08h4.321a3.7 3.7 0 0 1-1.599 2.431v2h2.578c1.514-1.394 2.384-3.452 2.384-5.886"
                          ></path>
                          <path
                            fill="#34A853"
                            d="M8.16 16c2.158 0 3.978-.708 5.304-1.93l-2.578-2c-.718.488-1.644.765-2.722.765-2.087 0-3.857-1.408-4.492-3.301h-2.66v2.06a8 8 0 0 0 7.149 4.407"
                          ></path>
                          <path
                            fill="#FBBC04"
                            d="M3.669 9.533a4.8 4.8 0 0 1 0-3.063V4.41H1.01a8 8 0 0 0 0 7.184z"
                          ></path>
                          <path
                            fill="#EA4335"
                            d="M8.16 3.166a4.35 4.35 0 0 1 3.07 1.2l2.284-2.284A7.7 7.7 0 0 0 8.16 0 8 8 0 0 0 1.01 4.41L3.67 6.47c.632-1.896 2.405-3.304 4.492-3.304"
                          ></path>
                        </g>
                        <defs>
                          <clipPath id="google_svg__a">
                            <path fill="#fff" d="M0 0h16v16H0z"></path>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-gray-900">
                        {" "}
                        {/* Increased font size */}
                        Google
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isGmailUser && user ? user.email : ""}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`px-6 py-3 border text-sm font-medium ${
                      // Increased padding
                      isGmailUser
                        ? "text-red-600 border-red-600 hover:bg-red-50"
                        : "text-gray-700 border-gray-300 hover:bg-gray-50"
                    } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center ${
                      loading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                    onClick={handleClick}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="animate-spin h-5 w-5 border-2 border-t-transparent border-red-600 rounded-full"></span> // Increased spinner size
                    ) : isGmailUser ? (
                      DISCONNECT
                    ) : (
                      CONNECT
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
