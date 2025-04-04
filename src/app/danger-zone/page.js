"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Sidebar from "../Sidebar";
import { toast, Toaster } from "sonner";
import Link from "next/link";
import { useChat } from "../chatContext";
import { useRouter } from "next/navigation";
import { BackButton } from "../profile/page";

export default function DangerZonePage() {
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [id, setId] = useState(null);
  const { chatThread, setChatThread } = useChat();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          router.push("/login");
          return;
        } else {
          const u = JSON.parse(storedUser);
          setUser(u);
          const id = u.id;
          setId(id);
        }
        if (!user) {
          const u = JSON.parse(storedUser);
          setUser(u);
          setId(u.id);
        }
      } catch (error) {}
    }
  }, []);

  const handleDeleteChats = async () => {
    toast(
      () => (
        <div>
          <p className="text-gray-900 font-medium">
            Are you sure you want to delete all chats?
          </p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => {
                toast.dismiss();
              }}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              onClick={() => {
                toast.dismiss();
                confirmDeleteChats();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const confirmDeleteChats = async () => {
    setLoadingChats(true);
    try {
    

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/chatbot/delete-ByUserId/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete chats");
      }

      setChatThread([]);
      setLoadingChats(false);
    } catch (error) {
    } finally {
      setLoadingChats(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) {
      toast.error("Error: No user found. Please log in again.");
      return;
    }

    toast(
      () => (
        <div>
          <p className="text-gray-900 font-medium">
            Are you sure you want to delete your account?
          </p>
          <p className="text-sm text-gray-600">
            This action is permanent and cannot be undone.
          </p>
          <div className="flex justify-end gap-2 mt-2">
            <button
              className="px-3 py-1 text-sm text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => {
                toast.dismiss();
              }}
            >
              Cancel
            </button>
            <button
              className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
              onClick={() => {
                toast.dismiss();
                confirmDeleteAccount();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      { duration: Infinity }
    );
  };

  const confirmDeleteAccount = async () => {
    setLoadingAccount(true);
    setLoading(true);
    await signOut({ redirect: false });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/user-delete/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      toast.success("Your account has been deleted successfully.");
      confirmDeleteChats();
      localStorage.removeItem("user");
      setLoading(false);

      router.push("/login");
    } catch (error) {
   
    } finally {
      setLoadingAccount(false);
    }
  };

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen py-14 bg-gray-50 flex flex-col mx-auto w-3/5">
        <Toaster position="buttom-right" richColors />

        <div className="flex gap-8 p-10">
          <Sidebar />
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-600">
                  Danger Zone
                </h1>
                <p className="text-sm text-gray-500">
                  Delete account and other critical settings userId
                </p>
              </div>

              <BackButton />
            </div>

            <div className="rounded-lg border p-6 space-y-6">
              <ActionButton
                label="Clear All Chats"
                description="Your chat history will be permanently deleted"
                onClick={handleDeleteChats}
                loading={loadingChats}
              />
              <ActionButton
                label="Delete Account"
                description="Your account and all data will be permanently deleted"
                onClick={handleDeleteAccount}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ActionButton = ({ label, description, onClick, loading }) => (
  <div className="flex items-center justify-between py-4 border-b last:border-b-0">
    <div>
      <h3 className="text-base font-medium text-gray-900">{label}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
    <button
      className="px-4 py-2 text-sm bg-white border border-red-300 text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-t-transparent border-red-600 rounded-full"></span>
      ) : (
        label
      )}
    </button>
  </div>
);
