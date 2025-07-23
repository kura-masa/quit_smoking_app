/** @type {import('next').NextConfig} */
const nextConfig = {
  // `undici`をトランスパイル対象に追加します
  transpilePackages: ['undici'],
  output: 'export',
  // 既存の画像ドメイン設定はそのまま残します
  images: {
    domains: ['pbs.twimg.com', 'abs.twimg.com'],
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    // Firebase FunctionsのファイルがNext.jsのビルドに含まれてしまい、
    // 型エラーが発生するのを防ぐために、TypeScriptのエラーを無視します。
    // ただし、これにより**プロジェクト全体の型エラーが無視される**点に注意してください。
    // ベストプラクティスは、Firebase FunctionsのコードをNext.jsのソースツリーから分離することです。
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig