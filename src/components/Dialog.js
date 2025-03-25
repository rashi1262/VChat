"use client";

import { useState } from "react";
import Sidebar from "../Sidebar";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { MONTH, MONTHS, YEARLY } from "@/constants";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("your-stripe-public-key");

export default function PlansPage() {
  const [selectedButton, setSelectedButton] = useState(MONTH);
  const [price, setPrice] = useState(0.67);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const handlePlanClick = (planPrice) => {
    setPrice(planPrice);
    setShowPopup(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      lineItems: [{ price: "your-stripe-price-id", quantity: 1 }],
      mode: "subscription",
      successUrl: "https://your-site.com/success",
      cancelUrl: "https://your-site.com/cancel",
      customerEmail: formData.email,
    });

    if (error) {
   
    }
  };

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen mt-12 bg-gray-50 flex flex-col ml-auto w-4/5">
        <div className="flex gap-8 p-10">
          <Sidebar />

          <div className="flex-1 mr-64">
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-lg font-semibold text-gray-600">Plans</h1>
              <Link
                href="/model"
                className="px-4 py-2 text-gray-500 border rounded-md"
              >
                Back to Chat
              </Link>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Free
                </h3>
                <p className="text-2xl font-bold text-gray-600">$0 / Per Day</p>
                <button className="w-full py-2 mt-4 bg-gray-400 text-white rounded-md cursor-not-allowed">
                  Current Plan
                </button>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-600 mb-4">
                  Pro
                </h3>
                <p className="text-2xl font-bold text-gray-700">
                  ${price} / Per Day
                </p>
                <button
                  className="w-full py-2 mt-4 bg-gray-900 text-white rounded-md hover:bg-gray-800"
                  onClick={() => handlePlanClick(price)}
                >
                  Upgrade
                </button>
              </div>
            </div>

            {showPopup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                  <h2 className="text-lg font-semibold mb-4">
                    Confirm Payment
                  </h2>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Name"
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email"
                    className="w-full p-2 border rounded mb-4"
                  />
                  <p className="mb-4 text-lg font-bold">Amount: ${price}</p>
                  <button
                    className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    onClick={handlePayment}
                  >
                    Pay with Stripe
                  </button>
                  <button
                    className="w-full py-2 mt-2 bg-gray-400 text-white rounded-md"
                    onClick={() => setShowPopup(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
