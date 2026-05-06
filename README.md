Member Control System (Demo)
メンバー管理システム（デモ）

一個使用 Next.js App Router + TypeScript 建立的會員管理系統 demo。
目前已實作的模組：登入、會員 CRUD、CSV 批次匯入。

Next.js App Router と TypeScript を使用して構築された会員管理システムのデモです。
実装済みのモジュール：ログイン、会員 CRUD、CSV 一括インポート。

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

# 技術棧 技術スタック

核心相依套件：

- Next.js 16.2.4（App Router）
- React 19.2.4 / React DOM 19.2.4
- TypeScript 5
- @tanstack/react-query 5（資料快取與 mutation）
- sonner（toast 通知）
- Tailwind CSS v4（樣式）

主要な依存パッケージ：

- Next.js 16.2.4（App Router）
- React 19.2.4 / React DOM 19.2.4
- TypeScript 5
- @tanstack/react-query 5（データキャッシュとミューテーション）
- sonner（トースト通知）
- Tailwind CSS v4（スタイリング）

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

本專案有一種 demo 模式切換方式：

【Auth — 路徑切換】
/api/auth/login/demo?name=${name}&password=${password}

當使用 demo 時：
不會呼叫外部 API
使用 mock user data
直接回傳假 token

【Customers — 路徑切換】
正式：/api/customers
Demo：/api/customers/demo

目前 services/customerService.ts 內固定打 /api/customers/demo，
demo 端點使用 in-memory store（app/api/customers/demo/_store.ts），
內含 5 筆預設種子資料，重啟伺服器後資料會重置。

本プロジェクトには 1 種類のデモモード切替方式があります：

【Auth — パスで切替】
/api/auth/login/demo?name=${name}&password=${password}

デモ使用時：
外部APIは呼び出されません
モックのユーザーデータを使用します
ダミートークンを直接返却します

【Customers — パスで切替】
本番：/api/customers
デモ：/api/customers/demo

現在は services/customerService.ts 内で /api/customers/demo に固定接続されています。
デモエンドポイントは in-memory store（app/api/customers/demo/_store.ts）を使用し、
5 件のシードデータを含み、サーバー再起動でリセットされます。

# 專案架構（簡化版）プロジェクト構成（簡略版）
app/
 ├─ layout.tsx                       → 全域 layout 全体レイアウト
 ├─ providers.tsx                    → I18nProvider / React Query / Toaster / Loading overlay
 ├─ page.tsx                         → redirect to /login
 ├─ login/page.tsx                   → 登入頁 ログイン画面
 ├─ customers/page.tsx               → 會員列表 + CRUD modal + CSV 匯入入口
 │                                     会員一覧 + CRUD モーダル + CSV インポート
 └─ api/
     ├─ auth/
     │   └─ login/
     │       ├─ route.ts             → login API（含 demo mode）
     │       └─ demo/route.ts        → login demo route
     └─ customers/
         ├─ route.ts                 → 正式環境 GET / POST
         ├─ [id]/route.ts            → 正式環境 PUT / DELETE
         ├─ import/route.ts          → 正式環境 CSV 匯入
         └─ demo/
             ├─ _store.ts            → in-memory store + 種子資料 シードデータ
             ├─ route.ts             → demo GET / POST
             ├─ [id]/route.ts        → demo PUT / DELETE
             └─ import/route.ts      → demo 批次匯入 一括インポート
components/
 ├─ GlobalLoadingOverlay.tsx         → 全域 loading 遮罩 グローバルローディング
 └─ LanguageSwitcher.tsx             → 語系切換按鈕 言語切替ボタン
hooks/
 └─ useCustomers.ts                  → React Query CRUD + import mutations
services/
 ├─ loginService.ts                  → login 前端 API 呼叫
 └─ customerService.ts               → customer 前端 API 呼叫（目前固定打 demo 路徑）
lib/
 ├─ serverRequest.ts                 → server API wrapper
 ├─ customerMapper.ts                → API ↔ client 型別轉換（birthday string ↔ Date）
 └─ i18n/
     ├─ dictionaries.ts              → 中／日字典 + 語系常數 中／日辞書 + ロケール定数
     └─ I18nProvider.tsx             → I18n Context + useT() hook
types/
 ├─ auth.ts
 └─ customer.ts                      → CustomerType / CustomerResponse / CustomerSeed
demo/
 ├─ demo_customer.csv                → 5 筆合法測試資料 正常テストデータ
 └─ demo_customer_crash.csv          → 故意格式錯誤，用來測 import 驗證失敗流程
                                       インポートのバリデーション失敗を検証するための不正データ

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

# 會員管理流程 会員管理フロー
Customers Page (app/customers/page.tsx)
   ↓
useCustomers hooks (React Query)
   ↓
customerService (fetch /api/customers/demo)
   ↓
demo route handler
   ↓
in-memory _store.ts

所有 mutation（新增 / 修改 / 刪除 / 匯入）成功後會 invalidateQueries(["customers"])，
讓列表自動 refetch；錯誤訊息透過 sonner toast 顯示。

