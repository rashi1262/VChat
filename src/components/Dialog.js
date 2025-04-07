"use client";
import { useState, useEffect } from "react";
import Sidebar from "../../src/app/Sidebar";
import { CheckCircle2, XCircle } from "lucide-react";
import { BackButton } from "../../src/app/profile/page";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { toast } from "sonner";
import { Spinner } from "./commonFunc";

export default function PlansPage() {
  const stripe = useStripe();
  const elements = useElements();
  const [plans, setPlans] = useState([]);
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", email: "" });
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserDetails({ name: parsedUser.name || "", email: parsedUser.email || "" });
    }
  }, []);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch("https://chatbot-2vqr.onrender.com/plans/getall");
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    }
    fetchPlans();
  }, []);

  const handlePayment = async () => {
    setIsPaymentLoading(true);
    if (!stripe || !elements || !selectedPlan) {
      console.error("Stripe, Elements, or Plan not selected.");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selectedPlan.pricePerDay * 30 * 100, // Convert to cents
          email: userDetails.email,
          name: userDetails.name,
          planId:selectedPlan.id
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Payment intent creation failed");

      const { paymentMethod, error: paymentMethodError } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });
      if (paymentMethodError) throw new Error(paymentMethodError.message);

      const { paymentIntent, error } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: paymentMethod.id,
      });
      if (error) throw new Error("Payment failed");

      setIsPaymentLoading(false);
      localStorage.setItem("paymentId", paymentIntent?.id || paymentMethod.id);
      window.location.href = "https://vchatai.netlify.app/success";
    } catch (error) {
      setIsPaymentLoading(false);
      toast.error(error.message || "Payment failed");
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
                <p className="text-sm text-gray-500">View and manage your subscription plans</p>
              </div>
              <BackButton />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">{plan.name}</h3>
                  <p className="text-lg mb-5">
                    <span className="text-2xl font-bold text-gray-700">${plan.pricePerDay}</span>
                    <span className="text-gray-500 text-sm">/ Per Day</span>
                  </p>
                  <button
                    className="w-full py-2 mb-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsModalOpen(true);
                    }}
                  >
                    {plan.pricePerDay === 0 ? "Current Plan" : "Upgrade"}
                  </button>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-600">Features:</h4>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h2 className="text-lg font-semibold text-gray-700">Enter Details</h2>
            <input type="text" value={userDetails.name} className="w-full border p-2 my-2 text-black bg-gray-100" disabled />
            <input type="email" value={userDetails.email} className="w-full border p-2 my-2 text-black bg-gray-100" disabled />
            <div className="border p-2 my-2"><CardElement /></div>
            <p className="text-lg text-black">Amount: ${selectedPlan.pricePerDay * 30}</p>
            <button onClick={handlePayment} className="w-full bg-black text-white p-2 mt-3 rounded-md" disabled={isPaymentLoading}>
              {isPaymentLoading ? <Spinner /> : "Pay with Stripe"}
            </button>
            <button onClick={() => setIsModalOpen(false)} className="w-full bg-gray-300 text-black p-2 mt-2 rounded-md">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
