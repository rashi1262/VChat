"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Key,
  Cuboid,
  CreditCard,
  FileText,
  Receipt,
  AlertTriangle,
  HelpCircle,
  LogOut,
  Menu, // Import Menu icon
  X, // Import X icon
} from "lucide-react";
import { useChat } from "./chatContext";
import { useState, useEffect } from "react";

export default function Sidebar() {
  const router = useRouter();
  const { chatThread, setChatThread } = useChat();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };

    // Initial check
    handleResize();

    // Listen for window resize events
    window.addEventListener("resize", handleResize);

    // Clean up the event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setChatThread(() => []);
    localStorage.removeItem("user");
    localStorage.removeItem("remainingCredits");
    localStorage.setItem("hasLoggedIn", false);
    router.push("/");
  };

  const sidebarClasses = `
        bg-white
        ${
          isMobile
            ? "fixed top-0 left-0 h-full z-10 transition-transform duration-300 transform shadow-md"
            : "w-64"
        }
        ${isMobile && !isOpen ? "-translate-x-full" : ""}
        ${isMobile && isOpen ? "translate-x-0" : ""}
    `;

  const backdropClasses = `
        fixed top-0 left-0 w-full h-full bg-black opacity-50 z-9
        ${isMobile && isOpen ? "" : "hidden"}
    `;

  const closeButtonClasses = `
        absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700
        ${isMobile ? "" : "hidden"}
    `;

  const mobileMenuButtonClasses = `
        fixed top-4 left-4 p-2 rounded-md  z-20
    `;

  return (
    <>
      {isMobile && (
        <button onClick={toggleSidebar} className={mobileMenuButtonClasses}>
          {isOpen || <Menu size={24} />}
        </button>
      )}
      {/* {isMobile && (
        <button onClick={toggleSidebar}>{isOpen || <Menu size={24} />}</button>
      )} */}

      {isMobile && isOpen && (
        <div className={backdropClasses} onClick={toggleSidebar}></div>
      )}

      <div className={sidebarClasses}>
        <div
          className={
            isMobile ? "py-6 px-4 space-y-6 mt-14" : `py-6 px-4 space-y-6`
          }
        >
          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-2">Account</h2>
            <div className="space-y-2">
              <Link
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                href="/profile"
              >
                <User size={16} />
                Profile
              </Link>
              {/* <Link className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md" href="/change-password" >
                                <Key size={16} />
                                 Change Password
                             </Link> */}
              <Link
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                href="/login-connection"
              >
                <Cuboid size={16} />
                Login Connection
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-2">Plan</h2>
            <div className="space-y-2">
              <Link
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                href="/plans"
              >
                <FileText size={16} />
                Plans
              </Link>
              <Link
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                href="/billing"
              >
                <CreditCard size={16} />
                Billing Details
              </Link>
              <Link
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                href="/invoices"
              >
                <Receipt size={16} />
                Invoices
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-2">General</h2>
            <div className="space-y-2">
              <Link
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                href="/danger-zone"
              >
                <AlertTriangle size={16} />
                Danger Zone
              </Link>
              <Link
                href="mailto:viddeveloper111@gmail.com?subject=Support Request&body=Hello, I need help with..."
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <HelpCircle size={16} />
                Support
              </Link>
              <button
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Log Out
              </button>
            </div>
          </div>
        </div>
        {isMobile && (
          <button onClick={toggleSidebar} className={closeButtonClasses}>
            <X size={20} />
          </button>
        )}
      </div>
    </>
  );
}
