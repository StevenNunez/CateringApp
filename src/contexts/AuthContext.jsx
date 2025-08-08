
import { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUser({ ...currentUser, role: userDoc.data().role || 'user' });
        } else {
          setUser({ ...currentUser, role: 'user' });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        setUser({ ...userCredential.user, role: userDoc.data().role || 'user' });
      } else {
        setUser({ ...userCredential.user, role: 'user' });
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name,
        role: 'user',
        createdAt: new Date(),
      });
      setUser({ ...userCredential.user, role: 'user' });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const getIdToken = async () => {
    if (!user) return null;
    return await auth.currentUser.getIdToken(true);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, getIdToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};