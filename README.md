Member Control System (Demo)
メンバー管理システム（デモ）

一個使用 Next.js 16 App Router + TypeScript 建立的會員管理系統 demo。
資料層採用 in-memory store，所有讀取走 Server Components、所有寫入走 Server Actions。
目前已實作的模組：登入、會員 CRUD、CSV 批次匯入、中／日多語系。

Next.js 16 App Router と TypeScript を使用して構築された会員管理システムのデモです。
データ層は in-memory store を採用し、すべての読み込みは Server Components 経由、
すべての書き込みは Server Actions 経由で行います。
実装済みのモジュール：ログイン、会員 CRUD、CSV 一括インポート、中／日多言語対応。

# Demo 登入帳號 デモ用ログインアカウント

固定帳號（目前寫死）：

帳號：admin

密碼：demo

固定アカウント（現在はハードコードされています）：

アカウント：admin

パスワード：demo

# 環境需求 環境要件

請先安裝以下環境：

以下の環境を事前にインストールしてください：

Node.js: v20.9.0 以上（Next.js 16 最低需求）

npm: 11.x 以上建議 / 11.x 以上推奨

# 技術棧 技術スタック

核心相依套件：

- Next.js 16.2.4（App Router）
- React 19.2.4 / React DOM 19.2.4
- TypeScript 5
- Tailwind CSS v4（樣式）
- sonner（toast 通知）

主要な依存パッケージ：

- Next.js 16.2.4（App Router）
- React 19.2.4 / React DOM 19.2.4
- TypeScript 5
- Tailwind CSS v4（スタイリング）
- sonner（トースト通知）

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

# Next.js 16 慣用做法說明 Next.js 16 のプラクティス

本專案刻意採用 Next.js 16 推薦的「Server-first」開發模式，與傳統 React SPA 的差異如下：

| 面向 | 傳統 React SPA | 本專案做法 |
|------|---------------|------------|
| 資料抓取 | client `useEffect` + `fetch` | Server Component (`page.tsx`) 直接呼叫資料層 |
| 寫入操作 | client `fetch('/api/...')` + JSON | Server Actions (`'use server'`) |
| 列表更新 | client 自行 `mutate` / `invalidateQueries` | Server Action 結尾 `revalidatePath()` 觸發 RSC re-render |
| 表單提交 | `onSubmit` + `preventDefault` + fetch | `<form action={serverAction}>` + `useActionState` |
| 路由守門 | client guard（會閃爍） | `proxy.ts`（Next.js 16 取代舊版 `middleware.ts`） |
| 認證資訊 | localStorage / sessionStorage | server-side cookie + `next/headers` 的 `cookies()` |

本プロジェクトは Next.js 16 推奨の「Server-first」アプローチを採用しています：

| 項目 | 従来の React SPA | 本プロジェクト |
|------|------------------|----------------|
| データ取得 | client `useEffect` + `fetch` | Server Component で直接呼び出し |
| 書き込み | client `fetch('/api/...')` | Server Actions (`'use server'`) |
| 一覧更新 | client 側の `mutate` / `invalidateQueries` | Server Action 末尾の `revalidatePath()` |
| フォーム送信 | `onSubmit` + fetch | `<form action={serverAction}>` + `useActionState` |
| ルートガード | client guard（フラッシュあり） | `proxy.ts`（Next.js 16 で `middleware.ts` から改名） |
| 認証情報 | localStorage / sessionStorage | server-side cookie + `next/headers` |

# 專案架構 プロジェクト構成

