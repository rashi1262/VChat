"use client";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { BackButton } from "../profile/page";
import Sidebar from "../Sidebar";

export default function InvoicePage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    const userDetails = JSON.parse(localStorage.getItem("user"));

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

      const data = await response.json();
      setPayments(data.payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const generatePDF = (payment) => {
    const doc = new jsPDF();

    // Invoice Header
    doc.setFontSize(18);
    doc.text("Invoice", 90, 20);

    // Customer Details
    doc.setFontSize(12);
    doc.text(`Customer: ${payment.name}`, 20, 40);
    doc.text(`Email: ${payment.customerEmail}`, 20, 50);
    doc.text(`Date: ${new Date(payment.createDate).toLocaleDateString()}`, 20, 60);

    // Payment Details
    autoTable(doc, {
      startY: 70,
      head: [["Payment ID", "Amount", "Status"]],
      body: [[payment.paymentId, `$${(payment.amount / 100).toFixed(2)}`, payment.status]],
    });

    // Save PDF
    doc.save(`invoice_${payment.id}.pdf`);
  };

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen mt-12 bg-gray-50 flex flex-col ml-auto w-4/5">
        <div className="flex gap-7 p-6">
          <Sidebar />

          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-600">Invoices</h1>
                <p className="text-sm text-gray-500">Access your billing history and invoices</p>
              </div>
              <BackButton />
            </div>

            <div className="rounded-lg p-6 space-y-6">
              {payments.length > 0 ? (
                <table className="w-full border-collapse border border-gray-200">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2">Customer</th>
                      <th className="border p-2">Email</th>
                      <th className="border p-2">Amount</th>
                      <th className="border p-2">Status</th>
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id} className="text-center">
                        <td className="border p-2">{payment.name}</td>
                        <td className="border p-2">{payment.customerEmail}</td>
                        <td className="border p-2">${(payment.amount / 100).toFixed(2)}</td>
                        <td className="border p-2">{payment.status}</td>
                        <td className="border p-2">{new Date(payment.createDate).toLocaleDateString()}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => generatePDF(payment)}
                            className="bg-[black] text-white px-3 py-1 rounded"
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 flex flex-col gap-4 min-h-[400px]">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="animate-pulse flex items-center justify-between bg-gray-200 p-4 rounded-lg">
                    <div className="w-1/3 h-5 bg-gray-300 rounded"></div>
                    <div className="w-1/4 h-5 bg-gray-300 rounded"></div>
                    <div className="w-1/5 h-5 bg-gray-300 rounded"></div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
