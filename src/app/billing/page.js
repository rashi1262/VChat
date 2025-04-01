"use client";
import { useEffect, useState } from "react";
import { BackButton } from "../profile/page";
import Sidebar from "../Sidebar";

export default function BillingPage() {
  const [billingDetails, setBillingDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBillingDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const userDetails = JSON.parse(localStorage.getItem("user"));

        if (!userDetails?.id || !userDetails?.email) {
          setError("User details not found.");
          setLoading(false);
          return;
        }

        // Call process-payment API
        const response = await fetch("https://chatbot-2vqr.onrender.com/api/stripe/process-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userDetails.id,
            email: userDetails.email,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Failed to process payment");

        setBillingDetails(data.payments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingDetails();
  }, []);

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen mt-12 bg-gray-50 flex flex-col ml-auto w-4/5">
        <div className="flex gap-7 p-6">
          <Sidebar />
          <div className="flex-1 mr-64">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-600">Billing Details</h1>
                <p className="text-sm text-gray-500">Update your billing information and payment methods</p>
              </div>
              <BackButton />
            </div>

            <div className="rounded-lg p-6 space-y-6">
              {loading ? (
                <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4 animate-pulse">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="border-b py-2 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <p className="text-red-500 text-sm">{error}</p>
              ) : billingDetails.length > 0 ? (
                <div className="p-4 border rounded-lg bg-white shadow-sm">
                  <h2 className="text-md font-semibold text-gray-700 mb-2">Payment Details</h2>
                  {billingDetails.map((detail, index) => (
                    <div key={detail.id || index} className="border-b py-2">
                      <p><strong>Payment ID:</strong> {detail.paymentId}</p>
                      <p><strong>Name:</strong> {detail.name}</p>
                      <p><strong>Email:</strong> {detail.customerEmail.replace("mailto:", "")}</p>
                      <p><strong>Amount:</strong> ${(detail.amount / 100).toFixed(2)}</p>
                      <p><strong>Status:</strong> 
                        <span className={`text-${detail.status === "succeeded" ? "green" : "red"}-500`}>
                          {detail.status}
                        </span>
                      </p>
                      <p><strong>Date:</strong> {new Date(detail.createDate).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center">No billing details available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}