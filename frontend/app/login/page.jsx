"use client";

import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [domain, setDomain] = useState("");
    const [error, setError] = useState  (null);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const userCred = await signInWithEmailAndPassword(auth, email, password);
            const user = userCred.user;
            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            if (!snap.exists()) {
                setError("User not found in database");
                return;
            }

            const userData = snap.data();
            if (userData.domain !== domain.toLowerCase()) {
                setError(`Invalid domain. Belongs to "${userData.domain}"`);
                return;
            }

            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            const userRef = doc(db, "users", user.uid);
            const snap = await getDoc(userRef);

            if (!snap.exists()) {
                // create a new user with domain pending
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    role: "employee",
                    domain: domain.toLowerCase() || "unknown",
                    createdAt: new Date().toISOString(),
                });
            }

            router.push("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
                    Login to Your Organization
                </h1>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={handleLogin} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Organization Domain"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        required
                        className="p-2 border rounded"
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="p-2 border rounded"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="p-2 border rounded"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>
                </form>

                <button
                    onClick={handleGoogleSignIn}
                    className="bg-red-500 text-white py-2 rounded mt-4 w-full hover:bg-red-600"
                >
                    Continue with Google
                </button>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Don’t have an account?{" "}
                    <a href="/register/admin" className="text-blue-500 hover:underline">
                        admin Register
                    </a>
                    <a href="/register" className="text-blue-500 hover:underline">
                        User Register
                    </a>
                </p>
            </div>
        </div>
    );
}
