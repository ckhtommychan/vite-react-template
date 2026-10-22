# IDH · 官方網站

IDH 是香港的 AI 教育與產品團隊。這個 repo 是 IDH 的 landing page，介紹我們的
AI 實戰課程（IDH Academy）與自家開發的產品。

## 內容

- **AI 教育**：Manus AI 一日工作坊，小班實戰、限額 6 人、優惠價 HK$600；可於 `/course` 以 FPS 網上報名及上載收據
- **最新產品**：RedPen，AI 圖文創作工作台（https://redpen.idh.asia）
- **IDH Journal**：AI 實戰筆記與工作流拆解（https://idh.asia/blog）
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
| `src/react-app/CoursePage.tsx` | `/course` 課程報名、FPS 付款及收據上載 |
| `src/react-app/App.css`、`src/react-app/index.css` | 樣式與設計變數 |
| `src/react-app/BlogPage.tsx` | `/blog` 文章列表與文章頁 |
| `src/react-app/blogPosts.tsx` | 文章資料、目錄與正文內容 |
| `src/react-app/blogContent.tsx` | 自動文章 JSON 的內容渲染 |
| `scripts/generate-blog-post.mjs` | AI 編輯代理：搜集新聞、生成文章、驗證來源 |
| `content/posts/` | 自動生成的文章 JSON |
| `content/editorial-policy.md` | 編輯方向、課程護城河與事實核查守則 |
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
- `POST /api/subscribe` 接受
  `{ "email": "you@example.com", "marketingConsent": true }`，驗證後回傳
  `{ "ok": true }`。如未有明確同意，API 會回傳 `consent_required`。

訂閱處理目前只寫入 Worker log。正式使用前請接上郵件服務商（Mailchimp、Klaviyo、
Resend 等）。

## 更新課程資料

課程日期、價錢、地點等內容主要在 `src/react-app/App.tsx` 的
`courseDetails`、`usages`、`audiences` 與 `VENUE` 常數；報名頁的課程摘要位於
`src/react-app/CoursePage.tsx`，改課程資料時請一併更新兩處。

## 新增文章

文章集中在 `src/react-app/blogPosts.tsx`。在 `blogPosts` 陣列加入新項目，填寫
`slug`、標題、摘要、日期、閱讀時間、封面圖、目錄與正文，即會自動出現在
`/blog`；首頁 Journal 區塊會顯示陣列中第一篇文章。文章網址為
`/blog/<slug>`。

## 自動發佈文章

`.github/workflows/publish-blog.yml` 是手動備用流程，亦可以設定 cron 定時執行：

1. 讀取最新 AI 新聞 RSS。
2. 呼叫 LLM 生成一篇繁體中文文章。
3. 驗證來源網址、文章結構和重複題目。
4. 跑 production build。
5. Commit 到 `main`，由 Cloudflare Workers Builds 自動部署。

首次使用前，在 GitHub repository 設定以下 secrets / variables：

| 類型 | 名稱 | 用途 |
| --- | --- | --- |
| Secret | `LLM_API_KEY` | OpenAI 或 OpenRouter 的 API key |
| Variable | `LLM_BASE_URL` | 例如 `https://api.openai.com/v1` 或 `https://openrouter.ai/api/v1` |
| Variable | `LLM_MODEL` | 例如 `gpt-4.1-mini` 或你的 OpenRouter model id |

本機可先跑 `npm run blog:dry-run`，只會抓取新聞和顯示候選，不會生成或修改文章。
確定 API 設定後，再跑 `npm run blog:generate`。

編輯方向集中在 `content/editorial-policy.md`。文章只會公開一個 quick win；完整
工作流、進階 prompt chain 和行業模板會保留給 IDH 工作坊。自動文章會在頁尾顯示
資料來源和 AI 協助整理聲明。
