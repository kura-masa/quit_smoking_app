import { signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser, TwitterAuthProvider } from 'firebase/auth'; // TwitterAuthProvider をインポート
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, twitterProvider, db } from './firebase';
import { User } from './types';

export const signInWithTwitter = async (): Promise<User | null> => {
  try {
    console.log('Twitter認証を開始...');
    const result = await signInWithPopup(auth, twitterProvider);
    console.log('認証結果:', result);

    const twitterCredential = TwitterAuthProvider.credentialFromResult(result);
    const user = result.user;

    console.log('Twitter credential:', twitterCredential);
    console.log('User:', user);

    if (!user) {
      throw new Error('ユーザー情報の取得に失敗しました');
    }

    // Twitter認証情報を取得（credentialがnullの場合もあるため、デフォルト値を設定）
    const accessToken = twitterCredential?.accessToken || '';
    const secret = twitterCredential?.secret || '';

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
  } catch (error: any) {
    console.error('Twitter認証エラー:', error);
    
    // エラーの詳細情報をログ出力
    if (error.code) {
      console.error('エラーコード:', error.code);
    }
    if (error.message) {
      console.error('エラーメッセージ:', error.message);
    }
    
    // より具体的なエラーメッセージを提供
    let userFriendlyMessage = 'Twitter認証に失敗しました。';
    
    switch (error.code) {
      case 'auth/invalid-credential':
        userFriendlyMessage = 'Twitter認証の設定に問題があります。Firebase ConsoleでTwitter認証が正しく設定されているか確認してください。';
        break;
      case 'auth/popup-closed-by-user':
        userFriendlyMessage = '認証がキャンセルされました。';
        break;
      case 'auth/popup-blocked':
        userFriendlyMessage = 'ポップアップがブロックされました。ブラウザの設定を確認してください。';
        break;
      case 'auth/cancelled-popup-request':
        userFriendlyMessage = '認証リクエストがキャンセルされました。';
        break;
      default:
        userFriendlyMessage = `認証エラー: ${error.message || '不明なエラーが発生しました'}`;
    }
    
    throw new Error(userFriendlyMessage);
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