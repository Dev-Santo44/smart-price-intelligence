// lib/firebaseAdmin.ts
// SIMPLE firebase-admin setup for Firestore-only use

import * as admin from "firebase-admin";

if (!admin.apps.length) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!serviceAccountJson) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is missing in .env.local");
    }

    const serviceAccount = JSON.parse(serviceAccountJson.replace(/\\n/g, "\n"));

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
        // No databaseURL needed (Firestore only)
    });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
