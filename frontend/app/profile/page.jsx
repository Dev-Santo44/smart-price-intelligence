"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
    User,
    Mail,
    Phone,
    Building,
    Briefcase,
    LogOut,
    Save,
    Loader2
} from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
    const { user, profile, loading, logout } = useAuth();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
    });
    const [updateLoading, setUpdateLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Initialize form data when profile is loaded
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                phoneNumber: profile.phoneNumber || "", // Handle the new field
            });
        }
    }, [profile]);

    // Protect the route
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!user) return;

        setUpdateLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, {
                name: formData.name,
                phoneNumber: formData.phoneNumber
            });

            setMessage({ type: "success", text: "Profile updated successfully!" });
            setIsEditing(false);

            // Reload page to fetch fresh data (or rely on real-time listener if AuthContext handles it, 
            // but AuthContext in this app uses onAuthStateChanged which might not catch Firestore updates immediately 
            // unless we manually update local state or use a snapshot listener. 
            // For now, a reload or letting the context refresh on next mount is simple.)
            // Actually, AuthContext only fetches on auth state change. We might want to trigger a refresh or just rely on local state for now.
            // Since we edited the DB, next time we load we get new data. 
            // To make visual feedback immediate, we could update the context manually but that requires context changes.
            // For this iteration, we accept that 'profile' in context might be stale until reload/re-auth. 
            // However, the UI currently shows 'formData' when editing, and we revert to 'profile' (which is stale) when not.
            // Let's rely on the user seeing the success message.

            // Optional: Force reload to update context
            window.location.reload();

        } catch (error) {
            console.error("Error updating profile:", error);
            setMessage({ type: "error", text: "Failed to update profile. Please try again." });
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (!user || !profile) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Header / Profile Card */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32"></div>
                    <div className="px-6 pb-6">
                        <div className="relative flex items-end -mt-12 mb-6">
                            <div className="relative h-24 w-24 rounded-full ring-4 ring-white dark:ring-gray-800 bg-white dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                {user.photoURL ? (
                                    <Image
                                        src={user.photoURL}
                                        alt={profile.name || "User"}
                                        width={96}
                                        height={96}
                                        className="object-cover h-full w-full"
                                    />
                                ) : (
                                    <User className="h-12 w-12 text-gray-400" />
                                )}
                            </div>
                            <div className="ml-4 mb-2">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {profile.name || "User Name"}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <span className="capitalize">{profile.role || "Role"}</span>
                                    {profile.domain && <span> • {profile.domain}</span>}
                                </p>
                            </div>
                            <div className="ml-auto mb-2">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
                                >
                                    {isEditing ? "Cancel Edit" : "Edit Profile"}
                                </button>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`mb-6 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
                                    Personal Information
                                </h3>

                                <form id="profile-form" onSubmit={handleUpdate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Full Name
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="name"
                                                disabled={!isEditing}
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="email"
                                                disabled
                                                value={profile.email}
                                                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md bg-gray-100 text-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Phone Number
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                disabled={!isEditing}
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                placeholder="+1 (555) 000-0000"
                                                className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={updateLoading}
                                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                            >
                                                {updateLoading ? (
                                                    <Loader2 className="h-5 w-5 animate-spin" />
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        <Save className="h-4 w-4" /> Save Changes
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>

                            {/* Account Info */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
                                    Account Details
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Role
                                        </label>
                                        <div className="flex items-center gap-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <Briefcase className="h-5 w-5 text-indigo-500" />
                                            <span className="capitalize">{profile.role || "User"}</span>
                                        </div>
                                    </div>

                                    {profile.employeeNumber && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Employee ID
                                            </label>
                                            <div className="flex items-center gap-2 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                <Building className="h-5 w-5 text-indigo-500" />
                                                <span>{profile.employeeNumber}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Account Status
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${profile.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                                {profile.disabled ? "Disabled" : "Active"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-gray-800 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-900/20"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        Log Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
