"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Key,
 
  CreditCard,
  FileText,
  Receipt,
  AlertTriangle,
  HelpCircle,
  LogOut,
} from "lucide-react";




export default function Sidebar() {
    const router = useRouter()
    const handleLogout = async () => {
    
        await signOut({ redirect: false });
    
        localStorage.removeItem("user");
        router.push("/login");
        console.log("Logging out...");
      }; 
   
  return (
    <div className="mr-3 border-r border-gray-200">
      <div className="space-y-4 mr-3">
        <div>
          <h2 className="text-gray-500 text-sm font-medium mb-1">
            Account
          </h2>
          <div className="space-y-1">
            <Link className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md"href="/profile" >
            <User size={13} />
              Profile
            </Link>
            <Link className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md" href="/change-password" >
            <Key size={18} />
              Change Password
            </Link>
            <Link className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md" href="/login-connection" >
          
              Login Connection
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-gray-500 text-sm text-bold font-medium mb-2">Plan</h2>
          <div className="space-y-1">
            <Link  className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md" href="/plans" >
            <CreditCard size={18} />
              Plans
            </Link>
            <Link className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md" href="/billing" >
            <FileText size={18} />
              Billing Details
            </Link>
            <Link className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md" href="/invoices" >
            <Receipt size={18} />
            
              Invoices
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-gray-500 text-sm font-medium mb-2">
            General
          </h2>
          <div className="space-y-1">
            <Link className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md" href="/danger-zone" >
            <AlertTriangle size={18} />
              Danger Zone
            </Link>
            <Link className="flex items-center gap-2 px-4 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded-md" href="/support" >
            <HelpCircle size={18} />
              Support
            </Link>
            <button
          className="w-full flex  gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Log Out
        </button>
          </div>
        </div>

       
      </div>
    </div>
  );
}