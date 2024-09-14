import Link from "next/link";
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getFirestore, collection, getDocs } from "firebase/firestore";

function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(savedMode);
    document.documentElement.classList.toggle("dark", savedMode);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        try {
          const db = getFirestore();
          const querySnapshot = await getDocs(collection(db, "threads"));
          querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${doc.data()}`);
          });
        } catch (err) {
          console.error("Error accessing Firestore: ", err);
          setError("Failed to access Firestore");
        }
      } else {
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      router.push("/");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode.toString()); // Convert boolean to string
      document.documentElement.classList.toggle("dark", newMode);
      return newMode;
    });
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg rounded-lg mb-4 p-6 flex w-screen justify-between items-center">
      <div className="flex items-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          <Link href="/" className="text-2xl">
            Welcome to my forum
          </Link>
        </span>
      </div>

      <nav className="flex items-center space-x-6 hover:opacity-100 hover:scale-100 duration-500 ease-in-out transition-opacity">
        <Link
          href="/"
          className="text-lg text-gray-700 dark:text-gray-300 hover:text-xl hover:font-semibold transition"
        >
          Home
        </Link>
        <Link
          href="/threads"
          className="text-lg text-gray-700 dark:text-gray-300 hover:text-xl hover:font-semibold transition"
        >
          Threads
        </Link>

        <button
          onClick={toggleDarkMode}
          className="bg-slate-300 dark:bg-gray-800 p-2 rounded-full text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 transition"
        >
          {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>

        {isLoggedIn ? (
          <>
            <button
              onClick={handleLogout}
              className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:bg-emerald-700 transition"
            >
              Logout
            </button>
            {error && <p className="text-red-500">{error}</p>}
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:text-xl transition"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="bg-emerald-500 text-white px-4 py-2 rounded-full hover:text-xl transition"
            >
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
