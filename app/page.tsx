'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
// Firebase auth will be imported dynamically in useEffect
import { getCurrentUser, signInWithTwitter } from '@/lib/auth';
import { User } from '@/lib/types';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // テスト用ユーザーチェック
    const testUser = localStorage.getItem('testUser');
    if (testUser) {
      setUser(JSON.parse(testUser));
      setLoading(false);
      return;
    }

    // Dynamically import Firebase auth to avoid build-time initialization
    let unsubscribe: (() => void) | undefined;
    
    const initAuth = async () => {
      try {
        const { getFirebaseAuth } = await import('@/lib/firebase');
        const auth = getFirebaseAuth();
        
        if (!auth) {
          throw new Error('Firebase Auth initialization failed');
        }
        
        unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          setFirebaseUser(firebaseUser);
          
          if (firebaseUser) {
            try {
              const userData = await getCurrentUser(firebaseUser);
              setUser(userData);
            } catch (error) {
              console.error('ユーザー情報取得エラー:', error);
              setError('ユーザー情報の取得に失敗しました');
            }
          } else {
            setUser(null);
          }
          
          setLoading(false);
        });
      } catch (error) {
        console.error('Firebase初期化エラー:', error);
        setError('Firebase初期化に失敗しました。設定を確認してください。');
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await signInWithTwitter();
      setUser(userData);
    } catch (error: any) {
      console.error('サインインエラー:', error);
      setError(error.message || 'サインインに失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">認証エラー</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(false);
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onSignIn={handleSignIn} />;
  }

  return <Dashboard user={user} />;
}