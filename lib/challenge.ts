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
  addDoc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Challenge, SuccessLog } from './types';
import { format, addDays, differenceInDays } from 'date-fns';

export const createChallenge = async (userId: string, realName: string): Promise<Challenge> => {
  try {
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

    const challengeData: Omit<Challenge, 'id'> = {
      userId,
      realName,
      startDate: new Date(),
      status: 'active',
      currentDay: 1,
      createdAt: new Date(),
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
    return {
      id: challengeDoc.id,
      ...challengeDoc.data(),
      startDate: challengeDoc.data().startDate.toDate(),
      createdAt: challengeDoc.data().createdAt.toDate(),
    } as Challenge;
  } catch (error) {
    console.error('現在のチャレンジ取得エラー:', error);
    return null;
  }
};

export const reportSuccess = async (challengeId: string, date: string): Promise<void> => {
  try {
    const successLogData: SuccessLog = {
      challengeId,
      date,
      reportedAt: new Date(),
    };

    await setDoc(
      doc(db, 'successLogs', `${challengeId}_${date}`),
      successLogData
    );

    // チャレンジの現在の日数を更新
    const challengeRef = doc(db, 'challenges', challengeId);
    const challengeDoc = await getDoc(challengeRef);
    
    if (challengeDoc.exists()) {
      const challenge = challengeDoc.data() as Challenge;
      const daysSinceStart = differenceInDays(new Date(), challenge.startDate.toDate()) + 1;
      
      await updateDoc(challengeRef, {
        currentDay: daysSinceStart
      });

      // 30日達成チェック
      if (daysSinceStart >= 30) {
        await updateDoc(challengeRef, {
          status: 'completed',
          completedAt: new Date()
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
    const logsQuery = query(
      collection(db, 'successLogs'),
      where('challengeId', '==', challengeId),
      orderBy('date', 'asc')
    );
    
    const logs = await getDocs(logsQuery);
    return logs.docs.map(doc => ({
      ...doc.data(),
      reportedAt: doc.data().reportedAt.toDate(),
    })) as SuccessLog[];
  } catch (error) {
    console.error('成功ログ取得エラー:', error);
    return [];
  }
};

export const generateSuccessReportUrl = (userId: string, challengeId: string, date: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/report-success?userId=${userId}&challengeId=${challengeId}&date=${date}`;
};