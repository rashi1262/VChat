import { BackButton } from "../profile/page";
import Sidebar from "../Sidebar";

export default function InvoicePage() {
  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen  mt-12 bg-gray-50 flex flex-col   ml-auto w-4/5">
        <div className="flex gap-7 p-6">
          <Sidebar />

          <div className="flex-1 mr-64">
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-lg font-semibold text-gray-600">
                  Invoices
                </h1>
                <p className="text-sm text-gray-500">
                  Access your billing history and invoices
                </p>
              </div>

              <BackButton />
            </div>

            <div className=" rounded-lg p-6 space-y-6">
              <div className="p-8 flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 text-sm ">No invoices</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
