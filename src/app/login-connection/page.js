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
      router.push("/model");
    } else {
      await signIn("google");
    }
    setLoading(false);
  };

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen  mt-12 bg-gray-50 flex flex-col ml-auto w-4/5">
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
              <BackButton />
            </div>

            <div className="rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full flex border items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                      className="ml-1"
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
                      ? "text-red-600 border-red-600 hover:bg-red-50"
                      : "text-gray-700 border-gray-300 hover:bg-gray-50"
                  } bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center ${
                    loading ? "cursor-not-allowed opacity-50" : ""
                  }`}
                  onClick={handleClick}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-red-600 rounded-full"></span>
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
  );
}
