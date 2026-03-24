# Playwright MCP / E2E セットアップ

このリポジトリでは、UIレイアウト確認を幅広い環境（デスクトップ / iPhone / Android / タブレット）で再現しやすくするために、Playwright MCP と Playwright Test を利用できます。

## 1) 依存インストール

```bash
npm install
npm run playwright:install
```

## 2) MCP サーバー起動（任意）

```bash
npm run mcp:playwright
```

`.mcp.json` も同梱済みです。対応クライアントからこの設定を読み込むと、同じ引数で MCP を起動できます。

## 3) E2E 実行

```bash
npm run test:e2e
```

主な設定:
- `playwright.config.ts`
  - `chromium-desktop`
  - `webkit-iphone`
  - `chromium-android`
  - `chromium-tablet`
- `tests/e2e/layout.spec.ts`
  - ボタン最小サイズの検証
  - カメラ表示領域の充填率検証

## 4) 対象URL

E2Eの対象は `"/graduation_with_diploma"` です。  
顔認識依存のページを避け、端末差での安定性を優先しています。

# シャッター音について

本アプリで使用しているシャッター音は、以下のサイトからダウンロードし、再配布しています。

🔊 **[OtoLogic](https://otologic.jp/)** より  
ファイル名: `Camera-Phone01-1.mp3`  
ライセンス: **CC BY 4.0** 
提供元: **OtoLogic** (https://otologic.jp/)

© OtoLogic (CC BY 4.0)
