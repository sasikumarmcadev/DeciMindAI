'use client';

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export async function signInWithGoogle(): Promise<{ user?: User, error?: string }> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return { user: result.user };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      return { error: 'The sign-in process was canceled.' };
    }
    return { error: (error as Error).message };
  }
}

export async function signOut(): Promise<{ success?: boolean, error?: string }> {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
