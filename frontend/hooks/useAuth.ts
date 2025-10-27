"use client";

import { useState, useEffect } from "react";

export function useAuth() {
    const [user, setUser] = useState<{ name: string; role: string } | null>(null);

    useEffect(() => {
        // Mock example – replace with your real auth call
        setUser({ name: "Santo", role: "admin" });
    }, []);

    return {
        user,
        role: user?.role || "analyst", // Default fallback
    };
}