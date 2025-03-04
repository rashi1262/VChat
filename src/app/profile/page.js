"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "../Sidebar";
import Link from "next/link";
import axios from "axios";
import { toast, Toaster } from "sonner";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setDisplayName(user.name || "No Name");
        setEmail(user.email || "No Email");
        setProfileImage(user.image);
        setUserId(user.id);
      }
    }
  }, []);

  const uploadImage = async (file) => {
    if (!file) {
     
      toast.error("Please select a file.");
      return null;
    }

    try {
      const base64String = await fileToBase64(file); 

      const requestData = {
        file: base64String, 
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_VCHAT_API_URL}/update/${userId}`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json", 
          },
        }
      );
      return response.data.imageUrl; 
    } catch (error) {
      toast.error("Failed to upload image.");
      return null;
    }
  };

  const handleSave = async () => {
    try {
      let finalImageUrl = profileImage;

      if (fileInputRef.current.files[0]) {
        const uploadedUrl = await uploadImage(fileInputRef.current.files[0]);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        } else {
          return;
        }
      }

      const updatedUser = {
        name: displayName,
        email: email,
        image: finalImageUrl,
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/update/${userId}`,
        updatedUser
      );

      localStorage.setItem(
        "user",
        JSON.stringify({ ...updatedUser, id: userId })
      );

      setProfileImage(finalImageUrl);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);
    }
  };

  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen bg-gray-50 flex flex-col ml-auto w-4/5">
        <Toaster position="bottom-right" richColors />

        <div className="flex gap-7 pt-6">
          <Sidebar />

          <div className="flex-1 mr-64">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-700">Profile</h1>
                <p className="text-sm text-gray-500">
                  Manage your personal information
                </p>
              </div>
              <Link
                href="/model"
                className="px-4 py-2 text-gray-500 border border-rounded rounded-md"
              >
                Back to Chat
              </Link>
            </div>

            <div className="rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  Profile Photo
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Click on the avatar to upload a custom one from your files.
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-green-700 flex items-center justify-center text-white text-3xl font-medium">
                        {email.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    <button
                      onClick={() => fileInputRef.current.click()}
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-400 px-2 py-1 rounded text-sm shadow-lg border flex items-center gap-1"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-8">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-2/5 max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-2/5 max-w-md px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed text-gray-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
