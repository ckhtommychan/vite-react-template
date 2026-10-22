import { getApps, initializeApp } from "firebase/app";
import {
	browserLocalPersistence,
	getAuth,
	GoogleAuthProvider,
	onAuthStateChanged,
	setPersistence,
	signInWithPopup,
	signOut as firebaseSignOut,
} from "firebase/auth";
import type { Auth, User } from "firebase/auth";

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseConfigured = Boolean(
	firebaseConfig.apiKey &&
		firebaseConfig.authDomain &&
		firebaseConfig.projectId &&
		firebaseConfig.appId,
);

let authInstance: Auth | null = null;

if (firebaseConfigured) {
	const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
	authInstance = getAuth(app);
	void setPersistence(authInstance, browserLocalPersistence).catch(() => undefined);
}

export async function signInWithGoogle(): Promise<User> {
	if (!authInstance) {
		throw new Error("Firebase 尚未設定，請設定 VITE_FIREBASE_* 環境變數。");
	}
	const provider = new GoogleAuthProvider();
	provider.setCustomParameters({ prompt: "select_account" });
	const result = await signInWithPopup(authInstance, provider);
	return result.user;
}

export async function signOutGoogle(): Promise<void> {
	if (authInstance) await firebaseSignOut(authInstance);
}

export function watchAuth(callback: (user: User | null) => void): () => void {
	if (!authInstance) {
		callback(null);
		return () => undefined;
	}
	return onAuthStateChanged(authInstance, callback);
}
