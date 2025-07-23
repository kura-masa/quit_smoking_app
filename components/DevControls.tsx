'use client';

import { useState } from 'react';
import { Calendar, RotateCcw, FastForward } from 'lucide-react';
import { User } from '@/lib/types';
import { isDevAccount, getDevDateOffset, advanceDevDate, resetDevDate, getDevDate } from '@/lib/dev-utils';
import Button from '@/components/ui/Button';

interface DevControlsProps {
  user: User;
  onDateChange?: () => void;
}

const DevControls: React.FC<DevControlsProps> = ({ user, onDateChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentOffset, setCurrentOffset] = useState(getDevDateOffset());

  // デバッグ用：一時的に常に表示
  console.log('DevControls - User:', user);
  console.log('DevControls - isDevAccount:', isDevAccount(user));
  console.log('DevControls - user.screenName:', user.screenName);
  console.log('DevControls - user.twitterId:', user.twitterId);
  
  // 開発用アカウントでない場合は何も表示しない
  if (!isDevAccount(user)) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-yellow-500 text-black p-2 rounded text-xs">
          デバッグ: 開発用アカウントではありません<br/>
          screenName: {user.screenName}<br/>
          twitterId: {user.twitterId}
        </div>
      </div>
    );
  }

  const handleAdvanceDate = () => {
    advanceDevDate();
    setCurrentOffset(getDevDateOffset());
    onDateChange?.();
  };

  const handleResetDate = () => {
    resetDevDate();
    setCurrentOffset(0);
    onDateChange?.();
  };

  const devDate = getDevDate();

  return (
    <div className="fixed bottom-4 right-4 z-[9999]" style={{position: 'fixed', bottom: '16px', right: '16px', zIndex: 9999}}>
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition-colors"
          title="開発者コントロール"
          style={{backgroundColor: '#dc2626', color: 'white', padding: '12px', borderRadius: '50%', border: 'none', cursor: 'pointer'}}
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
              <p><strong>オフセット:</strong> {currentOffset > 0 ? `+${currentOffset}日` : '通常'}</p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleAdvanceDate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2"
              >
                <FastForward className="w-4 h-4 mr-1" />
                +1日
              </Button>
              
              <Button
                onClick={handleResetDate}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-sm py-2"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                リセット
              </Button>
            </div>
            
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