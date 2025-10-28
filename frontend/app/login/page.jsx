"use client";

import React, { useState } from "react";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [employeeNumber, setEmployeeNumber] = useState("");
    const [error, setError] = useState  (null);
    const [loading, setLoading] = useState(false);

    // ✅ Email Sign-In
    const handleSignIn = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/dashboard");
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    // ✅ Email Sign-Up + Firestore Save
    const handleSignUp = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 🧾 Save extra info in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                name,
                employeeNumber,
                createdAt: new Date().toISOString(),
                role: "employee", // default role
            });

            router.push("/dashboard");
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Google Sign-In + Firestore
    const handleGoogleSignIn = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Store Google user info if not exists
            await setDoc(
                doc(db, "users", user.uid),
                {
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName || "",
                    employeeNumber: "",
                    createdAt: new Date().toISOString(),
                    role: "employee",
                },
                { merge: true } // don't overwrite existing
            );

            router.push("/dashboard");
        } catch (err) {
            setError("Google sign-in failed.");
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">
                    Smart Pricing Intelligence
                </h1>

                {error && (
                    <p className="text-red-500 text-sm text-center mb-4">{error}</p>
                )}

                <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-2 mt-1 border rounded bg-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="employeeNumber" className="text-sm font-medium">
                            Employee Number
                        </label>
                        <input
                            id="employeeNumber"
                            type="text"
                            placeholder="Enter your employee number"
                            value={employeeNumber}
                            onChange={(e) => setEmployeeNumber(e.target.value)}
                            required
                            className="w-full p-2 mt-1 border rounded bg-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 mt-1 border rounded bg-transparent"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="text-sm font-medium">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 mt-1 border rounded bg-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>

                <button
                    onClick={handleSignIn}
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                    Already have an account? Sign In
                </button>

                <div className="mt-6 text-center">
                    <button
                        onClick={handleGoogleSignIn}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg"
                    >
                        Continue with Google
                    </button>
                </div>
            </div>
        </div>
    );
}
