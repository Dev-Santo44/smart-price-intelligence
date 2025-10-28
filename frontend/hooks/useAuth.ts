"use client";

import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

export function useAuth() {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser({ name: "Santo", role: "analyst" });
        });

        return () => unsubscribe();
    }, []);
    

    return {
        user,
        role: user?.role || "analyst", // Default fallback
    };
}