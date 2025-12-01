"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const ADMIN_API = "/api/admin/users";

type UserDoc = {
    uid: string;
    email: string;
    name?: string;
    employeeNumber?: string;
    role?: string;
    domain?: string;
    createdAt?: string;
    disabled?: boolean;
};

export default function UserManagementPage() {
    const { user, profile, loading } = useAuth();

    const [users, setUsers] = useState<UserDoc[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [editingUid, setEditingUid] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<Record<string, Partial<UserDoc>>>({});
    const [message, setMessage] = useState<{ type: "info" | "success" | "error"; text: string } | null>(null);

    const isSuper = profile?.role === "superadmin";

    const buildHeaders = () => ({
        "Content-Type": "application/json",
        "x-user-role": profile?.role || "",
        "x-user-uid": profile?.uid || "",
        "x-user-domain": profile?.domain || "",
        "x-user-email": profile?.email || "",
    });

    // Load users
    useEffect(() => {
        if (!loading && profile?.role) loadUsers();
    }, [loading, profile]);

    async function loadUsers() {
        setLoadingUsers(true);
        setMessage(null);
        try {
            const res = await fetch(`${ADMIN_API}?limit=500`, {
                method: "GET",
                headers: buildHeaders(),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load users");

            setUsers(json.users || []);

            const initialDrafts: Record<string, Partial<UserDoc>> = {};
            json.users.forEach((u: UserDoc) => (initialDrafts[u.uid] = { ...u }));
            setDrafts(initialDrafts);
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        } finally {
            setLoadingUsers(false);
        }
    }

    function beginEdit(uid: string) {
        setEditingUid(uid);
        setMessage(null);
    }

    function cancelEdit(uid: string) {
        const original = users.find((u) => u.uid === uid);
        setDrafts((d) => ({ ...d, [uid]: { ...original } }));
        setEditingUid(null);
    }

    function updateDraft(uid: string, partial: Partial<UserDoc>) {
        setDrafts((d) => ({ ...d, [uid]: { ...d[uid], ...partial } }));
    }

    async function saveUser(uid: string) {
        try {
            setMessage({ type: "info", text: "Saving..." });

            const body = drafts[uid];
            const payload: any = { uid };

            if (body.name !== undefined) payload.name = body.name;
            if (body.employeeNumber !== undefined) payload.employeeNumber = body.employeeNumber;
            if (body.role !== undefined) payload.role = body.role;
            if (body.disabled !== undefined) payload.disabled = !!body.disabled;

            if (isSuper && body.domain !== undefined) payload.domain = body.domain;

            const res = await fetch(ADMIN_API, {
                method: "PUT",
                headers: buildHeaders(),
                body: JSON.stringify(payload),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to update user");

            setMessage({ type: "success", text: "User updated" });
            setEditingUid(null);
            loadUsers();
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        }
    }

    async function deleteUser(uid: string) {
        if (!confirm("Delete this user?")) return;

        try {
            setMessage({ type: "info", text: "Deleting..." });

            const res = await fetch(ADMIN_API, {
                method: "DELETE",
                headers: buildHeaders(),
                body: JSON.stringify({ uid }),
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Delete failed");

            setMessage({ type: "success", text: "User deleted" });
            loadUsers();
        } catch (err: any) {
            setMessage({ type: "error", text: err.message });
        }
    }

    if (loading) return <div className="p-6">Loading...</div>;
    if (!user) return <div className="p-6">Not signed in</div>;
    if (profile?.role !== "admin" && profile?.role !== "superadmin")
        return <div className="p-6">Access denied</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-semibold mb-4">User Management</h1>

            {message && (
                <div
                    className={`mb-4 p-3 rounded border ${message.type === "error"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : message.type === "success"
                                ? "bg-green-50 border-green-200 text-green-800"
                                : "bg-blue-50 border-blue-200 text-blue-800"
                        }`}
                >
                    {message.text}
                </div>
            )}

            <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-3 text-left">Email</th>
                            <th className="p-3 text-left">Name</th>
                            <th className="p-3 text-left">Employee #</th>
                            <th className="p-3 text-left">Domain</th>
                            <th className="p-3 text-left">Role</th>
                            <th className="p-3 text-left">Disabled</th>
                            <th className="p-3 text-left">Created At</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loadingUsers ? (
                            <tr><td colSpan={8} className="p-4">Loading users...</td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={8} className="p-4">No users found</td></tr>
                        ) : users.map((u) => {
                            const draft = drafts[u.uid] ?? u;
                            const isEditing = editingUid === u.uid;

                            return (
                                <tr key={u.uid} className="border-t">
                                    <td className="p-3">{u.email}</td>

                                    <td className="p-3">
                                        {isEditing ? (
                                            <input
                                                className="p-1 border rounded w-40"
                                                value={draft.name || ""}
                                                onChange={(e) => updateDraft(u.uid, { name: e.target.value })}
                                            />
                                        ) : (
                                            <span>{u.name || "-"}</span>
                                        )}
                                    </td>

                                    <td className="p-3">
                                        {isEditing ? (
                                            <input
                                                className="p-1 border rounded w-28"
                                                value={draft.employeeNumber || ""}
                                                onChange={(e) => updateDraft(u.uid, { employeeNumber: e.target.value })}
                                            />
                                        ) : (
                                            <span>{u.employeeNumber || "-"}</span>
                                        )}
                                    </td>

                                    <td className="p-3">
                                        {isEditing ? (
                                            <input
                                                className={`p-1 border rounded w-32 ${!isSuper && "opacity-60"}`}
                                                disabled={!isSuper}
                                                value={draft.domain || ""}
                                                onChange={(e) => updateDraft(u.uid, { domain: e.target.value })}
                                            />
                                        ) : (
                                            <span>{u.domain || "-"}</span>
                                        )}
                                    </td>

                                    <td className="p-3">
                                        {isEditing ? (
                                            <select
                                                className="p-1 border rounded"
                                                value={draft.role || "user"}
                                                onChange={(e) => updateDraft(u.uid, { role: e.target.value })}
                                            >
                                                <option value="user">user</option>
                                                <option value="moderator">moderator</option>
                                                <option value="admin">admin</option>
                                                <option value="superadmin">superadmin</option>
                                            </select>
                                        ) : (
                                            <span>{u.role}</span>
                                        )}
                                    </td>

                                    <td className="p-3">
                                        {isEditing ? (
                                            <input
                                                type="checkbox"
                                                checked={!!draft.disabled}
                                                onChange={(e) => updateDraft(u.uid, { disabled: e.target.checked })}
                                            />
                                        ) : (
                                            <input type="checkbox" disabled checked={!!u.disabled} />
                                        )}
                                    </td>

                                    <td className="p-3">
                                        {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                                    </td>

                                    <td className="p-3 flex gap-2">
                                        {isEditing ? (
                                            <>
                                                <button
                                                    onClick={() => saveUser(u.uid)}
                                                    className="px-3 py-1 bg-indigo-600 text-white rounded"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => cancelEdit(u.uid)}
                                                    className="px-3 py-1 border rounded"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => beginEdit(u.uid)}
                                                    className="px-3 py-1 border rounded"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteUser(u.uid)}
                                                    className="px-3 py-1 border rounded text-red-600"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
