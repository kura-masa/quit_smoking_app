import { signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, twitterProvider, db } from './firebase';
import { User } from './types';

export const signInWithTwitter = async (): Promise<User | null> => {
  try {
    const result = await signInWithPopup(auth, twitterProvider);
    const credential = result.credential;
    const user = result.user;

    if (!credential || !user) {
      throw new Error('認証に失敗しました');
    }

    // Twitter認証情報を取得
    const accessToken = (credential as any).accessToken;
    const secret = (credential as any).secret;

    // ユーザー情報を構築
    const userData: User = {
      uid: user.uid,
      twitterId: user.providerData[0]?.uid || '',
      screenName: user.displayName?.replace(/\s/g, '') || '',
      displayName: user.displayName || '',
      profileImageUrl: user.photoURL || '',
      accessToken,
      accessTokenSecret: secret,
      createdAt: new Date(),
    };

    // Firestoreにユーザー情報を保存
    await setDoc(doc(db, 'users', user.uid), userData, { merge: true });

    return userData;
  } catch (error) {
    console.error('Twitter認証エラー:', error);
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('サインアウトエラー:', error);
    throw error;
  }
};

export const getCurrentUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    return null;
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    return null;
  }
};