"use client";
import React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Navbar from "../navbar";

const page = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    useEffect(() => {
      if (typeof window !== "undefined") {
        try {
          const storedUser = localStorage.getItem("user");
          if (!storedUser) {
            router.push("/login");
            return;
          } else {
            const user = JSON.parse(storedUser);
            setEmail(user?.email || "No Email");
            setName(user?.name || "No Name");
          }
        } catch (error) {}
      }
    }, []);
  return (
    <>
      <div className="flex w-full justify-between bg-gray-50">
        <Navbar/>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center ml-auto w-4/5">
          <div className="flex justify-center items-center h-screen">
            <div className="max-w-4xl w-full rounded-md p-6 text-center">
              <div className="w-16 h-16 rounded-full ml-[240px] mb-10 ">
                <svg
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 42 42"
                  className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--large___HBGvG"
                >
                  <path
                    d="M.5 21C.5 9.678 9.678.5 21 .5S41.5 9.678 41.5 21 32.322 41.5 21 41.5.5 32.322.5 21Z"
                    fill="#fff"
                  ></path>
                  <rect
                    x="0.656"
                    y="0.656"
                    width="40.688"
                    height="40.688"
                    rx="20.344"
                    stroke="#EEE"
                    strokeWidth="1.313"
                  ></rect>
                  <path
                    d="M19.164 22.32c.289 0 .548-.07.778-.213a1.71 1.71 0 0 0 .566-.573 1.49 1.49 0 0 0 .213-.786c0-.279-.071-.536-.213-.77a1.565 1.565 0 0 0-.566-.566 1.492 1.492 0 0 0-.778-.206c-.29 0-.551.069-.786.206a1.566 1.566 0 0 0-.566.565 1.504 1.504 0 0 0-.205.771c0 .29.068.551.205.786.142.235.33.426.566.573.235.142.497.213.786.213Zm-3.114 4.15h9.886c.254 0 .445-.061.573-.184.132-.122.198-.318.198-.587v-1.05l-2.615-2.454a1.315 1.315 0 0 0-.419-.264 1.241 1.241 0 0 0-.484-.096c-.157 0-.311.032-.463.096a1.497 1.497 0 0 0-.433.264L19.53 24.62l-1.102-.991a1.251 1.251 0 0 0-.389-.25 1.156 1.156 0 0 0-.845 0c-.132.049-.26.127-.381.235l-1.536 1.44v.646c0 .269.064.465.191.587.133.123.326.184.58.184Zm-.213 2.086c-.847 0-1.501-.23-1.961-.69-.456-.456-.683-1.105-.683-1.947v-7.433c0-.837.227-1.483.683-1.939.46-.46 1.114-.69 1.96-.69H26.15c.842 0 1.493.23 1.953.69.465.456.698 1.102.698 1.94v7.432c0 .842-.233 1.491-.698 1.946-.46.46-1.111.69-1.953.69H15.837Zm-.992-13.94c.04-.392.176-.703.411-.933.24-.23.59-.345 1.05-.345h9.372c.466 0 .816.115 1.05.345.236.23.375.54.42.933H14.845Zm1.44-2.395c.034-.372.169-.66.404-.867.235-.205.548-.308.94-.308h6.727c.397 0 .713.103.948.309.235.205.367.494.397.866h-9.416Z"
                    fill="#857DDD"
                  ></path>
                </svg>
              </div>
              <h1 className="text-2xl text-gray-900">Image Generation</h1>
              <h1 className="text-[18px] mt-5 text-gray-400">
                Bring your ideas to life—create stunning images from just a few
                words!
              </h1>
            </div>
            <div className="mb-5 ml-20 w-2/5 p-1 flex bg-gray-100 justify-between items-center fixed bottom-0 left-1/2 transform -translate-x-1/2  rounded-l-full rounded-r-full">
              <button className="ml-2 p-2 rounded-full bg-gray-200">
                <div className="w-7 h-6 p-1 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                    className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M9 3.75v10.5M3.75 9h10.5"
                    ></path>
                  </svg>
                </div>
              </button>
              <input
                type="text"
                placeholder="Send a message..."
                className="w-3/4 p-1 rounded focus:outline-none text-black bg-gray-100"
              />
              <button className="p-1 rounded-full bg-gray-200">
                <div className="w-7 h-6 p-1 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                    className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M2.25 7.5v3m3.375-6v9M9 2.25v13.5M12.375 4.5v9m3.375-6v3"
                    ></path>
                  </svg>
                </div>
              </button>
              <button className="p-1 mr-2 rounded-full bg-gray-200">
                <div className="w-7 h-6 p-1 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 18 18"
                    className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M2.017 2.25c-.053.135.02.355.166.795l1.713 5.162A1 1 0 0 1 4 8.2h5.5a.8.8 0 1 1 0 1.6H4a1 1 0 0 1-.151-.014l-1.66 4.96c-.148.44-.222.66-.169.796a.4.4 0 0 0 .267.242c.14.039.352-.056.776-.247l13.45-6.053c.415-.186.622-.28.686-.409a.4.4 0 0 0 0-.356c-.064-.13-.271-.223-.685-.41L3.059 2.256c-.423-.19-.635-.285-.775-.246a.4.4 0 0 0-.267.24"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed top-3 right-5 flex items-center ">
        {/* <button className="flex items-center text-black border rounded-l-full rounded-r-full p-1 bg-yellow-200">
          <div className="w-5 h-5 m1-2 mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 18 18"
              className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--standart___0Ap1-"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.552"
                d="M1.628 6.906h14.744M7.448 2.25 5.896 6.906 9 15.83l3.104-8.924-1.552-4.656M9.477 15.646l6.952-8.343c.118-.14.177-.212.2-.29a.4.4 0 0 0 0-.213c-.023-.08-.082-.15-.2-.291l-3.363-4.036c-.068-.082-.102-.123-.144-.152a.4.4 0 0 0-.123-.058c-.05-.013-.103-.013-.21-.013H5.411c-.107 0-.16 0-.21.013a.4.4 0 0 0-.122.058c-.042.03-.077.07-.145.152L1.571 6.51c-.118.141-.176.212-.199.29a.4.4 0 0 0 0 .213c.023.08.081.15.2.291l6.951 8.343c.164.196.246.295.344.33.086.032.18.032.266 0 .098-.035.18-.134.344-.33"
              ></path>
            </svg>
          </div>
          Go Pro
        </button> */}
        <button className="flex items-center">
          <Link
            href="/image"
            className="flex hover:bg-gray-200 rounded text-black text-base p-2"
          >
            <div className="w-8 h-7 pl-1 pr-1 ">
              <svg
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 42 42"
                className="CustomIcon-module__icon___zGR29 CustomIcon-module__icon--large___HBGvG"
              >
                <path
                  d="M.5 21C.5 9.678 9.678.5 21 .5S41.5 9.678 41.5 21 32.322 41.5 21 41.5.5 32.322.5 21Z"
                  fill="#fff"
                ></path>
                <rect
                  x="0.656"
                  y="0.656"
                  width="40.688"
                  height="40.688"
                  rx="20.344"
                  stroke="#EEE"
                  strokeWidth="1.313"
                ></rect>
                <path
                  d="M19.164 22.32c.289 0 .548-.07.778-.213a1.71 1.71 0 0 0 .566-.573 1.49 1.49 0 0 0 .213-.786c0-.279-.071-.536-.213-.77a1.565 1.565 0 0 0-.566-.566 1.492 1.492 0 0 0-.778-.206c-.29 0-.551.069-.786.206a1.566 1.566 0 0 0-.566.565 1.504 1.504 0 0 0-.205.771c0 .29.068.551.205.786.142.235.33.426.566.573.235.142.497.213.786.213Zm-3.114 4.15h9.886c.254 0 .445-.061.573-.184.132-.122.198-.318.198-.587v-1.05l-2.615-2.454a1.315 1.315 0 0 0-.419-.264 1.241 1.241 0 0 0-.484-.096c-.157 0-.311.032-.463.096a1.497 1.497 0 0 0-.433.264L19.53 24.62l-1.102-.991a1.251 1.251 0 0 0-.389-.25 1.156 1.156 0 0 0-.845 0c-.132.049-.26.127-.381.235l-1.536 1.44v.646c0 .269.064.465.191.587.133.123.326.184.58.184Zm-.213 2.086c-.847 0-1.501-.23-1.961-.69-.456-.456-.683-1.105-.683-1.947v-7.433c0-.837.227-1.483.683-1.939.46-.46 1.114-.69 1.96-.69H26.15c.842 0 1.493.23 1.953.69.465.456.698 1.102.698 1.94v7.432c0 .842-.233 1.491-.698 1.946-.46.46-1.111.69-1.953.69H15.837Zm-.992-13.94c.04-.392.176-.703.411-.933.24-.23.59-.345 1.05-.345h9.372c.466 0 .816.115 1.05.345.236.23.375.54.42.933H14.845Zm1.44-2.395c.034-.372.169-.66.404-.867.235-.205.548-.308.94-.308h6.727c.397 0 .713.103.948.309.235.205.367.494.397.866h-9.416Z"
                  fill="#857DDD"
                ></path>
              </svg>
            </div>
            Image Generation
          </Link>
        </button>
      </div>
    </>
  );
};

export default page;