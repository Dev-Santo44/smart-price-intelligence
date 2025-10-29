"use client";

import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [employeeNumber, setEmployeeNumber] = useState("");
    const [domain, setDomain] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const orgRef = doc(db, "organizations", domain.toLowerCase());
            const orgSnap = await getDoc(orgRef);

            if (orgSnap.exists()) {
                setError(`Domain "${domain}" already has an admin.`);
                setLoading(false);
                return;
            }

            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCred.user;

            await setDoc(orgRef, {
                domain: domain.toLowerCase(),
                adminUid: user.uid,
                createdAt: new Date().toISOString(),
            });

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name,
                email,
                employeeNumber,
                domain: domain.toLowerCase(),
                role: "admin",
                createdAt: new Date().toISOString(),
            });

            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8">
                <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-4">
                    Register Organization Admin
                </h1>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <form onSubmit={handleRegister} className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="Organization Domain (e.g., techcorp)"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        required
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="p-2 border rounded"
                    />
                    <input
                        type="text"
                        placeholder="Employee Number"
                        value={employeeNumber}
                        onChange={(e) => setEmployeeNumber(e.target.value)}
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
                        className="bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                        {loading ? "Creating Account..." : "Register as Admin"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                    Already have an account?{" "}
                    <a href="/login" className="text-blue-500 hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