```
app/
 ├─ layout.tsx                       → Root layout + metadata
 ├─ providers.tsx                    → I18nProvider + sonner Toaster
 ├─ page.tsx                         → redirect("/login")
 ├─ login/
 │   ├─ page.tsx                     → 已登入則 redirect /customers
 │   ├─ actions.ts                   → loginAction / logoutAction (Server Actions)
 │   └─ _components/
 │       └─ LoginFormClient.tsx      → 登入表單 (Client Component)
 └─ customers/
     ├─ page.tsx                     → 列表 (Server Component) — 直接讀 store
     ├─ actions.ts                   → CRUD + import (Server Actions)
     ├─ loading.tsx                  → Suspense fallback
     ├─ error.tsx                    → Error Boundary
     ├─ _lib/
     │   ├─ store.ts                 → in-memory store ("server-only")
     │   └─ validation.ts            → 共用驗證 (server / client 兩端皆可用)
     └─ _components/
         ├─ CustomersClient.tsx      → 列表主元件 (Client)
         ├─ CustomerFormModalClient.tsx
         ├─ ImportErrorModalClient.tsx
         └─ parseCsv.ts              → CSV 解析 (Client side)

proxy.ts                             → 路由守門 (Next.js 16 取代 middleware.ts)
                                       matcher: /customers/:path*

components/
 └─ LanguageSwitcherClient.tsx       → 語系切換按鈕 (Client)

lib/
 └─ i18n/
     ├─ dictionaries.ts              → 中／日字典 + 語系常數
     └─ I18nProvider.tsx             → I18n Context + useT() hook (Client)

types/
 ├─ auth.ts                          → User / LoginResponse
 └─ customer.ts                      → Customer / CustomerDTO / CustomerInput

demo/
 ├─ demo_customer.csv                → 5 筆合法測試資料
 └─ demo_customer_crash.csv          → 故意格式錯誤，測試 import 驗證流程
```

【命名約定 命名規約】

- Server Action 函式統一帶 `Action` 後綴：`loginAction`、`createCustomerAction`、`logoutAction` 等
- Client 元件統一帶 `Client` 後綴：`LoginFormClient`、`CustomerFormModalClient` 等
- 私有資料夾以底線開頭：`_components/`、`_lib/`（Next.js 慣例，不會被路由化）
- 資料層檔案頂端加 `import "server-only"`，防止被打包進 client bundle

# Auth Flow 認証フロー

```
LoginFormClient (Client)
   ↓ <form action={loginAction}> + useActionState
loginAction (Server Action, "use server")
   ↓ 驗證 admin/demo
   ↓ cookies().set("token", ..., { httpOnly: false })
   ↓
redirect("/customers")
   ↓
proxy.ts (matcher: /customers/:path*)
   ↓ 確認有 token cookie，否則 redirect 回 /login
   ↓
CustomersPage (Server Component)
```

登出走 `logoutAction`：`cookies().delete("token") → redirect("/login")`。

ログアウトは `logoutAction` 経由：`cookies().delete("token") → redirect("/login")`。

# 會員管理流程 会員管理フロー

```
CustomersPage (Server Component, app/customers/page.tsx)
   ↓ const customers = listCustomers();   ← server-side 直接讀 store
   ↓ <CustomersClient customers={customers} />   ← props 傳遞給 client island

CustomersClient (Client)
   ├─ 純前端狀態：搜尋 / 分頁 / Modal 開關
   ├─ 新增/編輯 → CustomerFormModalClient
   │     └─ <form action={createCustomerAction | updateCustomerAction}>
   ├─ 刪除 → startTransition(() => deleteCustomerAction(id))
   └─ CSV 匯入
         ├─ parseCustomerCsv (client) ← 純前端逐行驗證
         │   └─ 任一行錯誤 → ImportErrorModalClient 顯示逐行錯誤
         └─ 全部通過 → importCustomersAction (Server Action)

任何 Server Action 結尾：revalidatePath("/customers")
   ↓
RSC 重新跑 → CustomersPage 重新呼叫 listCustomers()
   ↓
新的 customers props → 列表自動更新
```

設計重點：**Client 不直接呼叫 store**，只能透過 Server Actions。
`store.ts` 用 `import "server-only"` 守住，client 即使誤 import 也會編譯失敗。

設計のポイント：**Client は store を直接呼ばず**、必ず Server Actions 経由。
`store.ts` は `import "server-only"` で守られており、client から誤って import するとビルド時にエラーになります。

