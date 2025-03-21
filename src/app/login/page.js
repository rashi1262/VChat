"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import logo from "../../../public/assests/logo.jpg";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useSession } from "next-auth/react";
import { toast, Toaster } from "sonner";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      try {
        localStorage.setItem("user", JSON.stringify(session.user));
        localStorage.setItem("hasLoggedIn", true);
        router.push("/model");
      } catch (error) {
        toast.error("Error saving user data");
      }
    }
  }, [session, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8080/auth/google/callback";

    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data.status !== 200) {
        if (
          response.status === 401 &&
          data.message.includes("verify your email")
        ) {
          router.push("/verify");
          return;
        } else if (response.status === 401) {
          throw new Error("Invalid email or password.");
        } else if (response.status === 404) {
          throw new Error("User not found.");
        } else if (response.status === 500) {
          throw new Error("Server error. Please try again later.");
        } else {
          throw new Error(data.message || "Login failed.");
        }
      }

      const userData = {
        email: data.email,
        name: data.name || "Guest",
        id: data.id,
        credits:data.credits
      };

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("hasLoggedIn", true);
      toast.success("Login successful!");
      setIsLogin(true);
      router.push("/model");
    } catch (error) {
      toast.error(
        error.message || "Something went wrong. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = () => {
    console.log("Apple login");
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
          <b>Login to Your Account</b>
        </h1>

        <div className="flex flex-col gap-2 mt-5">
          <button
            onClick={() => signIn("google")}
            className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded bg-white text-gray-600"
            disabled={isLoading}
          >
            <Image
              src="/assests/download.png"
              width={24}
              height={24}
              alt="logo"
            />
            Continue with Google
          </button>

          {/* <button
            onClick={handleAppleLogin}
            className="flex items-center justify-center gap-2 p-2 border border-gray-300 rounded bg-white text-gray-600"
            disabled={isLoading}
          >
            <Image
              src="/assests/Apple-Logo.png"
              width={24}
              height={24}
              alt="Apple logo"
            />
            Continue with Apple
          </button> */}

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
              disabled={isLoading}
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
              disabled={isLoading}
              required
            />
          </div>

          
          <button
            type="submit"
            className={`w-full p-2 text-base text-white border-none rounded cursor-pointer mt-2 ${
              isLoading ? "bg-gray-500 cursor-not-allowed" : "bg-gray-800 hover:bg-gray-900"
            }`}
            disabled={isLoading} 
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"
                  viewBox="0 0 24 24"
                ></svg>
               Logging in...
              </div>
            ) : (
              "Log In"
            )}
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
