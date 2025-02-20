"use client";
import React, { useState,useEffect } from "react";
import Image from "next/image";
import logo from "../../../public/assests/logo.jpg";
import apple from "../../../public/assests/Apple-Logo.png";
import google from "../../../public/assests/download.png";
import Link from "next/link";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


const Signup = () => {
  const {status} = useSession()
  const { data: session } = useSession();
  const router = useRouter()
  useEffect(() => {
    if (session) {
      router.replace('/profile')
      localStorage.setItem("user", JSON.stringify(session.user));
      console.log(session.user)
    }
  }, [session]);

  const [isLogin, setIsLogin] = useState(true); 

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });



  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    try {
      const response = await fetch("https://chatbot-2vqr.onrender.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Signup failed!");
      }
  
      setSuccess("Signup successful! You can now log in.");
      setFormData({ email: "", password: "" });
  
      // Redirect to the login page after successful signup
      router.push("/model");
    } catch (error) {
      setError(error.message);
    }
  };

  


  
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/auth/google/callback";
  };

  
  const handleAppleLogin = () => {
    console.log("Apple login");
  };

 return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="w-full max-w-md p-5 bg-white rounded-lg">
        <Image
          src={logo}
          className="w-16 h-16 rounded-full flex justify-center items-center mx-auto mb-8"
          alt="logo"
        />

        <h1 className="text-center mb-5 text-gray-800 text-xl">
          <b>Create Your Account</b>
        </h1>

        {error && <p className="text-red-500 text-center mb-3">{error}</p>}
        {success && <p className="text-green-500 text-center mb-3">{success}</p>}

        <form onSubmit={handleSubmit}>
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
            className="w-full p-2 text-base bg-gray-800 text-white border-none rounded cursor-pointer mt-2 hover:bg-gray-900"
          >
            Sign Up
          </button>
        </form>

        <div className="flex flex-col gap-2 mt-5">
          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-500 font-medium">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          {/* <button onClick={} className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded bg-white text-gray-600"/>
            <Image src={google} className="w-6 h-6" alt="logo" /> */}

          <button
            onClick={()=>signIn("google")}
            className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded bg-white text-gray-600"
          >
            <Image src={google} className="w-6 h-6" alt="Google logo" />

            Continue with Google
          </button>

          <button
            onClick={handleAppleLogin}
            className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded bg-white text-gray-600"
          >
            <Image src={apple} className="w-6 h-6" alt="Apple logo" />
            Continue with Apple
          </button>
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
