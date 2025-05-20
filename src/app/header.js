"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNav } from "./NavProvider";
const Header = () => {
  const pathname = usePathname();
  const [credits, setCredits] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setloading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  // const { isNavVisible, setIsNavVisible}=useNav()

  const router = useRouter();
  const profilesSection = [
    "/login-connection",
    "/danger-zone",
    "/invoices",
    "/billing",
    "/plans",
    "/profile",
  ];
  //  const [isNavVisible, setIsNavVisible] = useState(false);
  const { isNavVisible, setIsNavVisible } = useNav();
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          return;
        } else {
          const user = JSON.parse(storedUser);
          setUserId(user?.id);
          setCredits(user?.credits);
          setloading(false);
        }
      } catch (error) {
      } finally {
        setloading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchCredits = async () => {
      try {
        setloading(true);
        const response = await fetch(
          `https://chatbot-2vqr.onrender.com/chatbot/get-by-userid/${userId}`
        );
        if (!response.ok) throw new Error("Failed to fetch credits");

        const data = await response.json();
        setCredits(data?.credits || 0);
        localStorage.setItem("remainingCredits", JSON.stringify(data.credits));
      } catch (error) {
      } finally {
        setloading(false);
      }
    };

    fetchCredits();
  }, [userId]);

  useEffect(() => {
    const checkLocalStorage = () => {
      const storedCredits = localStorage.getItem("remainingCredits");
      if (storedCredits) {
        const parsedCredits = JSON.parse(storedCredits);
        if (parsedCredits !== credits) {
          setCredits(parsedCredits);
        }
      }
    };

    checkLocalStorage();
    const interval = setInterval(checkLocalStorage, 1000);
    return () => clearInterval(interval);
  }, [credits]);

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/verify-email" ||
    pathname === "/verify"
  )
    return null;

  return (
    <header className="z-10  fixed top-0 w-full bg-white shadow-sm h-16">
      <div className="container mx-auto flex items-center justify-between px-5 h-full">
        {/* Left: Toggle button */}
        <div className="flex items-center h-full">
          {!profilesSection.includes(pathname) && (
            <button
              className="flex items-center justify-center h-10 w-10 border text-black hover:bg-gray-100 rounded"
              onClick={() => setIsNavVisible(!isNavVisible)}
            >
              {/* Menu Icon */}
              <div className="w-6 h-6 p-1 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 18 18"
                  className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9 9h6.75M9 2.25v13.5M5.85 2.25h6.3c1.26 0 1.89 0 2.371.245.424.216.768.56.984.984.245.48.245 1.11.245 2.371v6.3c0 1.26 0 1.89-.245 2.371a2.25 2.25 0 0 1-.984.984c-.48.245-1.11.245-2.371.245h-6.3c-1.26 0-1.89 0-2.371-.245a2.25 2.25 0 0 1-.984-.984c-.245-.48-.245-1.11-.245-2.371v-6.3c0-1.26 0-1.89.245-2.371a2.25 2.25 0 0 1 .984-.984c.48-.245 1.11-.245 2.371-.245"
                  ></path>
                </svg>
              </div>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-4 h-full">
          {pathname === "/vChat" && (
            <Link
              href="/vChat"
              className="flex items-center hover:bg-gray-100 text-gray-600  text-sm font-normal"
            >
              <Image
                src="/assests/vlogo.avif"
                width={20}
                height={20}
                alt="logo"
              />
              <span className="ml-2">VChat</span>
            </Link>
          )}
          {pathname === "/model" && (
            <Link
              href="/model"
              className="flex items-center hover:bg-gray-100 text-gray-600  text-sm font-normal"
            >
              <Image
                src="/assests/gemini.png"
                width={30}
                height={30}
                alt="logo"
              />
              <span className="ml-2">Gemini</span>
            </Link>
          )}

          {pathname === "/image" && (
            <Link
              href="/image"
              className="flex items-center hover:bg-gray-100 text-gray-600  text-sm font-normal"
            >
              <Image
                src="/assests/svgviewer-output (2).svg"
                width={30}
                height={30}
                alt="logo"
              />
              <span className="ml-2">Image Generation</span>
            </Link>
          )}

          {pathname === "/openAI" && (
            <Link
              href="/openAI"
              className="flex items-center hover:bg-gray-100 text-gray-600  text-sm font-normal"
            >
              <Image
                src="/assests/svgviewer-output.svg"
                width={20}
                height={20}
                alt="logo"
              />
              <span className="ml-2">OpenAI</span>
            </Link>
          )}

          {pathname === "/upload" && (
            <Link
              href="/upload"
              className="flex items-center hover:bg-gray-100 text-gray-600  text-sm font-normal"
            >
              <Image
                src="/assests/svgviewer-output (3).svg"
                width={30}
                height={30}
                alt="logo"
              />
              <span className="ml-2">Upload & Ask PDF</span>
            </Link>
          )}

          <div className="text-gray-600 text-sm font-medium">
            {credits !== null ? (
              <p>Free Points: {credits}</p>
            ) : (
              <div className="w-20 h-4 bg-gray-300 animate-pulse rounded"></div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
