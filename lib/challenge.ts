// lib/challenge.ts

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { Challenge, SuccessLog } from './types'; // types.tsからChallengeとSuccessLogをインポート
import { differenceInDays } from 'date-fns'; // date-fnsはそのまま使用します
import { getDevDate } from './dev-utils';

export const createChallenge = async (userId: string, realName: string): Promise<Challenge> => {
  try {
    const db = getFirebaseDb();
    // 既存のアクティブなチャレンジがないかチェック
    const existingChallengeQuery = query(
      collection(db, 'challenges'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      limit(1)
    );

    const existingChallenges = await getDocs(existingChallengeQuery);
    if (!existingChallenges.empty) {
      throw new Error('既にアクティブなチャレンジが存在します');
    }

    // Firestoreに保存するデータ
    const challengeData = {
      userId,
      realName,
      startDate: getDevDate(),
      status: 'active' as const,
      currentDay: 1,
      createdAt: getDevDate(),
    };

    const docRef = await addDoc(collection(db, 'challenges'), challengeData);

    return {
      id: docRef.id,
      ...challengeData,
    };
  } catch (error) {
    console.error('チャレンジ作成エラー:', error);
    throw error;
  }
};

export const getCurrentChallenge = async (userId: string): Promise<Challenge | null> => {
  try {
    const db = getFirebaseDb();
    const challengeQuery = query(
      collection(db, 'challenges'),
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const challenges = await getDocs(challengeQuery);
    if (challenges.empty) {
      return null;
    }

    const challengeDoc = challenges.docs[0];
    const data = challengeDoc.data();

    return {
      id: challengeDoc.id,
      ...data,
      startDate: data.startDate instanceof Timestamp ? data.startDate.toDate() : data.startDate,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
    } as Challenge;
  } catch (error) {
    console.error('現在のチャレンジ取得エラー:', error);
    return null;
  }
};

export const reportSuccess = async (challengeId: string, userId: string, date: string): Promise<void> => {
  try {
    const db = getFirebaseDb();
    const successLogData: SuccessLog = {
      challengeId,
      userId,
      date,
      reportedAt: getDevDate(),
    };

    await setDoc(
      doc(db, 'successLogs', `${challengeId}_${date}`),
      successLogData
    );

    // チャレンジの現在の日数を更新
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);

    if (challengeDoc.exists()) {
      const challengeDataFromFirestore = challengeDoc.data();
      const startDate = challengeDataFromFirestore.startDate instanceof Timestamp 
        ? challengeDataFromFirestore.startDate.toDate() 
        : challengeDataFromFirestore.startDate;
      const daysSinceStart = differenceInDays(getDevDate(), startDate) + 1;

      await updateDoc(challengeRef, {
        currentDay: daysSinceStart
      });

      // 30日達成チェック
      if (daysSinceStart >= 30) {
        await updateDoc(challengeRef, {
          status: 'completed',
          completedAt: getDevDate()
        });
      }
    }
  } catch (error) {
    console.error('成功報告エラー:', error);
    throw error;
  }
};

export const getSuccessLogs = async (challengeId: string): Promise<SuccessLog[]> => {
  try {
    const db = getFirebaseDb();
    const logsQuery = query(
      collection(db, 'successLogs'),
      where('challengeId', '==', challengeId),
      orderBy('date', 'asc')
    );

    const logs = await getDocs(logsQuery);
    return logs.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        reportedAt: data.reportedAt instanceof Timestamp ? data.reportedAt.toDate() : data.reportedAt,
      };
    }) as SuccessLog[];
  } catch (error) {
    console.error('成功ログ取得エラー:', error);
    return [];
  }
};

export const generateSuccessReportUrl = (userId: string, challengeId: string, date: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/report-success?userId=${userId}&challengeId=${challengeId}&date=${date}`;
};