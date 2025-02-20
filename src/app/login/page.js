"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../../public/assests/logo.jpg";
import apple from "../../../public/assests/Apple-Logo.png";
import google from "../../../public/assests/download.png";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const[isLogin,setIsLogin]= useState(false)

  const { data: session, status } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/model");
      localStorage.setItem("user", JSON.stringify(session.user));
      console.log(session.user);
    }
  }, [session]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (isLogin) {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("No user found. Please sign up first.");
        return;
      }

      const user = JSON.parse(storedUser);
      if (
        user.email === formData.email &&
        user.password === formData.password
      ) {
        alert("Login successful!");
      } else {
        alert("Invalid email or password.");
      }
    } else {
  
        const newUser = {
          email: formData.email,
          password: formData.password,
        };

        const response = await fetch(" https://chatbot-2vqr.onrender.com/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
    
        const data = await response.json();
    

        localStorage.setItem("user", JSON.stringify(newUser));
        alert(" Successfully logged  in.");
        setIsLogin(true);
        router.push("/model");
   
    }
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
          <b>Login to Your Account</b>
        </h1>

        <div className="flex flex-col gap-2 mt-5">
          <button
            onClick={() => signIn("google")}
            className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded bg-white text-gray-600"
          >
            <Image src={google} className="w-6 h-6" alt="logo" />
            Continue with Google
          </button>

          <button
            onClick={handleAppleLogin}
            className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded bg-white text-gray-600"
          >
            <Image src={apple} className="w-6 h-6" alt="Apple logo" />
            Continue with Apple
          </button>

          <div className="flex items-center my-4">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-2 text-gray-500 font-medium">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
        </div>

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
            Log In
          </button>
        </form>

        <p className="text-center mt-4 text-sm text-gray-600">
          Don't have an account?{" "}
          <Link className="text-blue-600 hover:underline" href="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
