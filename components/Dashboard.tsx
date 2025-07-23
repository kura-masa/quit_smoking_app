'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, Plus, Calendar as CalendarIcon, Trophy, Target } from 'lucide-react';
import { User, Challenge, SuccessLog, BADGES } from '@/lib/types';
import { signOut } from '@/lib/auth';
import { getCurrentChallenge, getSuccessLogs } from '@/lib/challenge';
import Button from '@/components/ui/Button';
import Calendar from '@/components/ui/Calendar';
import Badge from '@/components/ui/Badge';
import ChallengeSetupModal from '@/components/ChallengeSetupModal';
import DevControls from '@/components/DevControls';
import { differenceInDays, format } from 'date-fns';
import { getDevDate, isDevAccount } from '@/lib/dev-utils';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [successLogs, setSuccessLogs] = useState<SuccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    loadChallengeData();
  }, [user.uid]);

  const loadChallengeData = async () => {
    try {
      const currentChallenge = await getCurrentChallenge(user.uid);
      setChallenge(currentChallenge);
      
      if (currentChallenge) {
        const logs = await getSuccessLogs(currentChallenge.id);
        setSuccessLogs(logs);
      }
    } catch (error) {
      console.error('チャレンジデータ読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // 開発用日付変更時の再読み込み
  const handleDevDateChange = () => {
    loadChallengeData();
  };

  const handleSignOut = async () => {
    try {
      // テスト用ユーザーの場合はローカルストレージをクリア
      if (localStorage.getItem('testUser')) {
        localStorage.removeItem('testUser');
        window.location.reload();
        return;
      }
      
      await signOut();
    } catch (error) {
      console.error('サインアウトエラー:', error);
    }
  };

  const handleChallengeCreated = (newChallenge: Challenge) => {
    setChallenge(newChallenge);
    setSuccessLogs([]);
    setShowSetupModal(false);
  };

  const getEarnedBadges = () => {
    if (!challenge) return [];
    return BADGES.filter(badge => challenge.currentDay >= badge.requirement);
  };

  const getSuccessRate = () => {
    if (!challenge) return 0;
    const expectedDays = Math.min(challenge.currentDay, 30);
    return expectedDays > 0 ? (successLogs.length / expectedDays) * 100 : 0;
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

  return (
    <>
      {/* 開発者コントロール */}
      <DevControls user={user} onDateChange={handleDevDateChange} />
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={user.profileImageUrl}
                alt={user.displayName}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {user.displayName}さんのダッシュボード
                </h1>
                <p className="text-sm text-gray-500">@{user.screenName}</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="secondary"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!challenge ? (
          // No Active Challenge
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-12 h-12 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                新しいチャレンジを始めよう！
              </h2>
              <p className="text-gray-600 mb-8">
                30日間の禁煙チャレンジで、新しい自分に出会いませんか？
              </p>
              <Button
                onClick={() => setShowSetupModal(true)}
                size="lg"
                className="w-full"
              >
                <Plus className="w-5 h-5 mr-2" />
                チャレンジを開始する
              </Button>
            </div>
          </motion.div>
        ) : (
          // Active Challenge Dashboard
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">継続日数</p>
                    <p className="text-3xl font-bold text-primary-600">
                      {challenge.currentDay}日
                    </p>
                    <p className="text-sm text-gray-500">/ 30日</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">成功率</p>
                    <p className="text-3xl font-bold text-success-600">
                      {getSuccessRate().toFixed(0)}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {successLogs.length}/{Math.min(challenge.currentDay, 30)}日
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-success-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">獲得バッジ</p>
                    <p className="text-3xl font-bold text-warning-600">
                      {getEarnedBadges().length}個
                    </p>
                    <p className="text-sm text-gray-500">/ {BADGES.length}個</p>
                  </div>
                  <div className="w-12 h-12 bg-warning-100 rounded-full flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-warning-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Calendar and Badges */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Calendar
                  startDate={challenge.startDate}
                  successDates={successLogs.map(log => log.date)}
                  currentDay={challenge.currentDay}
                />
              </div>

              <div className="space-y-6">
                {/* Badges */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    バッジコレクション
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {BADGES.map((badge) => (
                      <div key={badge.id} className="text-center">
                        <Badge
                          badge={badge}
                          isEarned={challenge.currentDay >= badge.requirement}
                          size="md"
                        />
                        <p className="text-xs text-gray-500 mt-8">
                          {badge.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Challenge Info */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    チャレンジ情報
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">開始日</p>
                      <p className="font-medium">
                        {format(challenge.startDate, 'yyyy年MM月dd日')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ステータス</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        challenge.status === 'active' ? 'bg-success-100 text-success-800' :
                        challenge.status === 'completed' ? 'bg-primary-100 text-primary-800' :
                        'bg-danger-100 text-danger-800'
                      }`}>
                        {challenge.status === 'active' ? '進行中' :
                         challenge.status === 'completed' ? '完了' : '失敗'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">設定した実名</p>
                      <p className="font-medium">{challenge.realName}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Challenge Setup Modal */}
      <ChallengeSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onChallengeCreated={handleChallengeCreated}
        userId={user.uid}
      />
    </div>
    </>
  );
};

export default Dashboard;