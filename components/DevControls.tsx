'use client';

import { useState, useEffect } from 'react';
import { Calendar, RotateCcw, FastForward, Rewind, Play } from 'lucide-react';
import { User } from '@/lib/types';
import { isDevAccount, getDevDateOffset, advanceDevDate, rewindDevDate, resetDevDate, getDevDate } from '@/lib/dev-utils';
import Button from '@/components/ui/Button';

interface DevControlsProps {
  user: User;
  onDateChange?: () => void;
}

interface BatchResult {
  processedChallenges: number;
  failedChallenges: number;
  completedChallenges: number;
  errors: number;
  executedAt: string;
}

const DevControls: React.FC<DevControlsProps> = ({ user, onDateChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(getDevDateOffset());
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  // 開発者アカウントでない場合は何も表示しない
  if (!isDevAccount(user)) {
    return null;
  }

  const handleAdvanceDate = () => {
    advanceDevDate();
    setCurrentOffset(getDevDateOffset());
    onDateChange?.();
  };

  const handleRewindDate = () => {
    rewindDevDate();
    setCurrentOffset(getDevDateOffset());
    onDateChange?.();
  };

  const handleResetDate = () => {
    resetDevDate();
    setCurrentOffset(0);
    onDateChange?.();
  };

  const handleRunBatch = async () => {
    setBatchLoading(true);
    setBatchError(null);
    setBatchResult(null);

    try {
      const response = await fetch('/api/run-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();

      if (data.success) {
        setBatchResult(data.result);
        onDateChange?.(); // データを再取得
        
        // 5秒後に結果を自動で消す
        setTimeout(() => {
          setBatchResult(null);
        }, 5000);
      } else {
        setBatchError(data.error || 'バッチ実行に失敗しました');
        
        // 5秒後にエラーを自動で消す
        setTimeout(() => {
          setBatchError(null);
        }, 5000);
      }
    } catch (error) {
      console.error('バッチ実行エラー:', error);
      setBatchError('バッチ実行中にエラーが発生しました');
    } finally {
      setBatchLoading(false);
    }
  };

  const devDate = getDevDate();

  return (
    <div className="fixed bottom-4 right-4 z-[9999]" style={{ position: 'fixed', bottom: '16px', right: '16px', zIndex: 9999 }}>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
          title="開発者コントロール"
          style={{ backgroundColor: '#dc2626', color: 'white', padding: '12px', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
        >
          <Calendar className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-white border-2 border-red-500 rounded-lg shadow-xl p-4 min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-red-600">🔧 開発者コントロール</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="text-sm">
              <p><strong>現在の日付:</strong> {devDate.toLocaleDateString('ja-JP')}</p>
              <p><strong>オフセット:</strong> {
                currentOffset === 0 ? '通常' : 
                currentOffset > 0 ? `+${currentOffset}日` : 
                `${currentOffset}日`
              }</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button
                onClick={handleRewindDate}
                className="bg-orange-600 hover:bg-orange-700 text-white text-sm py-2"
              >
                <Rewind className="w-4 h-4 mr-1" />
                -1日
              </Button>

              <Button
                onClick={handleAdvanceDate}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
              >
                <FastForward className="w-4 h-4 mr-1" />
                +1日
              </Button>

              <Button
                onClick={handleResetDate}
                className="bg-gray-600 hover:bg-gray-700 text-white text-sm py-2"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                リセット
              </Button>
            </div>

            <div className="border-t pt-3">
              <Button
                onClick={handleRunBatch}
                disabled={batchLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white text-sm py-2"
              >
                <Play className="w-4 h-4 mr-1" />
                {batchLoading ? '実行中...' : 'バッチ実行'}
              </Button>
            </div>

            {batchResult && (
              <div className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                <p className="font-semibold text-green-800 mb-2">✅ バッチ実行完了</p>
                <div className="space-y-1 text-green-700">
                  <p>処理済み: {batchResult.processedChallenges}件</p>
                  <p>失敗処理: {batchResult.failedChallenges}件</p>
                  <p>完了処理: {batchResult.completedChallenges}件</p>
                  {batchResult.errors > 0 && (
                    <p className="text-red-600">エラー: {batchResult.errors}件</p>
                  )}
                </div>
              </div>
            )}

            {batchError && (
              <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                <p className="font-semibold text-red-800 mb-1">❌ エラー</p>
                <p className="text-red-700">{batchError}</p>
              </div>
            )}

            <p className="text-xs text-gray-500">
              ⚠️ 開発用機能：日付を進めてテストできます
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevControls;