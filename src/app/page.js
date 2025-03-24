"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

import Model from "./model/page";
export default function Home() {
  return (
    <div>
      <Model />
    </div>
  );
}
