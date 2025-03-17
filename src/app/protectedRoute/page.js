"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const page = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/model");
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default page;
