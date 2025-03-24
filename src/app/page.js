"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import Model from "./model/page";
import Header from "./header";
export default function Home() {
  return (
    <div>
      {/* <Header/> */}
      <Model />
    </div>
  );
}
