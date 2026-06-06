import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const portfolioDbId = process.env.FIREBASE_PORTFOLIO_DB_ID || "ai-portfolio";

function hasSplitServiceAccountEnv(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY,
  );
}

export function isFirebaseAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON ||
    hasSplitServiceAccountEnv(),
  );
}

function getServiceAccount(): ServiceAccount {
  const json = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;
  if (json) {
    const parsed = JSON.parse(json) as ServiceAccount & {
      private_key?: string;
    };
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    return parsed;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "FIREBASE_PRIVATE_KEY environment variable is not set. Cannot configure Firebase Admin.",
    );
  }
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
}

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (!isFirebaseAdminConfigured()) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON or FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY.",
    );
  }

  return initializeApp({
    credential: cert(getServiceAccount()),
  });
}

export function getPortfolioAdminDb() {
  return getFirestore(getAdminApp(), portfolioDbId);
}
