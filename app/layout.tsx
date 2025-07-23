import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '禁煙チャレンジ - 30日間で新しい自分に',
  description: 'ゲーミフィケーション要素を取り入れた楽しい禁煙サポートアプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  );
}