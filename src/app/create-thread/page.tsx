"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/firebase";
import { collection, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Header from "@/components/layout/Header";
import { useRouter } from "next/navigation";
import * as types from "@/types/types";

function CreateThreadPage() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [creator, setCreator] = useState<string>("");
  const [locked, setLocked] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCreator(user.uid);
      } else {
        console.log("User is not logged in");
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creator) {
      console.error("No authenticated user found");
      return;
    }

    const newThread: types.Thread = {
      id: "",
      markedAnswerId: null,
      title,
      description,
      category,
      creator,
      creationDate: new Date().toISOString(),
      locked,
    };

    try {
      await addDoc(collection(db, "threads"), newThread);
      console.log("Document successfully written!");
      setTitle("");
      setDescription("");
      setCategory("");
      router.push("/");
    } catch (error) {
      console.error("Error writing document: ", error);
    }
  };

  return (
    <div>
      <Header />
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gradient bg-gradient-to-r from-purple-500 to-pink-500">
          Create a New Thread
        </h1>
        {creator ? (
          <form
            onSubmit={handleSubmit}
            className="bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 shadow-lg rounded-lg p-8 mb-6"
          >
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:text-white transition-all"
                placeholder="Enter your thread title"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:text-white transition-all"
                placeholder="Provide a detailed description"
                required
                rows={4}
              />
            </div>
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:text-white transition-all"
                placeholder="e.g. Technology, Health, etc."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-purple-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all"
            >
              Create Thread
            </button>
          </form>
        ) : (
          <p className="text-red-500 text-center text-lg mb-8">
            You need to log in to create a New Thread
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateThreadPage;
