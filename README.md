# シャッター音について

本アプリで使用しているシャッター音は、以下のサイトからダウンロードし、再配布しています。

**[OtoLogic](https://otologic.jp/)** より  
ファイル名: `Camera-Phone01-1.mp3`  
ライセンス: **CC BY 4.0** 
提供元: **OtoLogic** (https://otologic.jp/)

© OtoLogic (CC BY 4.0)

## Playwright E2Eテスト

E2Eテストは以下で実行できます。

```bash
npm run test:e2e
```

UIモードで実行する場合は以下です。

```bash
npm run test:e2e:ui
```

Playwrightは `npm run dev:test` (http://127.0.0.1:4173) を自動起動してテストします。

### デバイス/ブラウザ別実行

```bash
# Desktop
npm run test:e2e:desktop:chrome
npm run test:e2e:desktop:firefox

# iPhone
npm run test:e2e:iphone:chrome
npm run test:e2e:iphone:firefox

# Android
npm run test:e2e:android:chrome
npm run test:e2e:android:firefox

# Tablet
npm run test:e2e:tablet:chrome
npm run test:e2e:tablet:firefox

# 依頼された全ターゲットをまとめて実行
npm run test:e2e:requested
```

> 注: Playwright上のモバイルは実機ではなくエミュレーションです。  
> `*-chrome` は Chromium + Chrome channel、`*-firefox` は Firefox エンジンで動作します。
> Firefoxは `isMobile` 非対応のため、`*-firefox` の iPhone/Android/Tablet は  
> `viewport + userAgent + hasTouch` で擬似モバイル化し、`firefoxUserPrefs` でカメラをモックしています。

### カバレッジ方針

- `tests/e2e/critical`: 主要フロー（png/gif/face の撮影→保存→ダウンロード）
- `tests/e2e/important`: 重要フロー（カメラ切替、ローディング遷移、保存ページ直接アクセス）
- `tests/e2e/broad`: 広範囲スモーク（`imagesData` 全フレームIDの表示確認）

## Playwright MCP

Playwright MCP を使う場合は、このリポジトリの `.mcp.json` を利用できます。

```bash
npm ls @playwright/mcp
```

`.mcp.json` では以下のように固定バージョンで設定しています。

- command: `npx`
- args: `@playwright/mcp@0.0.69`
