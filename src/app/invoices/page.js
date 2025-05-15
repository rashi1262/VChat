"use client";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BackButton } from "../profile/page";
import Sidebar from "../Sidebar";
import { RefreshCw } from "lucide-react";

export default function InvoicePage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCredits = async () => {
    const userDetails = JSON.parse(localStorage.getItem("user"));

    try {
      const response = await fetch(
        `https://chatbot-2vqr.onrender.com/chatbot/get-by-userid/${userDetails.id}`
      );

      const data = await response.json();
      localStorage.setItem("remainingCredits", data.credits);
    } catch (error) {
      console.error("Error fetching credits:", error);
    }
  };

  const fetchPayments = async () => {
    const userDetails = JSON.parse(localStorage.getItem("user"));
    setLoading(true);

    try {
      const response = await fetch(
        "https://chatbot-2vqr.onrender.com/api/stripe/process-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: userDetails.id,
            email: userDetails.email,
          }),
        }
      );

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data && Array.isArray(data.payments)) {
          setPayments(data.payments);
        } else {
          setPayments([]); // fallback if response is json but not array
        }
      } else {
        const text = await response.text();
        console.warn("Non-JSON response:", text);
        setPayments([]); // fallback for plain text like "No payments found"
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    fetchCredits();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchPayments();
    await fetchCredits();
    setLoading(false);
  };

  const generatePDF = (payment) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Invoice", 90, 20);

    doc.setFontSize(12);
    doc.text(`Customer: ${payment.name}`, 20, 40);
    doc.text(`Email: ${payment.customerEmail}`, 20, 50);
    doc.text(
      `Date: ${new Date(payment.createDate).toLocaleDateString()}`,
      20,
      60
    );

    autoTable(doc, {
      startY: 70,
      head: [["Payment ID", "Amount", "Status"]],
      body: [
        [
          payment.paymentId,
          `$${(payment.amount / 100).toFixed(2)}`,
          payment.status,
        ],
      ],
    });

    doc.save(`invoice_${payment.id}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6  flex flex-col sm:py-12">
      <div className="relative py-3 sm:max-w-3xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative bg-white shadow-lg sm:rounded-3xl p-8">
          <div className="lg:flex lg:gap-8">
            <div className="lg:w-1/4 mb-6 lg:mb-0">
              <Sidebar />
            </div>
            <div className="flex-1">
              <div className="mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-xl font-semibold text-gray-700">
                    Invoices
                  </h1>
                  <p className="text-sm text-gray-500">
                    Access your billing history and invoices
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleRefresh}
                    className="bg-black text-white px-3 py-2 rounded flex items-center gap-2 text-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin w-4 h-4" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                      </>
                    )}
                  </button>
                  <BackButton />
                </div>
              </div>

              <div className="rounded-lg p-6 space-y-6">
                {payments.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200 min-w-[600px]">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">Customer</th>
                          <th className="border p-2 text-left">Email</th>
                          <th className="border p-2 text-left">Amount</th>
                          <th className="border p-2 text-left">Status</th>
                          <th className="border p-2 text-left">Date</th>
                          <th className="border p-2 text-left">Invoice</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="text-center">
                            <td className="border p-2 text-left">
                              {payment.name}
                            </td>
                            <td className="border p-2 text-left">
                              {payment.customerEmail}
                            </td>
                            <td className="border p-2 text-left">
                              ${(payment.amount / 100).toFixed(2)}
                            </td>
                            <td className="border p-2 text-left">
                              {payment.status}
                            </td>
                            <td className="border p-2 text-left">
                              {new Date(
                                payment.createDate
                              ).toLocaleDateString()}
                            </td>
                            <td className="border p-2 text-left">
                              <button
                                onClick={() => generatePDF(payment)}
                                className="bg-black text-white px-3 py-1 rounded text-sm"
                              >
                                Download
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : loading ? (
                  <div className="p-8 flex flex-col gap-4 min-h-[400px]">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={index}
                        className="animate-pulse flex items-center justify-between bg-gray-200 p-4 rounded-lg"
                      >
                        <div className="w-1/3 h-5 bg-gray-300 rounded"></div>
                        <div className="w-1/4 h-5 bg-gray-300 rounded"></div>
                        <div className="w-1/5 h-5 bg-gray-300 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No Invoices found.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
