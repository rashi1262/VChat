import Sidebar from '../Sidebar';

export default function BillingPage() {
  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
    
    <div className="min-h-screen bg-gray-50 flex flex-col   ml-auto w-4/5">
    {/* <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-10"> */}
        <div className="flex gap-7 p-6">
          <Sidebar />
          
          <div className="flex-1 mr-64">
            <div className="mb-6">
              <h1 className="text-lg font-semibold text-gray-600">Billing Details</h1>
              <p className="text-sm text-gray-500">
                Update your billing information and payment methods
              </p>
            </div>

            {/* Billing Details Section */}
            <div className=" rounded-lg  p-6 space-y-6">
              

              <div className="p-8 flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 text-sm mx-auto">No billing details</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
