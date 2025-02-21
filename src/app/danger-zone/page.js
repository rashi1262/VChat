"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Sidebar from "../Sidebar";

export default function DangerZonePage() {
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [userId, setUserId] = useState(null);

  // Fetch user ID from localStorage when the component mounts
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id || user._id); // Ensure correct ID field
    }
  }, []);

  const handleDeleteChats = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete all chats? This action cannot be undone.");
    if (!confirmDelete) return;

    setLoadingChats(true);
    try {
      const response = await fetch("https://chatbot-2vqr.onrender.com/chatbot/delete-all", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Delete Chats Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete chats");
      }

      alert("All chats deleted successfully!");
    } catch (error) {
      console.error("Error deleting chats:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userId) {
      alert("Error: No user found. Please log in again.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action is permanent and cannot be undone."
    );
    if (!confirmDelete) return;

    setLoadingAccount(true);
    try {
      const response = await fetch(`https://chatbot-2vqr.onrender.com/user-delete/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Delete Account Response:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      alert("Your account has been deleted successfully.");
      localStorage.removeItem("user"); // Clear stored user data
      signOut(); // Logs out the user after account deletion
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingAccount(false);
    }
  };

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen bg-gray-50 flex flex-col ml-auto w-4/5">
        <div className="flex gap-7 p-6">
          <Sidebar />
          <div className="flex-1 mr-64">
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-gray-700">Danger Zone</h1>
              <p className="text-sm text-gray-500">Delete account and other critical settings</p>
            </div>

            <div className="rounded-lg border p-6 space-y-6">
              {/* Clear All Chats Section */}
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Clear All Chats</h3>
                  <p className="text-sm text-gray-500">Your chat history will be permanently deleted</p>
                </div>
                <button
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  onClick={handleDeleteChats}
                  disabled={loadingChats}
                >
                  {loadingChats ? "Deleting..." : "Delete All Chats"}
                </button>
              </div>

              {/* Delete Account Section */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-500">Your account and all data will be permanently deleted</p>
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
