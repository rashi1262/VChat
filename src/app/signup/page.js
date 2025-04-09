"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../../public/assests/logo.jpg";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Asset } from "next/font/google";
import { signInWithGoogle } from "../auth";
import { Spinner } from "@/components/commonFunc";

const Signup = () => {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      try {
        localStorage.setItem("user", JSON.stringify(session.user));
        router.replace("/model");
      } catch (error) {
        toast.error("Error saving user data");
      }
    }
  }, [session, router]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    credits: 20,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();
      router.push("/model");
      toast.success("sign up successful!");
    } catch (error) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = {
      ...formData,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/signup-verification`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.message ||
          (response.status === 409
            ? "Email already exists. Please log in."
            : "Signup failed! Try again.");
        throw new Error(errorMessage);
      }

      if (data.token) {
        localStorage.setItem("userToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      toast.success("Signup successful!");
      router.push("/verify");
      setFormData({ name: "", email: "", password: "" });
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-white">
      <Toaster position="top-center" richColors />
      <div className="w-full max-w-md p-5 bg-white rounded-lg">
        <img
          src="assests/vlogo.avif"
          className="w-16 h-16 rounded-full flex justify-center items-center mx-auto mb-8"
          alt="logo"
        />

        <h1 className="text-center mb-5 text-gray-800 text-xl">
          <b>Create Your Account</b>
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-800" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              className="w-full p-2 text-gray-800 text-base border border-gray-300 rounded mt-1"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-800" htmlFor="email">
              Email address
            </label>
            <input
              type="email"
              className="w-full p-2 text-gray-800 text-base border border-gray-300 rounded mt-1"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-800" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              className="w-full p-2 text-gray-800 text-base border border-gray-300 rounded mt-1"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full p-2 text-base bg-gray-800 text-white border-none  rounded cursor-pointer mt-2 hover:bg-gray-900"
          >
            {isLoading ? <Spinner /> : "Sign up"}
          </button>
        </form>

        <div className="flex flex-col gap-2 mt-5">
          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-500 font-medium">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded bg-white text-gray-600"
          >
            <Image
              src="/assests/download.png"
              width={24}
              height={24}
              alt="Google logo"
            />
            Continue with Google
          </button>

          {/* <button
            onClick={() => "Apple login"}
            className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded bg-white text-gray-600"
          >
            <Image
              src="/assests/Apple-Logo.png"
              width={24}
              height={24}
              alt="Apple logo"
            />
            Continue with Apple
          </button> */}
        </div>

        <p className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link className="text-blue-600 hover:underline" href="/login">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
