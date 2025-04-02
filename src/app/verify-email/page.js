"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState("Verifying...");
  const [verify, setVerified] = useState(false);

  useEffect(() => {
  

    if (token) {
      fetch(`https://chatbot-2vqr.onrender.com/verify-link?token=${token}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.text())
        .then((text) => {
        

          if (text.includes("Email verified successfully!")) {
            setMessage("Your email has been successfully verified! You can now login.");
            setVerified(true);
          } else {
            setMessage("Verification failed. Invalid or expired token.");
          }
        })
        .catch(() => {
          setMessage("Something went wrong.");
        });
    }
  }, [token]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="bg-white shadow-lg rounded-2xl p-6 text-center">
        <h2 className="text-xl text-black font-semibold">{message}</h2>
        {verify && (
          <h2 className="text-green-400 font-bold mt-4">
            <Link href="/login" className="hover:underline">
              back to login
            </Link>
          </h2>
        )}
      </div>
    </div>
  );
};

const VerifyEmail = () => {
  return (
    <Suspense fallback={<h2>Loading...</h2>}>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmail;

