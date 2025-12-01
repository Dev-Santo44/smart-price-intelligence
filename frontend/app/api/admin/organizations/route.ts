// app/api/admin/organizations/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { db } from "@/lib/firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";

function json(data: any, status = 200) {
    return NextResponse.json(data, { status });
}

// SIMPLE HEADER-BASED ADMIN VERIFY
function verify(request: Request) {
    const role = request.headers.get("x-user-role");
    const uid = request.headers.get("x-user-uid");
    const domain = request.headers.get("x-user-domain");

    if (!uid || !role) {
        return { ok: false, status: 401, message: "Not authenticated" };
    }

    // ❗ ONLY superadmin can change organization details
    if (role !== "superadmin") {
        return { ok: false, status: 403, message: "Superadmin role required" };
    }

    return { ok: true, requester: { uid, role, domain } };
}

/* -----------------------------------------------------------------
   PUT → Set or update organization admin
   Body: { domainId, adminUid }
------------------------------------------------------------------- */
export async function PUT(request: Request) {
    const v = verify(request);
    if (!v.ok) return json({ error: v.message }, v.status);

    try {
        const { domainId, adminUid } = await request.json();

        if (!domainId || !adminUid) {
            return json({ error: "domainId and adminUid required" }, 400);
        }

        const ref = doc(db, "organizations", domainId);

        // Check if org exists
        const orgSnap = await getDoc(ref);

        // Build update object
        const data = {
            adminUid,
            domain: domainId,
            updatedAt: new Date().toISOString(),
            createdAt: orgSnap.exists()
                ? orgSnap.data().createdAt
                : new Date().toISOString(),
        };

        await setDoc(ref, data, { merge: true });

        return json({ message: "Organization updated", payload: data }, 200);
    } catch (err: any) {
        console.error("PUT /admin/organizations error:", err);
        return json({ error: err.message || "Failed to update organization" }, 500);
    }
}

/* -----------------------------------------------------------------
   GET → Get organization details
------------------------------------------------------------------- */
export async function GET(request: Request) {
    const v = verify(request);
    if (!v.ok) return json({ error: v.message }, v.status);

    const url = new URL(request.url);
    const domainId = url.searchParams.get("domainId");

    if (!domainId)
        return json({ error: "domainId query param required" }, 400);

    try {
        const ref = doc(db, "organizations", domainId);
        const snap = await getDoc(ref);

        if (!snap.exists())
            return json({ error: "Organization not found" }, 404);

        return json({ organization: snap.data() });
    } catch (err: any) {
        console.error("GET /admin/organizations error:", err);
        return json({ error: err.message || "Failed to load organization" }, 500);
    }
}
