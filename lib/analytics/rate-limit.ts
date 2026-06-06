import { FieldValue } from "firebase-admin/firestore";
import {
  getPortfolioAdminDb,
  isFirebaseAdminConfigured,
} from "./firebase-admin";

export async function checkRateLimit(
  ip: string,
): Promise<{ blocked: boolean; message?: string }> {
  if (!isFirebaseAdminConfigured()) {
    return { blocked: false };
  }

  try {
    const db = getPortfolioAdminDb();
    const docRef = db.collection("rate_limits").doc(ip);
    const docSnap = await docRef.get();
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    const LIMIT = 10;

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
        message:
          "Daily message limit (10) exceeded. Please try again in 24 hours.",
      };
    }

    await docRef.update({
      count: FieldValue.increment(1),
      lastSeen: now,
    });
    return { blocked: false };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return { blocked: false };
  }
}
