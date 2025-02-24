"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Sidebar from "../Sidebar";
import { toast, Toaster } from "sonner";

export default function DangerZonePage() {
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id || user._id);
    }
  }, []);

  const handleDeleteChats = async () => {
    toast(
      () => (
        <div>
          <p className="text-gray-900 font-medium">
            Are you sure you want to delete all chats?
          </p>
          <p className="text-sm text-gray-600">
            This action cannot be undone.
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
      console.log("process.env.NEXT_PUBLIC_VCHAT_API_URL", process.env.NEXT_PUBLIC_VCHAT_API_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_VCHAT_API_URL}/chatbot/delete-all`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete chats");
      }
  
      toast.success("All chats deleted successfully!");
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoadingChats(false);
    }
  };
  

  const handleDeleteAccount = async () => {
    if (!userId) {
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
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_VCHAT_API_URL}/user-delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }
  
      toast.success("Your account has been deleted successfully.");
      localStorage.removeItem("user");
      signOut();
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoadingAccount(false);
    }
  };
  

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen bg-gray-50 flex flex-col ml-auto w-4/5">
        <Toaster position="buttom-right" richColors />

        <div className="flex gap-7 p-6">
          <Sidebar />
          <div className="flex-1 mr-64">
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-gray-700">
                Danger Zone
              </h1>
              <p className="text-sm text-gray-500">
                Delete account and other critical settings
              </p>
            </div>

            <div className="rounded-lg border p-6 space-y-6">
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Clear All Chats
                  </h3>
                  <p className="text-sm text-gray-500">
                    Your chat history will be permanently deleted
                  </p>
                </div>
                <button
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  onClick={handleDeleteChats}
                  disabled={loadingChats}
                >
                  {loadingChats ? "Deleting..." : "Delete All Chats"}
                </button>
              </div>

              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="text-base font-medium text-gray-900">
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-500">
                    Your account and all data will be permanently deleted
                  </p>
                </div>
                <button
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  onClick={handleDeleteAccount}
                  disabled={loadingAccount}
                >
                  {loadingAccount ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
