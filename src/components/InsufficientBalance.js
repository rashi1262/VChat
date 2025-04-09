import Link from "next/link";
import React from "react";

const InsufficientBalance = () => {
  return (
    <div className="z-50 fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="bg-neutral-800 p-12  w-96 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl  font-bold">Insufficient Credit</h2>
        <p className=" p-2  text-lg ">
          You hit your free credit limit. Please consider buying our plans for
          uninterrupted services.
        </p>
        <div className="border border-gray-300 p-2 mt-4">
          <Link href="/plans">Show Plans</Link>
        </div>
      </div>
    </div>
  );
};

export default InsufficientBalance;
