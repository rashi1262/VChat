"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const page = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token"); // Get auth token from localStorage

      if (!token) {
        router.push("/login"); // Redirect to login if token doesn't exist
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default page;