# 驗證邏輯 バリデーション

`app/customers/_lib/validation.ts` 是 server / client 共用的驗證模組：

- `BIRTHDAY_RE` — 共用的生日格式正規表示式（YYYY-MM-DD）
- `isValidName(v)` / `isValidBirthday(v)` — 單欄位 predicate
- `validateCustomerInput(input)` — 整筆檢查，回傳錯誤代碼或 `null`

被以下檔案引用：
- `actions.ts`（Server Action 寫入前統一驗證 → 拋 `ValidationError(code)`）
- `parseCsv.ts`（CSV 匯入前的逐行檢查）

確保 server / client 兩端的驗證規則永遠一致。

`app/customers/_lib/validation.ts` は server / client 共用のバリデーションモジュールです：

- `BIRTHDAY_RE` — 誕生日フォーマット（YYYY-MM-DD）の正規表現
- `isValidName(v)` / `isValidBirthday(v)` — 単項目 predicate
- `validateCustomerInput(input)` — 全体検査、エラーコードまたは `null` を返却

`actions.ts`（Server Action 書き込み前）と `parseCsv.ts`（CSV 行ごと検証）の両方から参照され、
server / client のルールが常に一致することを保証します。

# CSV 匯入規格 CSV インポート仕様

【檔案格式】
- 編碼：UTF-8（支援 BOM）
- 標頭（必須照順序）：name,phone,address,email,birthday
- birthday 格式：YYYY-MM-DD（可空）
- name 必填，其他欄位可為空字串

【驗證行為】
解析在前端 client-side 執行（`app/customers/_components/parseCsv.ts`）：
- 任何一行驗證失敗 → 整批拒絕，跳出 `ImportErrorModalClient` 顯示逐行錯誤訊息
- 全部通過才會送到 `importCustomersAction`（Server Action）
- Server Action 端會再用 `validateCustomerInput` 做一次防呆檢查

【範例檔】
- demo/demo_customer.csv — 全部合法
- demo/demo_customer_crash.csv — 故意壞格式，用來示範錯誤回饋

【ファイル形式】
- エンコーディング：UTF-8（BOM 対応）
- ヘッダー（順序固定）：name,phone,address,email,birthday
- birthday 形式：YYYY-MM-DD（空欄可）
- name は必須、その他のフィールドは空文字列可

【バリデーションの挙動】
解析はフロントエンド側で実行されます（`app/customers/_components/parseCsv.ts`）：
- 1 行でも検証エラーがあればバッチ全体を拒否し、`ImportErrorModalClient` で行ごとのエラーメッセージを表示
- すべて通過した場合のみ `importCustomersAction`（Server Action）に送信
- Server Action 側でも `validateCustomerInput` で再チェック

【サンプルファイル】
- demo/demo_customer.csv — 全行正常
- demo/demo_customer_crash.csv — 不正なフォーマット、エラー表示確認用

# 多語系 (i18n) 多言語対応

【支援語系】
- zh-Hant（繁體中文，預設）— UI 顯示為「中文」
- ja（日本語）— UI 顯示為「日本語」

【實作方式】
- React Context provider `lib/i18n/I18nProvider.tsx` 提供 `useT()` / `useI18n()` hook，整個 App 在 `app/providers.tsx` 最外層被 `I18nProvider` 包起來
- 字典定義在 `lib/i18n/dictionaries.ts`，採巢狀 key（如 `customers.confirmDelete`），支援 `{{var}}` 內插（如 `{{name}}` / `{{n}}`）
- 使用者選擇 persist 在 localStorage（key：`app_locale`），並同步更新 `<html lang>` 屬性
- 沒有額外引入 i18n 套件，純 React Context 實作（demo 規模足夠；若需 SEO / 語言路由可改用 next-intl）
- 由於語系儲存在 localStorage，i18n 為純 client-side 行為，SSR 階段一律以 `zh-Hant` 為預設

