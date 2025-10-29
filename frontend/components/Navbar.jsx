"use client";
import Link from "next/link";
import { useState } from "react";
import { Bell, Search, Sun, Moon, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";
import img from "./assets/Nine.png"

import { signOut } from 'firebase/auth';
import { useRouter } from "next/navigation";

export default function Navbar() {
    const [search, setSearch] = useState("");
    const { theme, toggleTheme } = useTheme();
    const { user } = useAuth();
    const { profile, logout, loading } = useAuth();
    const router = useRouter();
    

    const handleLogIn = () => {
        router.push('/login')

    }

    return (
        <nav className="sticky top-0 z-50 flex items-center justify-between bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
            {/* Left: Logo */}
            <div className="flex items-center gap-2">
                <Image src={img} alt="Smart Pricing Intelligence" width={30} height={30} />
                <Link href = "/">
                <span className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                    Smart Pricing Intelligence
                </span>
                </Link>
            </div>

            {/* Center: Search */}
            <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg w-1/3">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search products, alerts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="ml-2 bg-transparent text-sm w-full focus:outline-none text-gray-800 dark:text-gray-100"
                />
            </div>

            {/* Right: Icons */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                    {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                </button>

                {/* Alerts Icon */}
                <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                        3
                    </span>
                </button>
                
                
                {/* User Menu */}
                <div className="flex items-center gap-2">
                    {user ? <> <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-800 dark:text-gray-100" />
                    </div>
                        <span className="hidden md:inline text-sm font-medium">{console.log(user.name)}</span></> : <button
                            onClick={handleLogIn}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                        >
                        Log in
                    </button>}
                </div>
                <div className="flex items-center gap-4">
                    {!loading && profile ? (
                        <>
                            <span className="text-gray-700 dark:text-gray-200 font-medium">
                                👋 Hi, {profile.name || "User"}
                            </span>
                            <button
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                            >
                                Logout
                            </button>
                        </>
                    ) : null}
                </div>
            </div>
        </nav>
    );
}
