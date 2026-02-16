import admin from "firebase-admin";

let isInitialized = false;

const getServiceAccountFromEnv = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env vars. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  return {
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  };
};

const ensureInitialized = () => {
  if (isInitialized || admin.apps.length) {
    isInitialized = true;
    return;
  }

  admin.initializeApp({
    credential: admin.credential.cert(getServiceAccountFromEnv()),
  });

  isInitialized = true;
};

export const getAuth = () => {
  ensureInitialized();
  return admin.auth();
};

export const getFirestore = () => {
  ensureInitialized();
  return admin.firestore();
};
