"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface UserProfile {
    uid: string;
    email: string;
    name?: string;
    employeeNumber?: string;
    domain?: string;
    role?: string;
    createdAt?: string;
    disabled?: boolean;
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                const userRef = doc(db, "users", firebaseUser.uid);
                const snap = await getDoc(userRef);

                if (snap.exists()) {
                    const data = snap.data() as any;

                    // IMPORTANT FIX: MERGE FIREBASE AUTH FIELDS
                    setProfile({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email!,
                        role: data.role || "user",
                        domain: data.domain || "",
                        name: data.name || "",
                        employeeNumber: data.employeeNumber || "",
                        createdAt: data.createdAt || "",
                        disabled: data.disabled || false,
                    });
                } else {
                    // fallback
                    setProfile({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email!,
                        role: "user",
                        domain: "",
                    });
                }
            } else {
                setUser(null);
                setProfile(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        setProfile(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}
