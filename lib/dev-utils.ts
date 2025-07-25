// 開発用ユーティリティ関数

// 開発用アカウントのTwitter IDまたはscreenNameを定義
const DEV_ACCOUNTS = [
  'Masa', // Masaさんのアカウント (screenName)
  '1441368062200999947', // Masaさんのアカウント (twitterId)
];

/**
 * 開発用アカウントかどうかを判定
 */
export const isDevAccount = (user: { twitterId: string; screenName: string }): boolean => {
  return DEV_ACCOUNTS.includes(user.screenName) || DEV_ACCOUNTS.includes(user.twitterId);
};

/**
 * 開発用の日付オフセット（日数）を管理
 */
const DEV_DATE_OFFSET_KEY = 'dev_date_offset';

/**
 * 開発用日付オフセットを取得
 */
export const getDevDateOffset = (): number => {
  if (typeof window === 'undefined') return 0;
  const offset = localStorage.getItem(DEV_DATE_OFFSET_KEY);
  return offset ? parseInt(offset, 10) : 0;
};

/**
 * 開発用日付オフセットを設定
 */
export const setDevDateOffset = (days: number): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DEV_DATE_OFFSET_KEY, days.toString());
};

/**
 * 開発用の現在日時を取得（オフセット適用）
 */
export const getDevDate = (): Date => {
  const now = new Date();
  const offset = getDevDateOffset();
  if (offset === 0) return now;

  const devDate = new Date(now);
  devDate.setDate(devDate.getDate() + offset);
  return devDate;
};

/**
 * 開発用日付を1日進める
 */
export const advanceDevDate = (): void => {
  const currentOffset = getDevDateOffset();
  setDevDateOffset(currentOffset + 1);
};

/**
 * 開発用日付を1日戻す
 */
export const rewindDevDate = (): void => {
  const currentOffset = getDevDateOffset();
  setDevDateOffset(currentOffset - 1);
};

/**
 * 開発用日付をリセット
 */
export const resetDevDate = (): void => {
  setDevDateOffset(0);
};