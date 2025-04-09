"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    
    localStorage.removeItem("checkout-session");
   

  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 text-gray-700">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-semibold text-green-600">Payment Successful 🎉</h1>
        <p className="mt-3 text-gray-600">
          Thank you for your purchase! Your subscription is now active.
          Check you payment Details In Billing Section
        </p>
        <button
          className="mt-5 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          onClick={() => router.push("/invoices")}
        >
          Go to Download Invoice
        </button>
      </div>
    </div>
  );
}
