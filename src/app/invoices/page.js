import { BackButton } from "../profile/page";
import Sidebar from "../Sidebar";

export default function InvoicePage() {
  return (
    <div className="flex w-full justify-between bg-gray-50 text-sm">
      <div className="min-h-screen py-14 bg-gray-50 flex flex-col mx-auto w-3/5">
        <div className="flex gap-8 p-10">
          <Sidebar />

          <div className="flex-1">
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
