'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, User } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { createChallenge } from '@/lib/challenge';
import { Challenge } from '@/lib/types';

interface ChallengeSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChallengeCreated: (challenge: Challenge) => void;
  userId: string;
}

const ChallengeSetupModal: React.FC<ChallengeSetupModalProps> = ({
  isOpen,
  onClose,
  onChallengeCreated,
  userId,
}) => {
  const [realName, setRealName] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = async () => {
    if (!realName.trim()) {
      alert('実名を入力してください');
      return;
    }

    try {
      setLoading(true);
      const challenge = await createChallenge(userId, realName.trim());
      onChallengeCreated(challenge);
      
      // Reset form
      setRealName('');
      setStep(1);
    } catch (error) {
      console.error('チャレンジ作成エラー:', error);
      alert('チャレンジの作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRealName('');
    setStep(1);
    onClose();
  };

  const failureTweetPreview = `わたくし「${realName || '（実名）'}」は30日間の禁煙チャレンジを失敗した恥ずかしい人です。 #禁煙チャレンジ失敗`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="新しい禁煙チャレンジを開始"
      size="lg"
    >
      <div className="space-y-6">
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                チャレンジの設定
              </h3>
              <p className="text-gray-600">
                30日間の禁煙チャレンジを開始します。<br />
                失敗時にTwitterに投稿される内容に含める実名を設定してください。
              </p>
            </div>

            <div>
              <label htmlFor="realName" className="block text-sm font-medium text-gray-700 mb-2">
                実名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="realName"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="例: 田中太郎"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                この名前が失敗時のツイートに含まれます
              </p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    重要な注意事項
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• チャレンジ開始後は設定を変更できません</li>
                    <li>• 毎日午前4時に前日の報告をチェックします</li>
                    <li>• 報告がない場合、自動的に失敗ツイートが投稿されます</li>
                    <li>• 30日間連続で成功報告を行うとチャレンジ完了です</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={handleClose}
                variant="secondary"
                className="flex-1"
              >
                キャンセル
              </Button>
              <Button
                onClick={() => setStep(2)}
                disabled={!realName.trim()}
                className="flex-1"
              >
                次へ
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-danger-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                失敗時の投稿内容を確認
              </h3>
              <p className="text-gray-600">
                チャレンジに失敗した場合、以下の内容があなたのTwitterアカウントに自動投稿されます。
              </p>
            </div>

            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  T
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <p className="text-gray-900 text-sm leading-relaxed">
                      {failureTweetPreview}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    失敗時に自動投稿される内容
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    最終確認
                  </h4>
                  <p className="text-sm text-red-700">
                    この内容でよろしいですか？チャレンジ開始後は変更できません。
                    社会的プレッシャーを活用して、禁煙を成功させましょう！
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => setStep(1)}
                variant="secondary"
                className="flex-1"
              >
                戻る
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={loading}
                variant="danger"
                className="flex-1"
              >
                チャレンジを開始する
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};

export default ChallengeSetupModal;