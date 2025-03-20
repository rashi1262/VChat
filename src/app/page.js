"use client"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import Model from "./model/page";
export default function Home() {
  const[creditPopup,setShowCreditPopup] = useState(false)
 
useEffect(() => {
   const hasCredits = localStorage.getItem("credits")
   if (hasCredits == '0') {
     setShowCreditPopup(true); 
   } else {
     setShowCreditPopup(false);
     
   }
 }, []);
  return (
   <div>
     {creditPopup ? 
      (
          <>
           <Model/>
          </>
        ): (
          <div className="z-50 fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
          <div className="bg-neutral-800 p-12  w-96 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl  font-bold">Insufficient Credit</h2>
            <p className=" p-2  text-lg ">
              You hit your free credit limit .Please Consider buying our plans for uninterrupted services
            </p>
            <div className=" p-2 mt-4">
              <button
                onClick={() => router.push("/plans")}
                className="w-full px-4 py-2 mb-2 bg-white text-gray-800 border border-white rounded-full hover:bg-gray-100"
              >
                Show Plans
              </button>
              
            </div>
           
          </div>
        </div>
        )}
   </div>
  );
}
