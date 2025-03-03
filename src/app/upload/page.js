"use client";
import { useState, useEffect } from "react";
import React from "react";
import Link from "next/link";
import Navbar from "../navbar";

const page = () => {
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setEmail(user?.email || "No Email");
          setName(user?.name || "No Name");
        }
      } catch (error) {}
    }
  }, []);
  return (
    <>
      <div className="flex w-full justify-between bg-gray-50">
        <Navbar/>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center ml-auto w-4/5">
          <div className="max-w-3xl    rounded-md  text-center ">
            <div className="w-16 h-16 rounded-full ml-72 mb-10 ">
              <svg
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 42 42"
                className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--large___HBGvG"
              >
                <path
                  d="M.5 21C.5 9.678 9.678.5 21 .5S41.5 9.678 41.5 21 32.322 41.5 21 41.5.5 32.322.5 21Z"
                  fill="#fff"
                ></path>
                <rect
                  x="0.656"
                  y="0.656"
                  width="40.688"
                  height="40.688"
                  rx="20.344"
                  stroke="#EEE"
                  strokeWidth="1.313"
                ></rect>
                <path
                  d="M27.918 17.253 22.7 12.036v5.217h5.217Z"
                  fill="#D47070"
                ></path>
                <path
                  d="M22.7 18.744c-.822 0-1.49-.669-1.49-1.491v-5.217h-5.217a1.49 1.49 0 0 0-1.491 1.49v14.907a1.49 1.49 0 0 0 1.49 1.49l10.435.002c.823 0 1.491-.668 1.491-1.49v-9.691h-5.217Z"
                  fill="#D47070"
                ></path>
              </svg>
            </div>
            <h1 className="text-3xl  text-gray-900">Upload & Ask PDF</h1>
            <h1 className="text-xl mt-5 text-gray-400">
              Get instant answers and insights from your documents—just upload
              and ask!
            </h1>
          </div>
        </div>
        <div className="mb-5 ml-20 w-2/5 p-1 flex bg-gray-100 justify-between items-center fixed bottom-0 left-1/2 transform -translate-x-1/2  rounded-l-full rounded-r-full">
          <button className="ml-2 p-2 rounded-full bg-gray-200">
            <div className="w-7 h-6 p-1 ">
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
                  d="M9 3.75v10.5M3.75 9h10.5"
                ></path>
              </svg>
            </div>
          </button>
          <input
            type="text"
            placeholder="Send a message..."
            className="w-3/4 p-1 rounded focus:outline-none text-black bg-gray-100"
          />
          <button className="p-1 rounded-full bg-gray-200">
            <div className="w-7 h-6 p-1 ">
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
                  d="M2.25 7.5v3m3.375-6v9M9 2.25v13.5M12.375 4.5v9m3.375-6v3"
                ></path>
              </svg>
            </div>
          </button>
          <button className="p-1 mr-2 rounded-full bg-gray-200">
            <div className="w-7 h-6 p-1 ">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 18 18"
                className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M2.017 2.25c-.053.135.02.355.166.795l1.713 5.162A1 1 0 0 1 4 8.2h5.5a.8.8 0 1 1 0 1.6H4a1 1 0 0 1-.151-.014l-1.66 4.96c-.148.44-.222.66-.169.796a.4.4 0 0 0 .267.242c.14.039.352-.056.776-.247l13.45-6.053c.415-.186.622-.28.686-.409a.4.4 0 0 0 0-.356c-.064-.13-.271-.223-.685-.41L3.059 2.256c-.423-.19-.635-.285-.775-.246a.4.4 0 0 0-.267.24"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
          </button>
        </div>
      </div>
      <div className="fixed top-3 right-5 flex items-center ">
        <button className="flex items-center">
          <Link
            href="/upload"
            className="flex items-center hover:bg-gray-200 rounded text-black p-2"
          >
            <div className="w-8 h-7 pl-1 pr-1  ">
              <svg
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 42 42"
                className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--large___HBGvG"
              >
                <path
                  d="M.5 21C.5 9.678 9.678.5 21 .5S41.5 9.678 41.5 21 32.322 41.5 21 41.5.5 32.322.5 21Z"
                  fill="#fff"
                ></path>
                <rect
                  x="0.656"
                  y="0.656"
                  width="40.688"
                  height="40.688"
                  rx="20.344"
                  stroke="#EEE"
                  strokeWidth="1.313"
                ></rect>
                <path
                  d="M27.918 17.253 22.7 12.036v5.217h5.217Z"
                  fill="#D47070"
                ></path>
                <path
                  d="M22.7 18.744c-.822 0-1.49-.669-1.49-1.491v-5.217h-5.217a1.49 1.49 0 0 0-1.491 1.49v14.907a1.49 1.49 0 0 0 1.49 1.49l10.435.002c.823 0 1.491-.668 1.491-1.49v-9.691h-5.217Z"
                  fill="#D47070"
                ></path>
              </svg>
            </div>
            Upload & Ask PDF
          </Link>
        </button>
      </div>
    </>
  );
};

export default page;
