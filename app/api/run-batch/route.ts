import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { isDevAccount } from '@/lib/dev-utils';
import { format, subDays } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    // リクエストボディからユーザー情報を取得
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ユーザーIDが必要です' },
        { status: 400 }
      );
    }

    // ユーザー情報を取得して開発者アカウントかチェック
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'ユーザーが見つかりません' },
        { status: 404 }
      );
    }

    const user = userDoc.data();
    if (!isDevAccount({ twitterId: user.twitterId, screenName: user.screenName })) {
      return NextResponse.json(
        { success: false, error: '開発者アカウントのみ実行可能です' },
        { status: 403 }
      );
    }

    // バッチ処理を実行
    const result = await executeFailureCheckBatch();
    
    return NextResponse.json({
      success: true,
      message: 'バッチ処理が完了しました',
      result
    });

  } catch (error) {
    console.error('バッチ実行エラー:', error);
    return NextResponse.json(
      { success: false, error: 'バッチ実行中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

async function executeFailureCheckBatch() {
  console.log("Manual failure check batch started");
  
  let processedChallenges = 0;
  let failedChallenges = 0;
  let completedChallenges = 0;
  let errors = 0;

  try {
    // アクティブなチャレンジを取得
    const challengesQuery = query(
      collection(db, 'challenges'),
      where('status', '==', 'active')
    );
    const challengesSnapshot = await getDocs(challengesQuery);

    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

    for (const challengeDoc of challengesSnapshot.docs) {
      const challenge = challengeDoc.data();
      const challengeId = challengeDoc.id;
      processedChallenges++;

      try {
        // 昨日の成功報告があるかチェック
        const successLogDoc = await getDoc(doc(db, 'successLogs', `${challengeId}_${yesterday}`));

        if (!successLogDoc.exists()) {
          // 成功報告がない場合は失敗処理
          await updateDoc(doc(db, 'challenges', challengeId), {
            status: 'failed',
            failedAt: new Date(),
          });
          
          failedChallenges++;
          console.log(`Challenge ${challengeId} marked as failed`);
        } else {
          // 成功報告がある場合、30日完了チェック
          const startDate = challenge.startDate.toDate();
          const today = new Date();
          const timeDiff = today.getTime() - startDate.getTime();
          const currentDay = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

          if (currentDay >= 30) {
            // 30日達成！
            await updateDoc(doc(db, 'challenges', challengeId), {
              status: 'completed',
              completedAt: new Date(),
            });
            
            completedChallenges++;
            console.log(`Challenge ${challengeId} completed`);
          }
        }
      } catch (error) {
        console.error(`Error processing challenge ${challengeId}:`, error);
        errors++;
      }
    }

    console.log("Manual failure check batch completed");
    
    return {
      processedChallenges,
      failedChallenges,
      completedChallenges,
      errors,
      executedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error("Error in manual failure check batch:", error);
    throw error;
  }
}