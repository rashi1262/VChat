"use client";
import Link from "next/link";

const Verify = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Verify Your Email
        </h2>
        <p className="text-gray-600 mb-4">
          We've sent a verification link to your email. Please check your inbox
          (and spam folder) and follow the link to activate your account.
        </p>
        <p className="text-gray-500 text-sm mb-4">
          Didn't receive the email? Try logging in again or check your email
          address.
        </p>
        <Link href="/login">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Back to Login
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Verify;
