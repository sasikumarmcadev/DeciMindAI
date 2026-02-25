'use client';

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

let popupInProgress = false;

export async function signInWithGoogle(): Promise<{ user?: User, error?: string }> {
  if (popupInProgress) {
    return { error: 'The sign-in process was canceled.' };
  }
  const provider = new GoogleAuthProvider();
  try {
    popupInProgress = true;
    const result = await signInWithPopup(auth, provider);
    return { user: result.user };
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      return { error: 'The sign-in process was canceled.' };
    }
    if (error.code === 'auth/popup-blocked') {
      return { error: 'The popup was blocked by your browser. Please allow popups and try again.' };
    }
    return { error: (error as Error).message };
  } finally {
    popupInProgress = false;
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
