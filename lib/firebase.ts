// lib/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, TwitterAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase アプリの初期化
// Firebase App Hosting は FIREBASE_WEBAPP_CONFIG を自動で提供するので、
// initializeApp() に引数を渡さなくても自動的に設定を読み込む。
// ローカル開発用に環境変数を設定していない場合、ここでエラーになる可能性がある。
const app = getApps().length === 0 ? initializeApp() : getApps()[0];

// 各サービスを初期化
const auth = getAuth(app);
const db = getFirestore(app);
const twitterProvider = new TwitterAuthProvider();

// サービスをエクスポート
export { app, auth, db, twitterProvider };

// 必要に応じて、個別の取得関数も保持
export const getFirebaseAuth = () => auth;
export const getFirebaseDb = () => db;
export const getTwitterProvider = () => twitterProvider;