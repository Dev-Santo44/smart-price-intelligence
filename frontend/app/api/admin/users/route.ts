// app/api/admin/users/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
    collection,
    query,
    orderBy,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    setDoc,
} from "firebase/firestore";

/** Helper JSON response */
function json(payload: any, status = 200) {
    return NextResponse.json(payload, { status });
}

/** Read simple header-based auth coming from client AuthProvider */
function verifyHeaders(request: Request):
    | { ok: true; requester: { uid: string; role: string; domain: string; email: string } }
    | { ok: false; status: number; message: string } {
    const uid = request.headers.get("x-user-uid") || "";
    const role = request.headers.get("x-user-role") || "";
    const domain = request.headers.get("x-user-domain") || "";
    const email = request.headers.get("x-user-email") || "";

    if (!uid || !role) {
        return { ok: false, status: 401, message: "Not authenticated (missing headers)" };
    }

    // Only admin or superadmin allowed
    if (role !== "admin" && role !== "superadmin") {
        return { ok: false, status: 403, message: "Admin role required" };
    }

    return { ok: true, requester: { uid, role, domain, email } };
}

/* -------------------------------
   GET /api/admin/users
   Query params:
     - limit (optional)
     - q (search, optional)
---------------------------------*/
export async function GET(request: Request) {
    const v = verifyHeaders(request);
    if (!v.ok) return json({ error: v.message }, v.status);

    const { requester } = v;
    try {
        const url = new URL(request.url);
        const limitParam = Number(url.searchParams.get("limit") || "100");
        const limit = Number.isFinite(limitParam) ? Math.min(500, Math.max(1, limitParam)) : 100;
        const q = (url.searchParams.get("q") || "").trim().toLowerCase();

        const usersQ = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const snap = await getDocs(usersQ);

        let users = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
                uid: d.id,
                email: data.email || null,
                name: data.name || null,
                role: data.role || "user",
                domain: data.domain || null,
                employeeNumber: data.employeeNumber || null,
                disabled: !!data.disabled,
                createdAt: data.createdAt || null,
            };
        });

        // domain scoping for normal admin
        if (requester.role === "admin") {
            users = users.filter((u) => (u.domain || "") === (requester.domain || ""));
        }

        // naive search
        if (q) {
            users = users.filter((u) =>
                (u.email || "").toLowerCase().includes(q) ||
                (u.name || "").toLowerCase().includes(q) ||
                (u.employeeNumber || "").toLowerCase().includes(q) ||
                (u.domain || "").toLowerCase().includes(q)
            );
        }

        // apply limit
        users = users.slice(0, limit);

        return json({ users }, 200);
    } catch (err: any) {
        console.error("GET /api/admin/users error:", err);
        return json({ error: err.message || "Failed to load users" }, 500);
    }
}

/* -------------------------------
   POST /api/admin/users
   Create or upsert a Firestore user doc (does NOT create Auth user)
   Body params: { uid, email, name?, role?, employeeNumber?, domain?, createdAt? }
---------------------------------*/
export async function POST(request: Request) {
    const v = verifyHeaders(request);
    if (!v.ok) return json({ error: v.message }, v.status);

    const { requester } = v;

    try {
        const body = await request.json();
        const uid = body.uid;
        const email = body.email;
        if (!uid || !email) return json({ error: "uid and email required" }, 400);

        // If caller is admin (not superadmin), force same domain
        const domainToSet = requester.role === "superadmin" ? (body.domain || "") : requester.domain || "";

        const docRef = doc(db, "users", uid);
        const now = new Date().toISOString();

        const payload = {
            uid,
            email,
            name: body.name || "",
            role: body.role || "user",
            employeeNumber: body.employeeNumber || "",
            domain: domainToSet,
            createdAt: body.createdAt || now,
            disabled: !!body.disabled,
        };

        await setDoc(docRef, payload, { merge: true });

        return json({ message: "User created/updated", uid }, 201);
    } catch (err: any) {
        console.error("POST /api/admin/users error:", err);
        return json({ error: err.message || "Create failed" }, 500);
    }
}

/* -------------------------------
   PUT /api/admin/users
   Update existing user fields
   Body: { uid, name?, employeeNumber?, role?, domain?, disabled? }
---------------------------------*/
export async function PUT(request: Request) {
    const v = verifyHeaders(request);
    if (!v.ok) return json({ error: v.message }, v.status);

    const { requester } = v;

    try {
        const body = await request.json();
        const uid = body.uid;
        if (!uid) return json({ error: "uid required" }, 400);

        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return json({ error: "User not found" }, 404);
        const target = snap.data() as any;

        // domain restriction for normal admin
        if (requester.role === "admin" && (target.domain || "") !== (requester.domain || "")) {
            return json({ error: "Not allowed to modify user in another domain" }, 403);
        }

        const updates: any = {};
        if (typeof body.name !== "undefined") updates.name = body.name;
        if (typeof body.employeeNumber !== "undefined") updates.employeeNumber = body.employeeNumber;
        if (typeof body.role !== "undefined") updates.role = body.role;
        if (typeof body.disabled !== "undefined") updates.disabled = !!body.disabled;

        // domain change only allowed for superadmin
        if (typeof body.domain !== "undefined") {
            if (requester.role !== "superadmin") {
                return json({ error: "Only superadmin can change domain" }, 403);
            } else {
                updates.domain = body.domain;
            }
        }

        if (Object.keys(updates).length === 0) {
            return json({ message: "Nothing to update" }, 200);
        }

        await updateDoc(ref, updates);

        return json({ message: "User updated" }, 200);
    } catch (err: any) {
        console.error("PUT /api/admin/users error:", err);
        return json({ error: err.message || "Update failed" }, 500);
    }
}

/* -------------------------------
   DELETE /api/admin/users
   Body: { uid }
---------------------------------*/
export async function DELETE(request: Request) {
    const v = verifyHeaders(request);
    if (!v.ok) return json({ error: v.message }, v.status);

    const { requester } = v;

    try {
        const body = await request.json();
        const uid = body.uid;
        if (!uid) return json({ error: "uid required" }, 400);

        const ref = doc(db, "users", uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return json({ error: "User not found" }, 404);
        const target = snap.data() as any;

        if (requester.role === "admin" && (target.domain || "") !== (requester.domain || "")) {
            return json({ error: "Not allowed to delete user in another domain" }, 403);
        }

        await deleteDoc(ref);

        return json({ message: "User deleted" }, 200);
    } catch (err: any) {
        console.error("DELETE /api/admin/users error:", err);
        return json({ error: err.message || "Delete failed" }, 500);
    }
}
