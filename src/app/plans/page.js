"use client";

import { useState,useEffect } from "react";
import Sidebar from '../Sidebar';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function PlansPage() {
  const [selectedButton, setSelectedButton] = useState("1 Month");
   const[price,setPrice] = useState(0.67)

  useEffect(()=>{
    if(selectedButton === '1 Month'){
        setPrice(0.67)
    }
    else if(selectedButton === '3 Months'){
        setPrice(0.44)
    }
    else{
        setPrice(0.16)
    }
  },[selectedButton])

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
    
    <div className="min-h-screen bg-gray-50 flex flex-col   ml-auto w-4/5">
    {/* <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-10"> */}
        <div className="flex gap-8 p-10">
          <Sidebar />

          <div className="flex-1 mr-64">
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-gray-900">Plans</h1>
              <p className="text-sm text-gray-500">
                View and manage your subscription plans
              </p>
            </div>

           
            <div className="mb-3">
              
              <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-sm font-medium text-gray-600 mb-2">Your Plan</h2>
                <div className="flex justify-between items-center">
                  
                  <div className="flex">
                    <h3 className="text-xl mr-5 font-semibold text-gray-900">Free</h3>
                    <span className=" px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full">
                      Limited Used
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">$0</span>
                    <span className="text-gray-500 text-sm">/ Per Day</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mb-3">
              <div className="inline-block px-4 py-1 text-gray-400">
                other plan
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Free</h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-500 text-sm">/ Per Day</span>
                </div>
                <div className="p-3 mb-4 bg-gray-50 rounded-md text-center">
                  Current Plan
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Features included in the Free plan:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Access to OpenAI GPT-4o</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span>Advanced Features</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span>Access to Google Gemini</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span>Advanced Tools</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-red-500" />
                      <span>No Limits</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
  <div className="flex justify-between items-center mb-4">
    <h3 className="text-xl font-semibold text-gray-900 mb-0">Pro</h3>
    <div className="flex gap-1 bg-gray-100 py-1 px-1 rounded-full">
      <button
        className={`px-1 text-sm  rounded-full whitespace-nowrap hover:text-black ${selectedButton === "1 Month" ? "bg-white border-gray-300" : "text-gray-500 "}`}
        onClick={() => setSelectedButton("1 Month")}
      >
        1 Month
      </button>
      <button
        className={`px-1  text-sm font-medium rounded-full whitespace-nowrap hover:text-black ${selectedButton === "3 Months" ? "bg-white border-gray-300" : "text-gray-500 "}`}
        onClick={() => setSelectedButton("3 Months")}
      >
        3 Months
      </button>
      <button
        className={`px-1 text-sm font-medium rounded-full whitespace-nowrap hover:text-black ${selectedButton === "Yearly" ? "bg-white border-gray-300" : "text-gray-500 "}`}
        onClick={() => setSelectedButton("Yearly")}
      >
        Yearly
      </button>
    </div>
  </div>
  <p className="text-lg mb-5">
  
                  <span className="text-2xl font-bold text-gray-700">${price}</span>
                  <span className="text-gray-500 text-sm">/ Per Day</span>
               </p>
  <button className="w-full py-2 mb-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800">
    Upgrade
  </button>
  <div className="space-y-3">
    <h4 className="font-medium text-gray-900">Features included in the Pro plan:</h4>
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <span>Access to OpenAI GPT-4o</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <span>Advanced Features</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <span>Access to Google Gemini</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <span>Advanced Tools</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-green-500" />
        <span>No Limits</span>
      </div>
    </div>
  </div>
</div>

            </div>
          </div>
        </div>
      </div>
    </div>
  
  );
}
