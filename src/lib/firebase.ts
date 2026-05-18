import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);
auth.useDeviceLanguage(); // Set language to Arabic by default if possible
export const googleProvider = new GoogleAuthProvider();

// Test connection
async function testConnection() {
  try {
    // Try to reach the server to verify configuration
    // Using a more generic doc path
    await getDocFromServer(doc(db, '_connection_test_', 'ping'));
    console.log("Firebase connection successful");
  } catch (error: any) {
    // If we get permission-denied, it means the connection is actually WORKING 
    // but we just don't have access to this specific test path (which is expected)
    if (error?.code === 'permission-denied') {
      console.log("Firebase connection verified (Server reachable)");
      return;
    }

    console.error("Firebase connection test failed:", error);
    
    // Check for common connectivity issues
    const errorMessage = error?.message?.toLowerCase() || '';
    const isOffline = errorMessage.includes('offline') || 
                      error?.code === 'unavailable' ||
                      errorMessage.includes('could not reach') ||
                      errorMessage.includes('backend didn\'t respond');
                      
    if (isOffline) {
      console.error("CRITICAL: Firestore backend unreachable. This might be a network/proxy issue.");
    }
  }
}
testConnection();

let isLoggingIn = false;

export const loginWithGoogle = async () => {
  if (isLoggingIn) return;
  isLoggingIn = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.code === 'auth/popup-blocked') {
      alert('تم حظر النافذة المنبثقة! يرجى السماح بالنوافذ المنبثقة لهذا الموقع أو فتح التطبيق في نافذة جديدة.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.log('طلب تسجيل الدخول ملغى بسبب وجود طلب آخر.');
    } else {
      alert('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    }
  } finally {
    isLoggingIn = false;
  }
};
export const logout = () => signOut(auth);
