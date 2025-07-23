'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Trophy, Sparkles } from 'lucide-react';
import { reportSuccess, getCurrentChallenge } from '@/lib/challenge';
import { Challenge } from '@/lib/types';
import Button from '@/components/ui/Button';
import ConfettiAnimation from '@/components/ui/ConfettiAnimation';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

function ReportSuccessPageContent() {
  const searchParams = useSearchParams();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userId = searchParams.get('userId');
  const challengeId = searchParams.get('challengeId');
  const date = searchParams.get('date');

  useEffect(() => {
    if (userId && challengeId && date) {
      loadChallenge();
    } else {
      setError('無効なURLです');
      setLoading(false);
    }
  }, [userId, challengeId, date]);

  const loadChallenge = async () => {
    try {
      if (!userId) return;
      
      const currentChallenge = await getCurrentChallenge(userId);
      if (!currentChallenge || currentChallenge.id !== challengeId) {
        setError('チャレンジが見つかりません');
        return;
      }
      
      setChallenge(currentChallenge);
    } catch (error) {
      console.error('チャレンジ読み込みエラー:', error);
      setError('チャレンジの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleReportSuccess = async () => {
    if (!challengeId || !date) return;

    try {
      setReporting(true);
      await reportSuccess(challengeId, userId!, date);
      setReported(true);
      setShowConfetti(true);
      
      // Reload challenge to get updated data
      await loadChallenge();
    } catch (error) {
      console.error('成功報告エラー:', error);
      alert('報告の送信に失敗しました。もう一度お試しください。');
    } finally {
      setReporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">エラー</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.href = '/'}>
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🤔</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">チャレンジが見つかりません</h1>
          <p className="text-gray-600 mb-6">
            指定されたチャレンジが存在しないか、既に終了している可能性があります。
          </p>
          <Button onClick={() => window.location.href = '/'}>
            ホームに戻る
          </Button>
        </div>
      </div>
    );
  }

  const today = new Date();
  const formattedDate = format(today, 'yyyy年MM月dd日', { locale: ja });

  return (
    <div className="min-h-screen bg-gradient-to-br from-success-50 to-primary-50">
      <ConfettiAnimation isActive={showConfetti} />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {!reported ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Calendar className="w-12 h-12 text-success-600" />
              </motion.div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                今日の禁煙報告
              </h1>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-lg text-gray-700 mb-2">
                  <span className="font-semibold">{formattedDate}</span>
                </p>
                <p className="text-gray-600">
                  チャレンジ {challenge.currentDay}日目
                </p>
              </div>

              <p className="text-lg text-gray-700 mb-8">
                今日も禁煙を続けることができましたか？<br />
                下のボタンを押して成功を報告しましょう！
              </p>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleReportSuccess}
                  isLoading={reporting}
                  size="lg"
                  variant="success"
                  className="w-full text-xl py-4"
                >
                  <CheckCircle className="w-6 h-6 mr-3" />
                  今日の禁煙も成功！
                </Button>
              </motion.div>

              <div className="mt-6 text-sm text-gray-500">
                <p>※ 報告は1日1回のみ可能です</p>
                <p>※ 翌日午前4時までに報告がない場合、自動的に失敗となります</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-xl p-8 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Trophy className="w-12 h-12 text-success-600" />
              </motion.div>

              <h1 className="text-3xl font-bold text-success-600 mb-4">
                報告ありがとう！
              </h1>
              
              <div className="bg-success-50 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-success-600 mr-2" />
                  <span className="text-lg font-semibold text-success-700">
                    {challenge.currentDay}日目達成！
                  </span>
                </div>
                <p className="text-success-700">
                  素晴らしい継続力です！この調子で頑張りましょう！
                </p>
              </div>

              <div className="space-y-4 text-gray-700">
                <p className="text-lg">
                  明日も禁煙を続けて、さらなる記録を目指しましょう！
                </p>
                <p className="text-sm">
                  明日の朝8時にリマインダーをお送りします。
                </p>
              </div>

              <div className="mt-8">
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="primary"
                  size="lg"
                >
                  ダッシュボードに戻る
                </Button>
              </div>

              {/* Progress indicator */}
              <div className="mt-8 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>進捗</span>
                  <span>{challenge.currentDay}/30日</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(challenge.currentDay / 30) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-success-600 h-2 rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ReportSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    }>
      <ReportSuccessPageContent />
    </Suspense>
  );
}