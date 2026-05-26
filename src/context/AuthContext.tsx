'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  AuthError,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';
import app from '@/firebase/firebaseConfig';
import { associateLocalReservationsWithUser } from '@/firebase/reservationService';

interface User {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: 'user' | 'admin';
}

interface AuthContextData {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<boolean>;
  loginWithFacebook: () => Promise<boolean>;
  resendVerification: (email: string, password: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextData>({
  user: null,
  firebaseUser: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => false,
  logout: async () => {},
  loginWithGoogle: async () => false,
  loginWithFacebook: async () => false,
  resendVerification: async () => ({ success: false }),
});

const auth = getAuth(app);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Firestore'dan kullanıcı verilerini çek
  const fetchUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser({
          id: uid,
          fullName: userData.fullName || null,
          email: userData.email || null,
          phone: userData.phone || null,
          photoURL: userData.photoURL || null,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
          role: userData.role || 'user',
        });
        
        // Kullanıcı giriş yaptığında localStorage'daki rezervasyonları ilişkilendir
        try {
          await associateLocalReservationsWithUser(uid);
        } catch (error) {
          console.error("Rezervasyonlar ilişkilendirilirken hata:", error);
        }
        
        return true;
      } else {
        console.error('Kullanıcı belgesi bulunamadı.');
        return false;
      }
    } catch (error) {
      console.error('Kullanıcı verileri getirilirken hata oluştu:', error);
      return false;
    }
  };

  // Kullanıcı oturumunu izle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && !currentUser.emailVerified) {
        // If user is not verified, they shouldn't be considered authenticated.
        // We sign them out to maintain security.
        await signOut(auth);
        setFirebaseUser(null);
        setUser(null);
      } else {
        setFirebaseUser(currentUser);
        if (currentUser) {
          await fetchUserData(currentUser.uid);
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Giriş yap
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        // Automatically send a verification email if they haven't verified it yet
        try {
          await sendEmailVerification(userCredential.user);
        } catch (verificationError) {
          console.error("Otomatik doğrulama e-postası gönderme başarısız:", verificationError);
        }
        await signOut(auth);
        
        return { success: false, code: "auth/email-not-verified", error: "E-posta adresiniz doğrulanmadı." };
      }
      
      const success = await fetchUserData(userCredential.user.uid);
      return { success };
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      return { success: false, code: error?.code, error: error?.message };
    }
  };

  // Google ile giriş
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;
      
      // Kullanıcı Firestore'da var mı kontrol et
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        // Yeni kullanıcı oluştur
        await setDoc(doc(db, 'users', uid), {
          fullName: userCredential.user.displayName,
          email: userCredential.user.email,
          photoURL: userCredential.user.photoURL,
          role: 'user',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      
      return await fetchUserData(uid);
    } catch (error) {
      console.error('Google ile giriş hatası:', error);
      return false;
    }
  };

  // Facebook ile giriş
  const loginWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const uid = userCredential.user.uid;
      
      // Kullanıcı Firestore'da var mı kontrol et
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (!userDoc.exists()) {
        // Yeni kullanıcı oluştur
        await setDoc(doc(db, 'users', uid), {
          fullName: userCredential.user.displayName,
          email: userCredential.user.email,
          photoURL: userCredential.user.photoURL,
          role: 'user',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      
      return await fetchUserData(uid);
    } catch (error) {
      console.error('Facebook ile giriş hatası:', error);
      return false;
    }
  };

  // Kayıt ol
  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Kullanıcı profilini güncelle
      await updateProfile(firebaseUser, {
        displayName: name,
      });
      
      // Firestore'a kullanıcı belgesi ekle
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        fullName: name,
        email: email,
        phone: phone || null,
        photoURL: null,
        role: 'user',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      
      // Send verification email
      await sendEmailVerification(firebaseUser);
      
      // Sign out since user is not verified yet
      await signOut(auth);
      
      return true;
    } catch (error) {
      console.error('Kayıt hatası:', error);
      throw error;
    }
  };

  // Yeniden Doğrulama E-postası Gönder
  const resendVerification = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      console.error('Doğrulama e-postası yeniden gönderme hatası:', error);
      try {
        await signOut(auth);
      } catch (e) {}
      return { success: false, error: error?.code || error?.message || "Doğrulama e-postası gönderilemedi." };
    }
  };

  // Çıkış yap
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Çıkış hatası:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        firebaseUser,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithFacebook,
        resendVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 