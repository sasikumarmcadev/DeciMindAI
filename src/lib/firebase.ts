// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "studio-6732716937-f41ae",
  "appId": "1:354757028087:web:0dfdabddf9e417fd204bf2",
  "storageBucket": "studio-6732716937-f41ae.firebasestorage.app",
  "apiKey": "AIzaSyCKclXWE-qTW-3vM3SCHyo4_r2AceeVN4w",
  "authDomain": "studio-6732716937-f41ae.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "354757028087"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Analytics if running in the browser
if (typeof window !== 'undefined') {
  getAnalytics(app);
}
