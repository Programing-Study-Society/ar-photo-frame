# 脆弱性診断レポート（2026-10-22）

対象: `ar-photo-frame`（Next.js Pages Router / `output: "export"` で Cloudflare Pages に静的配信）

## 前提
- 本番は静的 HTML/JS のみ。Node.js が動くのは **ビルド時（CI/Cloudflare Pages）と開発サーバー**だけ。
- 撮影画像はブラウザ内で処理され、サーバーへ送信されない。

## 1. Node.js 本体（2026-10-21 セキュリティリリース）
修正版: v22.23.4 / v24.22.1 / v26.12.1。主な High:
- CVE-2026-111497 Brotli デコーダの境界外書き込み（RCE の可能性）
- CVE-2026-106069 / CVE-2026-105483 TLS 証明書ホスト名検証バイパス
- CVE-2026-105482 `dns.resolve` が NUL 文字で名前を切り詰め

影響: 本番配信には直接影響しないが、ビルド環境の `npm install`（TLS/Brotli を使う通信）と、
LAN に公開しがちな `next dev --experimental-https` が対象になる。
対応: `.nvmrc` = 22.23.4、`engines.node >= 22.23.4` を追加。開発者のローカル Node も更新すること。
Node 20 以前は EOL のため使用しない。

## 2. npm 依存関係（npm audit: 修正前 33件 → 修正後 4件）
| パッケージ | 修正前 | 対応 |
|---|---|---|
| next | 15.1.4（critical: Middleware 認可バイパス、RSC 経由 RCE、画像最適化 RCE ほか多数） | 15.5.28 へ更新 |
| eslint-config-next | 15.1.4 | 15.5.28 へ更新 |
| face-api.js | 未使用だが node-fetch（High）を引き込む | 削除 |
| eslint / typescript-eslint / minimatch / flatted / js-yaml / nanoid など | 各種 DoS・プロトタイプ汚染 | `npm audit fix` で更新 |

Next.js の脆弱性の多くはサーバー機能（Middleware、Server Actions、画像最適化 API）が前提で、
静的エクスポートの本番には当たらないが、開発サーバーには当たるため更新した。

### 残存（ビルド時のみ・入力は自リポジトリのソースのみ → 実害は低い）
- tailwindcss 3.x 経由の braces / micromatch / chokidar（修正は Tailwind v4 への移行が必要）
- postcss-selector-parser（同上）
- next が内部で固定している postcss 8.4.31
- @eslint/eslintrc 経由の brace-expansion 1.1.11

→ 将来 Tailwind v4 へ移行すると解消できる。

## 3. アプリケーションコード
| 重要度 | 内容 | 対応 |
|---|---|---|
| 中 | MediaPipe の WASM を `cdn.jsdelivr.net/.../tasks-vision@latest` から読み込み。`@latest` は 1.1.1 を指しており、npm 側の 0.10.22 と不一致。パッケージが乗っ取られた場合、カメラ権限を持つページで任意コードが動く | ビルド時に `node_modules` から `public/mediapipe/wasm` へコピーし、自サイト（Cloudflare Pages）から配信するよう変更。外部 CDN 依存を解消（`scripts/copy-mediapipe-wasm.cjs`） |
| 低 | セキュリティヘッダーなし | `public/_headers` に nosniff / X-Frame-Options / Referrer-Policy / Permissions-Policy（camera=self のみ）を追加 |
| 情報 | `?debug=true` の隠しページはクライアント側の判定のみ。中身は公開データなので問題はないが、アクセス制御としては機能しない | 対応不要 |

XSS につながる `dangerouslySetInnerHTML` / `eval` / URL パラメータの描画、秘密情報のコミットは見つからなかった。

## 今後の推奨
1. Cloudflare Pages の環境変数 `NODE_VERSION` も 22.23.4 以上に（`.nvmrc` を読まない設定の場合）。
2. Content-Security-Policy の導入（外部 CDN が不要になったので `script-src 'self' 'wasm-unsafe-eval'` 程度で済む見込み。`blob:` の許可など実機確認しながら）。
3. Dependabot など依存更新の自動化。
