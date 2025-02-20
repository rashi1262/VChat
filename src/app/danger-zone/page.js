"use client";

import Sidebar from '../Sidebar';

export default function DangerZonePage() {
  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
    
    <div className="min-h-screen bg-gray-50 flex flex-col   ml-auto w-4/5">
    {/* <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-10"> */}
        <div className="flex gap-7 p-6">
          <Sidebar />
          
          <div className="flex-1 mr-64">
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-gray-700">Danger Zone</h1>
              <p className="text-sm text-gray-500">
                Delete account and other critical settings
              </p>
            </div>

            <div className="rounded-lg border p-6 space-y-6">
              {/* Clear All Chats Section */}
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Clear All Chats</h3>
                  <p className="text-sm text-gray-500">
                    Your chat history will be permanently deleted
                  </p>
                </div>
                <button 
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => {
                    // Add confirmation dialog and deletion logic here
                    console.log("Delete all chats clicked");
                  }}
                >
                  Delete All Chats
                </button>
              </div>

              {/* Delete Account Section */}
              <div className="flex items-center justify-between py-4">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Delete Account</h3>
                  <p className="text-sm text-gray-500">
                    Your chat history will be permanently deleted
                  </p>
                </div>
                <button 
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  onClick={() => {
                    // Add confirmation dialog and deletion logic here
                    console.log("Delete account clicked");
                  }}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}