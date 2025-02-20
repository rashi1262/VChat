"use client";
import { useState } from "react";
import Image from "next/image";
import home from "../../../public/assests/house-icon.png";
import upload from "../../../public/assests/10809404.png";
import society from "../../../public/assests/society.png";

const DesignSystem = () => {
  const [selectedTab, setSelectedTab] = useState("Residential");

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const tabData = [
    { name: "Residential", image: home },
    { name: "Commercial", image: upload },
    { name: "Society", image: society },
  ];

  return (
    <div className="min-h-screen bg-gray-500 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full bg-gray-50 rounded-md p-6 text-center">
        <h1 className="text-gray-400 font-bold mb-4 text-xl">DESIGN YOUR SYSTEM</h1>
        <div className="flex mb-6 text-black">
          {tabData.map((tab) => (
            <button
              key={tab.name}
              onClick={() => handleTabClick(tab.name)}
              className={`flex-1 py-2 px-4 font-semibold text-orange-500 flex items-center justify-center gap-2 ${
                selectedTab === tab.name
                  ? "border border-yellow-500"
                  : "bg-white"
              } rounded-md `}
            >
              <Image src={tab.image} alt={tab.name} width={20} height={20} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
        <div
          className={`p-6 rounded-md shadow-sm border-4 ${
            selectedTab === "Residential" || selectedTab === "Commercial" || selectedTab === "Society"
              ? "border-yellow-500"
              : ""
          }`}
        >
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="relative bg-gray-100 rounded-md p-4 shadow-sm">
                <p className="text-gray-500 font-semibold">What's your Pincode?</p>
                <p className="text-gray-700 text-lg">400086</p>
              </div>
              <div className="relative bg-gray-100 rounded-md p-4 shadow-sm">
                <p className="text-gray-500 font-semibold">Average Monthly Bill (₹)</p>
                <p className="text-gray-700 text-lg">2040</p>
              </div>
              <div className="relative bg-gray-100 rounded-md p-4 shadow-sm">
                <p className="text-gray-500 font-semibold">Roof Area (sqft)</p>
                <p className="text-gray-700 text-lg">320</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button className="py-2 px-6 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition">
            DESIGN
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignSystem;
