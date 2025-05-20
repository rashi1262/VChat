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
  const [activePlanId, setActivePlanId] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({ name: "", email: "" });
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showPlanAlert, setShowPlanAlert] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const storedPlanId = localStorage.getItem("planId");
    if (storedPlanId) {
      setActivePlanId(storedPlanId);
    }
  }, []);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch(
          "https://chatbot-2vqr.onrender.com/plans/getall"
        );
        const data = await response.json();
        setPlans(data);
      } catch (error) {
        console.error("Error fetching plans:", error);
      } finally {
        setLoading(false);
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
      const response = await fetch(
        "https://chatbot-2vqr.onrender.com/api/stripe/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: selectedPlan.pricePerDay * 30 * 100,
            email: userDetails.email,
            name: userDetails.name,
            planId: selectedPlan.id,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Payment intent creation failed");

      const { paymentMethod, error: paymentMethodError } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });
      if (paymentMethodError) throw new Error(paymentMethodError.message);

      const { paymentIntent, error } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: paymentMethod.id,
        }
      );
      if (error) throw new Error("Payment failed");

      setIsPaymentLoading(false);
      localStorage.setItem("paymentId", paymentIntent?.id || paymentMethod.id);
      localStorage.setItem("planId", selectedPlan.id);
      window.location.href = "https://vchatai.netlify.app/success";
    } catch (error) {
      setIsPaymentLoading(false);
      toast.error(error.message || "Payment failed");
    }
  };

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen mt-12 bg-gray-50 flex flex-col ml-auto w-[90%]">
        <div className="flex gap-5 p-10">
          <Sidebar />
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-600">Plans</h1>
                <p className="text-sm text-gray-500">
                  View and manage your subscription plans
                </p>
              </div>
              <BackButton />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {loading
                ? Array(3)
                    .fill(null)
                    .map((_, index) => (
                      <div
                        key={index}
                        className="bg-gray-100 animate-pulse rounded-xl shadow-md p-6 w-[280px] h-[370px] flex flex-col justify-between"
                      >
                        <div className="h-8 bg-gray-300 rounded-md w-2/3 mb-3"></div>
                        <div className="h-6 bg-gray-300 rounded-md w-1/2 mb-5"></div>
                        <div className="h-12 bg-gray-300 rounded-md w-full mb-6"></div>
                        <div className="space-y-3">
                          <div className="h-5 bg-gray-300 rounded-md w-5/6"></div>
                          <div className="h-5 bg-gray-300 rounded-md w-3/4"></div>
                          <div className="h-5 bg-gray-300 rounded-md w-4/6"></div>
                        </div>
                      </div>
                    ))
                : plans.map((plan) => (
                    <div
                      key={plan.id}
                      className="bg-white rounded-xl shadow-md p-6 w-[280px] h-[370px] flex flex-col justify-between border border-gray-100"
                    >
                      <div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                          {plan.name} ({plan.duration})
                        </h3>
                        <p className="text-lg mb-4">
                          <span className="text-2xl font-bold text-gray-800">
                            ${plan.pricePerDay}
                          </span>
                          <span className="text-gray-500 text-sm">
                            / Per Day
                          </span>
                        </p>
                      </div>
                      <button
                        className={`w-full py-2.5 mt-auto text-sm font-medium text-white rounded-lg
              ${
                plan.id === activePlanId
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-600 hover:bg-gray-700"
              }`}
                        onClick={() => {
                          if (plan.pricePerDay > 0) {
                            if (plan.id === activePlanId) return;

                            if (activePlanId && plan.id !== activePlanId) {
                              setShowPlanAlert(true);
                              return;
                            }

                            setSelectedPlan(plan);
                            setIsModalOpen(true);
                          }
                        }}
                        disabled={plan.id === activePlanId}
                      >
                        {plan.id === activePlanId
                          ? "Current Plan"
                          : "Select Plan"}
                      </button>

                      <div className="mt-4 space-y-2">
                        <h4 className="font-medium text-gray-600">Features:</h4>
                        {plan.features.map((feature, index) => {
                          const isNegative =
                            /(no|not)/i.test(feature) &&
                            !/no limits/i.test(feature);
                          return (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-gray-600 text-sm"
                            >
                              {isNegative ? (
                                <XCircle className="w-4 h-4 text-red-500" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              )}
                              <span>{feature}</span>
                            </div>
                          );
                        })}
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
            <h2 className="text-lg font-semibold text-gray-700">
              Enter Details
            </h2>
            <input
              type="text"
              value={userDetails.name}
              className="w-full border p-2 my-2 text-black bg-gray-100"
              disabled
            />
            <input
              type="email"
              value={userDetails.email}
              className="w-full border p-2 my-2 text-black bg-gray-100"
              disabled
            />
            <div className="border p-2 my-2">
              <CardElement />
            </div>
            <p className="text-lg text-black">
              Amount: ${selectedPlan.pricePerDay * 30}
            </p>
            <button
              onClick={handlePayment}
              className="w-full bg-black text-white p-2 mt-3 rounded-md"
              disabled={isPaymentLoading}
            >
              {isPaymentLoading ? <Spinner /> : "Pay with Stripe"}
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

      {showPlanAlert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] text-center">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Plan Already Active
            </h2>
            <p className="text-gray-600 mb-6">
              You already have a plan. You can't purchase a new one until it
              ends.
            </p>
            <button
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-red-800"
              onClick={() => setShowPlanAlert(false)}
            >
              close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
