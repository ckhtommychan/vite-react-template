# IDH · 官方網站

IDH 是香港的 AI 教育與產品團隊。這個 repo 是 IDH 的 landing page，介紹我們的
AI 實戰課程（IDH Academy）與自家開發的產品。

## 內容

- **AI 教育**：Manus AI 一日工作坊，小班實戰、限額 6 人、優惠價 HK$600
- **最新產品**：RedPen，AI 圖文創作工作台（https://redpen.idh.asia）
- **聯絡**：WhatsApp 9482 8587、觀塘課室地址

網頁語言為繁體中文（香港）。

## 技術

- React 19 + TypeScript
- Vite 7 與 `@cloudflare/vite-plugin`
- Hono 於 Cloudflare Workers 提供 API
- `lucide-react` 圖示

## 專案結構

| 路徑 | 用途 |
| --- | --- |
| `src/react-app/App.tsx` | 頁面區塊、文案與互動 |
| `src/react-app/App.css`、`src/react-app/index.css` | 樣式與設計變數 |
| `src/worker/index.ts` | Hono API 路由 |
| `public/images/` | 課程海報、RedPen 截圖與香港照片 |

## 開發

```bash
npm install
npm run dev
```

開發伺服器預設在 http://localhost:5173。

## 部署

```bash
npm run build && npm run deploy
```

Push 到 `main` 亦會觸發 Cloudflare Workers Builds，自動建置並部署
`vite-react-template` Worker（正式網域為 https://idh.asia）。

## API

- `GET /api/` 回傳服務狀態與項目清單
- `POST /api/subscribe` 接受 `{ "email": "you@example.com" }`，驗證後回傳
  `{ "ok": true }`

訂閱處理目前只寫入 Worker log。正式使用前請接上郵件服務商（Mailchimp、Klaviyo、
Resend 等）。

## 更新課程資料

課程日期、價錢、地點等內容集中在 `src/react-app/App.tsx` 的
`courseDetails`、`usages`、`audiences` 與 `VENUE` 常數，改一處就會同步更新整頁。
