"use client";

import { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { MONTH, MONTHS, YEARLY } from "@/constants";
import { CheckCircle2, XCircle } from "lucide-react";

const stripePromise = loadStripe("pk_test_51R670dPqjLJEAu5pP6DSMUXUGK535oEdgQ9Xy1Qs0THarwksxbnRyz9OKghZIm34i1CqPYqIPs9R7Ed5lAkGX9DF00lZQhDIVu");

export default function PlansPage() {
  const [selectedButton, setSelectedButton] = useState(MONTH);
  const [price, setPrice] = useState(0.67);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", email: "" });

  useEffect(() => {
    if (selectedButton === MONTH) {
      setPrice(0.67);
    } else if (selectedButton === MONTHS) {
      setPrice(0.44);
    } else {
      setPrice(0.16);
    }
  }, [selectedButton]);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserDetails({
        name: parsedUser.name || "",
        email: parsedUser.email || "",
      });
    }
  }, []);
  
  const handlePayment = async () => {
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      lineItems: [
        {
          price: "price_1R67m5PqjLJEAu5p2MtGBB4U", // Replace with actual price ID
          quantity: 1,
        },
      ],
      mode: "subscription",
      customerEmail: userDetails.email,
      successUrl: "https://vchatai.netlify.app/success",
      cancelUrl: "https://vchatai.netlify.app/plans",
    });
    if (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen mt-12 bg-gray-50 flex flex-col ml-auto w-4/5">
        <div className="flex gap-8 p-10">
          <Sidebar />
          <div className="flex-1 mr-64">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-600">Plans</h1>
                <p className="text-sm text-gray-500">
                  View and manage your subscription plans
                </p>
              </div>
              <Link
                href="/model"
                className="px-4 py-2 text-gray-500 border border-rounded rounded-md"
              >
                Back to Chat
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Free
                </h3>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-gray-600">$0</span>
                  <span className="text-gray-500 text-sm">/ Per Day</span>
                </div>
                <div className="p-3 mb-4 bg-gray-50 rounded-md border text-gray-500 text-center">
                  Current Plan
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-600">
                    Features included in the Free plan:
                  </h4>
                  <div className="space-y-2 text-gray-600">
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
                  <h3 className="text-xl font-semibold text-gray-600 mb-0">
                    Pro
                  </h3>
                  <div className="flex gap-1 bg-gray-50 py-1 px-1 rounded-full">
                    <button
                      className={`px-1 text-sm rounded-full whitespace-nowrap text-gray-500 hover:text-gray-500 ${
                        selectedButton === MONTH
                          ? "bg-white border "
                          : "text-gray-200 "
                      }`}
                      onClick={() => setSelectedButton(MONTH)}
                    >
                      1 Month
                    </button>
                    <button
                      className={`px-1  text-sm font-medium rounded-full whitespace-nowrap text-gray-500 hover:text-gray-500 ${
                        selectedButton === MONTHS
                          ? "bg-white border"
                          : "text-gray-200 "
                      }`}
                      onClick={() => setSelectedButton(MONTHS)}
                    >
                      3 Months
                    </button>
                    <button
                      className={`px-1 text-sm font-medium rounded-full whitespace-nowrap text-gray-500 hover:text-gray-500 ${
                        selectedButton === YEARLY
                          ? "bg-white border"
                          : "text-gray-200 "
                      }`}
                      onClick={() => setSelectedButton(YEARLY)}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
                <p className="text-lg mb-5">
                  <span className="text-2xl font-bold text-gray-700">
                    ${price}
                  </span>
                  <span className="text-gray-500 text-sm">/ Per Day</span>
                </p>
                <button
  className="w-full py-2 mb-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
  onClick={() => setIsModalOpen(true)}
>
  Upgrade
</button>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-600">
                    Features included in the Pro plan:
                  </h4>
                  <div className="space-y-2 text-gray-600">
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

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-semibold text-gray-700">Enter Details</h2>
            <input
  type="text"
  value={userDetails.name}
  className="w-full border p-2 my-2 bg-gray-100 cursor-not-allowed"
  disabled
/>

<input
  type="email"
  value={userDetails.email}
  className="w-full border p-2 my-2 bg-gray-100 cursor-not-allowed"
  disabled
/>

            <p className="text-lg">Amount: ${price * 30}</p>
            <button
              onClick={handlePayment}
              className="w-full bg-[black] text-white p-2 mt-3 rounded-md"
            >
              Pay with Stripe
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-gray-300 p-2 mt-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}