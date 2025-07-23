'use client';

import { motion } from 'framer-motion';
import { Twitter, Target, Trophy, Calendar, Zap } from 'lucide-react';
import Button from '@/components/ui/Button';

interface LandingPageProps {
  onSignIn: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn }) => {
  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: '30日間チャレンジ',
      description: '明確な目標設定で禁煙を習慣化'
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: 'ゲーミフィケーション',
      description: 'バッジやトロフィーで達成感を実感'
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: '進捗の可視化',
      description: 'カレンダーで成功の軌跡を確認'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: '社会的プレッシャー',
      description: 'Twitter連携で継続のモチベーション'
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              禁煙チャレンジ
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              30日間で新しい自分に。<br />
              ゲーミフィケーション要素で楽しく禁煙を続けよう！
            </p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Button
                onClick={onSignIn}
                size="lg"
                className="bg-white text-primary-600 hover:bg-gray-100 text-xl px-8 py-4 shadow-xl"
              >
                <Twitter className="w-6 h-6 mr-3" />
                Twitterでチャレンジを開始
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 bg-white/20 rounded-full"
              animate={{
                y: [0, -20, 0],
                x: [0, 10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + i * 10}%`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              なぜ禁煙チャレンジなのか？
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              単なる禁煙アプリではありません。楽しみながら継続できる仕組みで、
              あなたの禁煙を全力でサポートします。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              チャレンジの流れ
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'チャレンジ設定',
                description: 'Twitterでログインし、失敗時の投稿内容を設定します。'
              },
              {
                step: '2',
                title: '毎日の報告',
                description: '毎朝8時にリマインダーが届きます。成功報告ボタンを押すだけ！'
              },
              {
                step: '3',
                title: '30日間継続',
                description: '報告を忘れると自動でペナルティツイート。継続のモチベーションに！'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                className="relative"
              >
                <div className="bg-white rounded-xl p-8 shadow-lg">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
                
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-primary-300"></div>
                    <div className="w-0 h-0 border-l-4 border-l-primary-300 border-t-2 border-t-transparent border-b-2 border-b-transparent ml-8 -mt-1"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="gradient-bg py-24">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              今すぐチャレンジを始めよう！
            </h2>
            <p className="text-xl text-white/90 mb-8">
              30日後の新しい自分に会いに行きませんか？
            </p>
            <Button
              onClick={onSignIn}
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100 text-xl px-8 py-4 shadow-xl"
            >
              <Twitter className="w-6 h-6 mr-3" />
              無料でチャレンジを開始
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;