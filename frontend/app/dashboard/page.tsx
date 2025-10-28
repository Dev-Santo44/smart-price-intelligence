"use client";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="flex justify-between items-center p-4 bg-white dark:bg-gray-800">
      <h1 className="font-semibold text-gray-800 dark:text-gray-100">Smart Pricing Intelligence</h1>

      {user ? (
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      ) : null}
    </nav>
  );
}