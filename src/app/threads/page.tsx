"use client";
import Header from "@/components/layout/Header";
import React from "react";
import AllThreads from "@/components/AllThreads";

const AllThreadsPage = () => {
  return (
    <main className="container">
      <div className="mb-20">
        <Header />
      </div>
      <div
        className="p-10 fixed bg-slate-200 shadow-lg dark:bg-gray-900 rounded-lg w-2/3"
        style={{ top: "85%", left: "50%", transform: "translate(-50%, -50%)" }}
      >
        <a
          href="/create-thread"
          className="bg-black text-white py-3 px-5 rounded-md dark:text-black dark:bg-white hover:opacity-75"
        >
          Create Thread
        </a>
      </div>
      <AllThreads />
      <div className="p-5"></div>
    </main>
  );
};

export default AllThreadsPage;
