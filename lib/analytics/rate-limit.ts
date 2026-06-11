import { FieldValue } from "firebase-admin/firestore";
import {
  getPortfolioAdminDb,
  isFirebaseAdminConfigured,
} from "./firebase-admin";

// In-memory fallback is per-instance only (not shared across serverless instances).
const inMemoryStore = new Map<string, { count: number; windowStart: number }>();
const IN_MEMORY_LIMIT = 20;
const IN_MEMORY_WINDOW_MS = 24 * 60 * 60 * 1000;

function inMemoryRateLimit(sessionId: string): {
  blocked: boolean;
  message?: string;
} {
  const now = Date.now();
  const record = inMemoryStore.get(sessionId);

  if (!record || now - record.windowStart > IN_MEMORY_WINDOW_MS) {
    inMemoryStore.set(sessionId, { count: 1, windowStart: now });
    return { blocked: false };
  }

  if (record.count >= IN_MEMORY_LIMIT) {
    return { blocked: true, message: "SESSION_LIMIT_REACHED" };
  }

  record.count++;
  return { blocked: false };
}

export async function checkRateLimit(
  sessionId: string,
): Promise<{ blocked: boolean; message?: string }> {
  if (!isFirebaseAdminConfigured()) {
    return inMemoryRateLimit(sessionId);
  }

  try {
    const db = getPortfolioAdminDb();
    const docRef = db.collection("rate_limits").doc(sessionId);
    const docSnap = await docRef.get();
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const LIMIT = 20;

    if (!docSnap.exists) {
      await docRef.set({
        count: 1,
        windowStart: now,
        lastSeen: now,
      });
      return { blocked: false };
    }

    const data = docSnap.data();
    if (!data) {
      return { blocked: false };
    }
    const windowStart = data.windowStart || now;

    if (now - windowStart > TWENTY_FOUR_HOURS) {
      await docRef.update({
        count: 1,
        windowStart: now,
        lastSeen: now,
      });
      return { blocked: false };
    }

    if (data.count >= LIMIT) {
      return {
        blocked: true,
        message: "SESSION_LIMIT_REACHED",
      };
    }

    await docRef.update({
      count: FieldValue.increment(1),
      lastSeen: now,
    });
    return { blocked: false };
  } catch (error: any) {
    // Handle gRPC NOT_FOUND error (code 5) which can happen if the database/collection doesn't exist
    if (error?.code === 5 || error?.message?.includes("NOT_FOUND")) {
      return inMemoryRateLimit(sessionId);
    }
    console.error("Rate limit check error:", error);
    return { blocked: false };
  }
}
