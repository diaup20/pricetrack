import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  userData: any | null;
  updateUserData: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  isAdmin: false, 
  loading: true,
  userData: null,
  updateUserData: async () => {} 
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any | null>(null);

  const updateUserData = async (data: any) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    setUserData((prev: any) => ({ ...prev, ...data }));
  };

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          let currentData = userSnap.exists() ? userSnap.data() : null;

          // Initial profile save or update
          const initialData = {
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            lastLogin: serverTimestamp()
          };

          await setDoc(userRef, initialData, { merge: true });
          
          // Re-fetch to get merged data including preferences
          const updatedSnap = await getDoc(userRef);
          setUserData(updatedSnap.data());

          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          const isEmailAdmin = user.email === 'abdsharki20@gmail.com';
          setIsAdmin(adminDoc.exists() || isEmailAdmin);
        } catch (error) {
          console.error("Error updating user profile in Firestore:", error);
          const isEmailAdmin = user.email === 'abdsharki20@gmail.com';
          setIsAdmin(isEmailAdmin);
        }
      } else {
        setIsAdmin(false);
        setUserData(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, userData, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
