/** @type {import('next').NextConfig} */
const nextConfig = {
  // `undici`をトランスパイル対象に追加します
  transpilePackages: ['undici'],
  output: 'export',
  // 既存の画像ドメイン設定はそのまま残します
  images: {
    domains: ['pbs.twimg.com', 'abs.twimg.com'],
  },
}

module.exports = nextConfig