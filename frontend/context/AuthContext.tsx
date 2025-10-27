"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = {
    name: string;
    email: string;
    role: "admin" | "analyst" | "executive" | "engineer";
};

type AuthContextType = {
    user: User | null;
    role: string;
    login: (userData: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    // Load saved user from localStorage on mount
    useEffect(() => {
        const savedUser = localStorage.getItem("spi_user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        } else {
            // Temporary mock login (for development)
            const defaultUser = {
                name: "Santo",
                email: "santo@example.com",
                role: "admin" as const,
            };
            setUser(defaultUser);
            localStorage.setItem("spi_user", JSON.stringify(defaultUser));
        }
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("spi_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("spi_user");
    };

    return (
        <AuthContext.Provider value={{ user, role: user?.role || "guest", login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom Hook
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
