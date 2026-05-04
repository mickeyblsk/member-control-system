Member Control System (Demo)
メンバー管理システム（デモ）

一個使用 Next.js App Router + TypeScript 建立的會員管理系統 demo。
Next.js App Router と TypeScript を使用して構築された会員管理システムのデモです。

# Demo 登入帳號 デモ用ログインアカウント

固定帳號（目前寫死）：

帳號：admin
密碼：demo

固定アカウント（現在はハードコードされています）：
アカウント：admin
パスワード：demo

# 環境需求

請先安裝以下環境：
以下の環境を事前にインストールしてください：

Node.js: v24.15.0
npm: 11.12.1

# 專案啟動方式 プロジェクトの起動方法
1. 安裝依賴
npm install
2. 啟動開發環境
npm run dev
3. 開啟網站
瀏覽器進入：
http://localhost:3000

1. 依存関係のインストール
npm install
2. 開発環境の起動
npm run dev
3. サイトを開く
ブラウザで以下にアクセスしてください：
http://localhost:3000

# 登入方式 ログイン方法

進入系統後，使用以下帳號登入：
システムにアクセス後、以下のアカウントでログインしてください：

admin / demo

# Demo 模式說明 デモモードの説明
目前 login API 支援 demo mode：

/api/auth/login?mode=demo

當使用 demo mode 時：

不會呼叫外部 API
使用 mock user data
直接回傳假 token

現在、login API はデモモードに対応しています：
/api/auth/login?mode=demo

デモモード使用時：

外部APIは呼び出されません
モックのユーザーデータを使用します
ダミートークンを直接返却します

# 專案架構（簡化版）プロジェクト構成（簡略版）
app/
 ├─ page.tsx                → redirect login
 ├─ login/page.tsx         → 登入頁 ログイン画面
 ├─ api/
 │   └─ auth/login/route.ts → login API (BFF)
services/
 └─ authService.ts          → 前端 API 呼叫 フロントエンドAPI呼び出し
lib/
 └─ serverRequest.ts        → server API wrapper
types/
 └─ auth.ts

# Auth Flow
Login Page
   ↓
authService
   ↓
/api/auth/login (Next API)
   ↓
serverRequest
   ↓
external API / demo mock
   ↓
set cookie (token)

# 登入機制 ログイン仕組み
token 存在 cookie（demo 為 httpOnly: false）
user data 存在 sessionStorage（前端快取）

トークンは Cookie に保存（デモでは httpOnly: false）
ユーザーデータは sessionStorage に保存（フロントエンドキャッシュ）

# 常用指令 よく使うコマンド
啟動開發環境 
開発環境の起動
npm run dev

建置專案
ビルド
npm run build

啟動 production
本番環境の起動
npm start

檢查 チェック
lint

# 注意事項
此專案為 demo，部分 API 使用 mock data
login 驗證目前固定為 admin / demo
cookie 未做 httpOnly 強化（僅 demo 用）

本プロジェクトはデモのため、一部のAPIはモックデータを使用しています
ログイン認証は現在 admin / demo に固定されています
Cookie は httpOnly の強化がされていません（デモ用途のみ）