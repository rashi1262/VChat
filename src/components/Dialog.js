"use client";

import { useState, useEffect } from "react";
import Sidebar from "../../src/app/Sidebar";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { MONTH, MONTHS, YEARLY, MONTHFORPLUS, MONTHSFORPLUS, YEARLYFORPLUS } from "@/constants";
import { CheckCircle2, XCircle } from "lucide-react";
import { BackButton } from "../../src/app/profile/page";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
const stripePromise = loadStripe(
  "pk_test_51R670dPqjLJEAu5pP6DSMUXUGK535oEdgQ9Xy1Qs0THarwksxbnRyz9OKghZIm34i1CqPYqIPs9R7Ed5lAkGX9DF00lZQhDIVu"
);

export default function PlansPage() {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedButton, setSelectedButton] = useState(MONTH);
  const [price, setPrice] = useState(0.67);
  const [plusprice, setPriceForPlus] = useState(0.67);
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
    if (selectedButton === MONTHFORPLUS) {
      setPriceForPlus(1.2);
    } else if (selectedButton === MONTHSFORPLUS) {
      setPriceForPlus(0.9);
    } else {
      setPriceForPlus(0.5);
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
    if (!stripe || !elements) {
      console.error("Stripe or Elements not loaded.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      console.error("CardElement not found.");
      return;
    }

    try {
      const response = await fetch("https://chatbot-2vqr.onrender.com/api/stripe/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: price * 30 * 100, // Convert to cents
          email: userDetails.email,
          name: userDetails.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment intent creation failed");
      }

      const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (paymentMethodError) {
        console.error("Payment Method Error:", paymentMethodError.message);
        return;
      }

      const { paymentIntent, error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: paymentMethod.id,
      });

      if (error) {
        console.error("Payment failed:", error.message);
      } else {
        console.log("Payment successful!");

        // ✅ Save Payment ID in localStorage
        localStorage.setItem("paymentId", paymentIntent?.id || paymentMethod.id);

        window.location.href = "https://vchatai.netlify.app/success";
      }
    } catch (error) {
      console.error("Error processing payment:", error.message);
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
              <BackButton />
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
                  {featureDetails.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {detail.icon}
                      <span className="text-gray-600">{detail.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-600 mb-0">
                    Plus
                  </h3>
                  <div className="flex gap-1 bg-gray-50 py-1 px-1 rounded-full">
                    <button
                      className={`px-1 text-sm rounded-full whitespace-nowrap text-gray-500 hover:text-gray-500 ${selectedButton === MONTH
                          ? "bg-white border "
                          : "text-gray-200 "
                        }`}
                      onClick={() => setSelectedButton(MONTHFORPLUS)}
                    >
                      1 Month
                    </button>
                    <button
                      className={`px-1  text-sm font-medium rounded-full whitespace-nowrap text-gray-500 hover:text-gray-500 ${selectedButton === MONTHS
                          ? "bg-white border"
                          : "text-gray-200 "
                        }`}
                      onClick={() => setSelectedButton(MONTHSFORPLUS)}
                    >
                      3 Months
                    </button>
                    <button
                      className={`px-1 text-sm font-medium rounded-full whitespace-nowrap text-gray-500 hover:text-gray-500 ${selectedButton === YEARLY
                          ? "bg-white border"
                          : "text-gray-200 "
                        }`}
                      onClick={() => setSelectedButton(YEARLYFORPLUS)}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
                <p className="text-lg mb-5">
                  <span className="text-2xl font-bold text-gray-700">
                    ${plusprice}
                  </span>
                  <span className="text-gray-500 text-sm">/ Per Day</span>
                </p>
                <button
                  className="w-full py-2 mb-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
                  onClick={() => {
                    const selectedPlanPrice =
                      selectedButton === MONTHFORPLUS || selectedButton === MONTHSFORPLUS || selectedButton === YEARLYFORPLUS
                        ? plusprice
                        : price;
                    setPrice(selectedPlanPrice); // Update the price state
                    setIsModalOpen(true);
                  }}
                >
                  Upgrade
                </button>


                <div className="space-y-3">
                  <h4 className="font-medium text-gray-600">
                    Features included in the Pro plan:
                  </h4>
                  {featureDetailsPlus.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {detail.icon}
                      <span className="text-gray-600">{detail.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-600 mb-0">
                    Pro
                  </h3>
                  <div className="flex gap-1 bg-gray-50 py-1 px-1 rounded-full">
                    <button
                      className={`px-1 text-sm rounded-full whitespace-nowrap text-gray-500 hover:text-gray-500 ${selectedButton === MONTH
                          ? "bg-white border "
                          : "text-gray-200 "
                        }`}
                      onClick={() => setSelectedButton(MONTH)}
                    >
                      1 Month
                    </button>
                    <button
                      className={`px-1  text-sm font-medium rounded-full whitespace-nowrap text-gray-500 hover:text-gray-500 ${selectedButton === MONTHS
                          ? "bg-white border"
                          : "text-gray-200 "
                        }`}
                      onClick={() => setSelectedButton(MONTHS)}
                    >
                      3 Months
                    </button>
                    <button
                      className={`px-1 text-sm font-medium rounded-full whitespace-nowrap text-gray-500 hover:text-gray-500 ${selectedButton === YEARLY
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
                  {featureDetails1.map((detail, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {detail.icon}
                      <span className="text-gray-600">{detail.text}</span>
                    </div>
                  ))}
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
              className="w-full border p-2 my-2 text-black bg-gray-100 cursor-not-allowed"
              disabled
            />

            <input
              type="email"
              value={userDetails.email}
              className="w-full border p-2 my-2 text-black bg-gray-100 cursor-not-allowed"
              disabled
            />

            {/* Stripe Card Element */}
            <div className="border p-2 my-2">
              <CardElement />
            </div>

            <p className="text-lg text-black">Amount: ${price * 30}</p>

            <button
              onClick={handlePayment}
              className="w-full bg-black text-white p-2 mt-3 rounded-md"
            >
              Pay with Stripe
            </button>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full bg-gray-300 text-black p-2 mt-2 rounded-md"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>

  );
}
const featureDetails = [
  {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    text: "Access to OpenAI GPT-4o",
  },
  {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    text: "Advanced Features",
  },
  {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    text: "Access to Google Gemini",
  },
  {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    text: "Advanced Tools",
  },
  { icon: <XCircle className="w-5 h-5 text-red-500" />, text: "No Limits" },
];
const featureDetails1 = [
  {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    text: "Access to OpenAI GPT-4o",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    text: "Advanced Features",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    text: "Access to Google Gemini",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    text: "Advanced Tools",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    text: "No Limits",
  },
];
const featureDetailsPlus = [
  {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    text: "Access to OpenAI GPT-4o (Limited)",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    text: "Basic Advanced Features",
  },
  {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    text: "No Access to Google Gemini",
  },
  {
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    text: "Limited Advanced Tools",
  },
  {
    icon: <XCircle className="w-5 h-5 text-red-500" />,
    text: "Usage Limits Apply",
  },
];
