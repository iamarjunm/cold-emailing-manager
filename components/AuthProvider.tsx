'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2, LogIn } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  logOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      // Force custom parameter to sometimes help with popup issues
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Error signing in', error);
      if (error.code === 'auth/popup-blocked') {
        setError('Popup blocked by your browser. Please allow popups for this site or open the app in a new tab.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        setError('Sign-in popup was closed before completion. Please try again.');
      } else {
        setError(error.message || 'An error occurred during sign in.');
      }
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAFAFA] p-4">
        <div className="bg-white border border-gray-200 rounded-xl p-8 max-w-sm w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-display font-semibold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-sm mb-6">Sign in to manage your cold email campaigns securely.</p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg text-left">
              {error}
            </div>
          )}
          
          <button 
            onClick={signIn}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Sign in with Google
          </button>
          
          {error && error.includes('Popup blocked') && (
            <p className="mt-4 text-xs text-gray-500">
              Note: If you are viewing this in a preview window, you may need to click the &quot;Open in new tab&quot; icon at the top right of the preview pane.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