すべてのミューテーション（追加 / 更新 / 削除 / インポート）の成功後に
invalidateQueries(["customers"]) が呼ばれ、一覧は自動的に refetch されます。
エラーは sonner の toast で表示されます。

# CSV 匯入規格 CSV インポート仕様

【檔案格式】
- 編碼：UTF-8（支援 BOM）
- 標頭（必須照順序）：name,phone,address,email,birthday
- birthday 格式：YYYY-MM-DD（可空）
- name 必填，其他欄位可為空字串

【驗證行為】
解析在前端 client-side 執行（app/customers/page.tsx 的 parseCustomerCsv）：
- 任何一行驗證失敗 → 整批拒絕，跳出 modal 顯示逐行錯誤訊息
- 全部通過才會送到 /api/customers/demo/import

【範例檔】
- demo/demo_customer.csv — 全部合法
- demo/demo_customer_crash.csv — 故意壞格式，用來示範錯誤回饋

【ファイル形式】
- エンコーディング：UTF-8（BOM 対応）
- ヘッダー（順序固定）：name,phone,address,email,birthday
- birthday 形式：YYYY-MM-DD（空欄可）
- name は必須、その他のフィールドは空文字列可

【バリデーションの挙動】
解析はフロントエンド側で実行されます（app/customers/page.tsx の parseCustomerCsv）：
- 1 行でも検証エラーがあればバッチ全体を拒否し、モーダルで行ごとのエラーメッセージを表示
- すべて通過した場合のみ /api/customers/demo/import に送信

【サンプルファイル】
- demo/demo_customer.csv — 全行正常
- demo/demo_customer_crash.csv — 不正なフォーマット、エラー表示確認用

# 多語系 (i18n) 多言語対応

【支援語系】
- zh-Hant（繁體中文，預設）— UI 顯示為「中文」
- ja（日本語）— UI 顯示為「日本語」

【實作方式】
- React Context provider lib/i18n/I18nProvider.tsx 提供 useT() / useI18n() hook，整個 App 在 app/providers.tsx 最外層被 I18nProvider 包起來
- 字典定義在 lib/i18n/dictionaries.ts，採巢狀 key（如 customers.confirmDelete），支援 {{var}} 內插（如 {{name}} / {{n}}）
- 使用者選擇 persist 在 localStorage（key：app_locale），並同步更新 <html lang> 屬性
- 沒有額外引入 i18n 套件，純 React Context 實作

【切換入口】
LanguageSwitcher 元件（components/LanguageSwitcher.tsx）已放在：
- 登入頁右上角（app/login/page.tsx）
- 會員列表頁標題列右側（app/customers/page.tsx）

【新增語系步驟】
- 在 lib/i18n/dictionaries.ts 的 SUPPORTED_LOCALES 陣列加入新 locale code
- 在 LOCALE_LABELS 補上 UI 顯示名稱
- 在 dictionaries 物件補一份對應語系的完整字典（key 結構需與既有語系一致）

【対応言語】
- zh-Hant（繁体中文、デフォルト）— UI では「中文」と表示
- ja（日本語）— UI では「日本語」と表示

【実装方法】
- React Context プロバイダ lib/i18n/I18nProvider.tsx が useT() / useI18n() フックを提供し、app/providers.tsx の最外層で I18nProvider がアプリ全体をラップしています
- 辞書は lib/i18n/dictionaries.ts に定義され、ネストキー（例：customers.confirmDelete）と {{var}} 補間（例：{{name}} / {{n}}）に対応しています
- ユーザーの選択は localStorage（キー：app_locale）に保存され、<html lang> 属性も同時に更新されます
- i18n ライブラリは追加せず、React Context のみで実装しています

【切替入口】
LanguageSwitcher コンポーネント（components/LanguageSwitcher.tsx）は以下に配置されています：
- ログインページの右上（app/login/page.tsx）
- 会員一覧ページのタイトル右側（app/customers/page.tsx）

【新しい言語の追加手順】
- lib/i18n/dictionaries.ts の SUPPORTED_LOCALES 配列に新しい locale code を追加
- LOCALE_LABELS に UI 表示名を追加
- dictionaries オブジェクトに対応言語のフル辞書を追加（既存言語と同じキー構造）

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
Customer demo 資料只存在 process 記憶體，重啟伺服器即清空
前端目前固定走 demo 路徑，正式 API 尚未在 UI 串接
CSV 解析在前端 client-side 完成，沒有使用第三方套件
多語系切換為 client-side，使用者選擇存在 localStorage（app_locale），SSR 階段預設為 zh-Hant

本プロジェクトはデモのため、一部のAPIはモックデータを使用しています
ログイン認証は現在 admin / demo に固定されています
Cookie は httpOnly の強化がされていません（デモ用途のみ）
Customer のデモデータはプロセスメモリ上にのみ保持され、サーバー再起動でリセットされます
フロントエンドは現状デモ用パスに固定で接続されており、本番 API は UI に未接続です
CSV の解析はフロントエンド側で行っており、サードパーティライブラリは使用していません
多言語切替はクライアントサイドで、ユーザーの選択は localStorage（app_locale）に保存されます。SSR 時は zh-Hant がデフォルトです