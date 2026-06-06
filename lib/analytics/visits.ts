import { FieldValue } from "firebase-admin/firestore";
import { getPortfolioAdminDb, isFirebaseAdminConfigured } from "./firebase-admin";
import { getVisitDedupDocId } from "./request-ip";

export async function incrementVisitCount(
  ip = "unknown-ip",
): Promise<{ ok: boolean; duplicate?: boolean; mode?: string }> {
  if (!isFirebaseAdminConfigured()) {
    return { ok: false };
  }

  const dateKey = new Date().toISOString().slice(0, 10);
  const dedupId = getVisitDedupDocId(ip, dateKey);

  try {
    const db = getPortfolioAdminDb();
    const dedupRef = db.collection("visit_deduplication").doc(dedupId);
    const statsRef = db.collection("analytics").doc("site_stats");

    const result = await db.runTransaction(async (tx) => {
      const dedupSnap = await tx.get(dedupRef);
      if (dedupSnap.exists) {
        return { ok: false, duplicate: true };
      }

      tx.set(dedupRef, {
        ip,
        dateKey,
        createdAt: FieldValue.serverTimestamp(),
      });

      tx.set(
        statsRef,
        {
          visits: FieldValue.increment(1),
          daily: { [dateKey]: FieldValue.increment(1) },
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      return { ok: true, mode: "admin" as const };
    });

    return result;
  } catch (error) {
    console.error("Visit increment failed:", error);
    return { ok: false };
  }
}

export async function getVisitCount(): Promise<number | null> {
  if (!isFirebaseAdminConfigured()) {
    return null;
  }

  try {
    const db = getPortfolioAdminDb();
    const snap = await db.collection("analytics").doc("site_stats").get();
    if (!snap.exists) return 0;
    return snap.data()?.visits ?? 0;
  } catch (error) {
    console.error("Error fetching visit count:", error);
    return null;
  }
}