【切換入口】
`LanguageSwitcherClient` 元件（`components/LanguageSwitcherClient.tsx`）已放在：
- 登入頁右上角（`app/login/page.tsx`）
- 會員列表頁標題列右側（`app/customers/_components/CustomersClient.tsx`）

【新增語系步驟】
- 在 `lib/i18n/dictionaries.ts` 的 `SUPPORTED_LOCALES` 陣列加入新 locale code
- 在 `LOCALE_LABELS` 補上 UI 顯示名稱
- 在 `dictionaries` 物件補一份對應語系的完整字典（key 結構需與既有語系一致）

【対応言語】
- zh-Hant（繁体中文、デフォルト）— UI では「中文」と表示
- ja（日本語）— UI では「日本語」と表示

【実装方法】
- React Context プロバイダ `lib/i18n/I18nProvider.tsx` が `useT()` / `useI18n()` フックを提供し、`app/providers.tsx` の最外層で `I18nProvider` がアプリ全体をラップしています
- 辞書は `lib/i18n/dictionaries.ts` に定義され、ネストキー（例：`customers.confirmDelete`）と `{{var}}` 補間（例：`{{name}}` / `{{n}}`）に対応
- ユーザーの選択は localStorage（キー：`app_locale`）に保存され、`<html lang>` 属性も同時に更新されます
- i18n ライブラリは追加せず、React Context のみで実装。デモ規模としては十分。SEO / ロケールルーティングが必要な場合は next-intl への移行を推奨
- 言語が localStorage に保存されているため i18n は client-side のみで動作し、SSR 時はデフォルトで `zh-Hant`

【切替入口】
`LanguageSwitcherClient` コンポーネント（`components/LanguageSwitcherClient.tsx`）は以下に配置されています：
- ログインページの右上（`app/login/page.tsx`）
- 会員一覧ページのタイトル右側（`app/customers/_components/CustomersClient.tsx`）

【新しい言語の追加手順】
- `lib/i18n/dictionaries.ts` の `SUPPORTED_LOCALES` 配列に新しい locale code を追加
- `LOCALE_LABELS` に UI 表示名を追加
- `dictionaries` オブジェクトに対応言語のフル辞書を追加（既存言語と同じキー構造）

# 登入機制 ログイン仕組み

token 存在 cookie（demo 為 `httpOnly: false`，便於前端讀取觀察；正式環境應改為 `httpOnly: true` + Secure + SameSite）
路由守門由 `proxy.ts` 集中處理（matcher：`/customers/:path*`）

トークンは Cookie に保存（デモでは `httpOnly: false`、フロントエンドからの確認のため。本番環境では `httpOnly: true` + Secure + SameSite を推奨）
ルートガードは `proxy.ts` で集中管理（matcher：`/customers/:path*`）

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
npm run lint

# 注意事項 注意事項

此專案為 demo，部分行為刻意簡化：
- login 驗證固定為 admin / demo
- cookie 為 `httpOnly: false`（demo 用，方便觀察；正式環境需強化）
- Customer 資料只存在 process 記憶體（`globalThis.__customerStore`），重啟伺服器即清空
- 多語系切換為 client-side，使用者選擇存在 localStorage（key：`app_locale`），SSR 階段預設為 `zh-Hant`
- CSV 解析在前端 client-side 完成，沒有使用第三方套件

本プロジェクトはデモのため、一部の動作は意図的に簡略化されています：
- ログイン認証は admin / demo に固定
- Cookie は `httpOnly: false`（デモ用、観察しやすさのため。本番では強化必須）
- Customer データはプロセスメモリ（`globalThis.__customerStore`）にのみ保持され、サーバー再起動でリセット
- 多言語切替はクライアントサイドで、ユーザーの選択は localStorage（キー：`app_locale`）に保存。SSR 時のデフォルトは `zh-Hant`
- CSV の解析はフロントエンド側で行い、サードパーティライブラリは使用していません
