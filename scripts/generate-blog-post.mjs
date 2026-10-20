import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const POSTS_DIR = path.join(ROOT, "content", "posts");
const LOG_PATH = path.join(ROOT, "content", "editorial-log.json");
const POLICY_PATH = path.join(ROOT, "content", "editorial-policy.md");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const topicIndex = args.indexOf("--topic");
const requestedTopic =
	(topicIndex >= 0 ? args[topicIndex + 1] : process.env.BLOG_TOPIC)?.trim() || "";

const FEEDS = [
	{
		name: "TechCrunch AI",
		url: "https://techcrunch.com/category/artificial-intelligence/feed/",
	},
	{
		name: "AI News",
		url: "https://www.artificialintelligence-news.com/feed/",
	},
	{
		name: "Google News · AI agents",
		url: "https://news.google.com/rss/search?q=AI+agents+(business+OR+productivity)&hl=en-US&gl=US&ceid=US:en",
	},
	{
		name: "Google News · AI tools",
		url: "https://news.google.com/rss/search?q=AI+tools+(business+OR+workflow+OR+automation)&hl=en-US&gl=US&ceid=US:en",
	},
	{
		name: "Google News · Manus",
		url: "https://news.google.com/rss/search?q=Manus+AI&hl=en-US&gl=US&ceid=US:en",
	},
	{
		name: "Google News · Grok",
		url: "https://news.google.com/rss/search?q=Grok+AI+productivity&hl=en-US&gl=US&ceid=US:en",
	},
	{
		name: "Google News · WorkBuddy",
		url: "https://news.google.com/rss/search?q=WorkBuddy+AI&hl=en-US&gl=US&ceid=US:en",
	},
];

const COVERS = {
	news: {
		image: "/images/aiplus-design.jpg",
		alt: "設計師在桌面使用電腦與繪圖板，旁邊放著色票與畫筆",
	},
	workflow: {
		image: "/images/classroom-kwun-tong.jpg",
		alt: "香港工商區街道與高樓，行人熙來攘往",
	},
	industry: {
		image: "/images/aiplus-accounting.jpg",
		alt: "桌面上的計算機、財務報表與筆記型電腦",
	},
	fallback: {
		image: "/images/hero-victoria-harbour.jpg",
		alt: "維多利亞港夜景，紅色帆船與香港島天際線",
	},
};

const ALLOWED_BLOCKS = new Set([
	"lede",
	"p",
	"h2",
	"h3",
	"ul",
	"checklist",
	"note",
	"prompt",
]);

const BLOG_CATEGORIES = new Set(["AI 工具觀察", "AI 工作流", "行業應用"]);

const KEYWORDS = [
	"manus",
	"grok",
	"workbuddy",
	"agent",
	"agents",
	"workflow",
	"automation",
	"productivity",
	"small business",
	"sme",
	"marketing",
	"sales",
	"customer service",
	"office",
	"pricing",
	"launch",
	"update",
	"hong kong",
];

function decodeXml(value) {
	return value
		.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
		.replace(/<[^>]+>/g, " ")
		.replace(/&(#x?[0-9a-f]+|amp|lt|gt|quot|apos|nbsp);/gi, (entity, code) => {
			const named = {
				amp: "&",
				lt: "<",
				gt: ">",
				quot: '"',
				apos: "'",
				nbsp: " ",
			};
			if (named[code]) return named[code];
			const numeric = code.toLowerCase().startsWith("#x")
				? Number.parseInt(code.slice(2), 16)
				: Number.parseInt(code.slice(1), 10);
			return Number.isFinite(numeric) ? String.fromCodePoint(numeric) : entity;
		})
		.replace(/\s+/g, " ")
		.trim();
}

function extractTag(item, tag) {
	const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(item);
	return match ? decodeXml(match[1]) : "";
}

function parseFeed(xml, feed) {
	const items = xml.match(/<item\b[\s\S]*?<\/item>/gi) || [];
	return items
		.map((item) => {
			const title = extractTag(item, "title");
			const url = extractTag(item, "link");
			const published = extractTag(item, "pubDate");
			const description = extractTag(item, "description").slice(0, 360);
			const source = extractTag(item, "source") || feed.name;
			const timestamp = Date.parse(published);
			return {
				title,
				url,
				published,
				description,
				source,
				timestamp: Number.isFinite(timestamp) ? timestamp : 0,
			};
		})
		.filter((item) => item.title && item.url);
}

async function fetchFeed(feed) {
	const response = await fetch(feed.url, {
		headers: {
			"User-Agent": "IDH-Journal-Bot/1.0 (+https://idh.asia/blog)",
			Accept: "application/rss+xml, application/xml, text/xml",
		},
		signal: AbortSignal.timeout(20000),
	});
	if (!response.ok) {
		throw new Error(`${feed.name} returned HTTP ${response.status}`);
	}
	return parseFeed(await response.text(), feed);
}

function scoreCandidate(item) {
	const text = `${item.title} ${item.description}`.toLowerCase();
	let score = 0;
	for (const keyword of KEYWORDS) {
		if (text.includes(keyword)) score += 2;
	}
	if (item.timestamp) {
		const ageDays = (Date.now() - item.timestamp) / 86_400_000;
		if (ageDays <= 2) score += 8;
		else if (ageDays <= 5) score += 5;
		else if (ageDays <= 10) score += 2;
		if (ageDays > 30) score -= 20;
	}
	return score;
}

async function collectCandidates() {
	const results = await Promise.allSettled(FEEDS.map(fetchFeed));
	const errors = [];
	const items = [];

	results.forEach((result, index) => {
		if (result.status === "fulfilled") {
			items.push(...result.value);
		} else {
			errors.push(`${FEEDS[index].name}: ${result.reason.message}`);
		}
	});

	const seen = new Set();
	return {
		candidates: items
			.filter((item) => {
				const key = item.title.toLowerCase().replace(/\W+/g, " ").trim();
				if (seen.has(key)) return false;
				seen.add(key);
				return true;
			})
			.sort((a, b) => {
				const scoreDiff = scoreCandidate(b) - scoreCandidate(a);
				return scoreDiff || b.timestamp - a.timestamp;
			})
			.slice(0, 30),
		errors,
	};
}

function getHongKongDate() {
	return new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Hong_Kong",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(new Date());
}

function getEditorialAngle() {
	const weekday = new Intl.DateTimeFormat("en-US", {
		timeZone: "Asia/Hong_Kong",
		weekday: "short",
	}).format(new Date());

	if (weekday === "Mon") {
		return {
			key: "news",
			label: "工具觀察",
			brief: "報道過去 7 日最值得香港中小企注意的 AI 工具或功能更新。",
		};
	}
	if (weekday === "Wed") {
		return {
			key: "workflow",
			label: "實戰工作流",
			brief: "把一個近期工具或功能變成一個可以照跟的實際工作流程。",
		};
	}
	if (weekday === "Fri") {
		return {
			key: "industry",
			label: "行業應用／比較",
			brief: "比較工具，或拆解一個香港中小企常見的行業場景。",
		};
	}
	return {
		key: "news",
		label: "工具觀察",
		brief: "報道近期最值得香港中小企注意的 AI 工具或功能更新。",
	};
}

function formatCandidates(candidates) {
	return candidates
		.map(
			(item, index) =>
				`[${index + 1}] ${item.title}\n來源：${item.source}\n日期：${item.published || "未提供"}\n網址：${item.url}\n摘要：${item.description || "未提供"}`,
		)
		.join("\n\n");
}

function buildPrompt({ candidates, policy, log, angle, today }) {
	const existingTitles = log.published
		.slice(0, 30)
		.map((item) => `- ${item.date}｜${item.title}`)
		.join("\n");

	const system = `你是 IDH Journal 的資深香港科技編輯。IDH 是香港的 AI 教育與產品團隊，讀者主要是中小企老闆、管理層和上班族。

你的工作不是搬運新聞，而是幫讀者判斷一則 AI 工具消息對他們的工作有甚麼實際用途，並教他們完成一個可以立即試的 quick win。

以下是必須遵守的編輯守則：

${policy}

輸出必須是純 JSON，不要 markdown code fence，不要解釋，不要加入 JSON 以外的文字。`;

	const user = `今日日期：${today}（香港時間）
今日欄目：${angle.label}
欄目方向：${angle.brief}
${requestedTopic ? `指定題目：${requestedTopic}` : "指定題目：無，請從候選新聞中選最有價值的一則。"}

最新新聞候選（只可使用以下來源，不可虛構其他網址）：

${formatCandidates(candidates)}

近期已發佈題目（避免重複）：
${existingTitles || "- 暫無"}

請寫一篇 900 至 1300 字繁體中文（香港）文章，並輸出以下 JSON 結構：

{
  "title": "吸引但準確的中文標題，不要誇大",
  "slug": "lowercase-english-kebab-case",
  "category": "AI 工具觀察 / AI 工作流 / 行業應用 其中之一",
  "excerpt": "60 至 120 字摘要，說明讀者會得到甚麼",
  "sources": [
    { "title": "來源標題", "url": "必須是上方候選來源的網址" }
  ],
  "blocks": [
    { "type": "lede", "text": "導言，必須是第一個 block" },
    { "type": "p", "text": "段落" },
    { "type": "h2", "text": "小標題" },
    { "type": "h3", "text": "子標題，可選" },
    { "type": "ul", "items": ["要點一", "要點二"] },
    { "type": "checklist", "items": ["步驟一", "步驟二"] },
    { "type": "note", "text": "重點提示" },
    { "type": "prompt", "label": "指令範例", "text": "可以直接複製的 prompt" }
  ]
}

寫作要求：
1. 第一個 block 必須是 lede，最後一個 block 不可以是 h2。
2. blocks 共 12 至 18 個，當中 3 至 5 個 h2。
3. 文章要有一個明確 quick win，讓讀者 15 至 30 分鐘內完成。
4. 只教一個 quick win。完整工作流、進階 prompt chain、多工具自動化和行業模板要留給 IDH 工作坊。
5. 至少一個 prompt block，內容要可以直接複製使用。
6. 最少一個 source，最多三個；所有網址必須來自候選清單。
7. 不可加入課程 CTA、WhatsApp 連結或價錢；網站會自動加 CTA。
8. 不可使用 markdown 語法，例如 **、##、[文字](網址)；所有內容用純文字。
9. 不要虛構功能、價格、日期或地區支援。資料不足時寫「待確認」。
10. 語氣實用、直接，適量香港口語，但不要過度搞笑或誇張。`;

	return { system, user };
}

function getApiConfig() {
	const openRouterKey = process.env.OPENROUTER_API_KEY;
	const apiKey =
		process.env.LLM_API_KEY || process.env.OPENAI_API_KEY || openRouterKey || "";
	const baseUrl =
		process.env.LLM_BASE_URL ||
		(openRouterKey && !process.env.LLM_API_KEY && !process.env.OPENAI_API_KEY
			? "https://openrouter.ai/api/v1"
			: "https://api.openai.com/v1");
	const model = process.env.LLM_MODEL || "gpt-4.1-mini";

	return {
		apiKey,
		baseUrl: baseUrl.replace(/\/$/, ""),
		model,
		isOpenRouter: baseUrl.includes("openrouter.ai"),
	};
}

function stripCodeFence(value) {
	return value
		.trim()
		.replace(/^```(?:json)?\s*/i, "")
		.replace(/\s*```$/, "")
		.trim();
}

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

function normalizeCategory(value, angle) {
	if (BLOG_CATEGORIES.has(value)) return value;
	if (value?.includes("工作流")) return "AI 工作流";
	if (value?.includes("行業") || value?.includes("比較")) return "行業應用";
	if (angle.key === "workflow") return "AI 工作流";
	if (angle.key === "industry") return "行業應用";
	return "AI 工具觀察";
}

function countChineseCharacters(value) {
	return (value.match(/[\u3400-\u9fff]/g) || []).length;
}

function validatePost(post, candidates) {
	assert(typeof post?.title === "string", "title is missing");
	assert(post.title.length >= 8 && post.title.length <= 48, "title length is invalid");
	assert(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug || ""),
		"slug must be lowercase kebab-case",
	);
	assert(post.slug.length <= 70, "slug is too long");
	assert(typeof post.category === "string" && post.category.length > 0, "category is missing");
	assert(BLOG_CATEGORIES.has(post.category), "category is not supported");
	assert(typeof post.excerpt === "string", "excerpt is missing");
	assert(post.excerpt.length >= 30 && post.excerpt.length <= 180, "excerpt length is invalid");
	assert(countChineseCharacters(`${post.title}${post.excerpt}`) >= 12, "content must use Chinese");

	assert(Array.isArray(post.blocks), "blocks is missing");
	assert(post.blocks.length >= 10 && post.blocks.length <= 22, "block count is invalid");
	assert(post.blocks[0]?.type === "lede", "first block must be lede");
	assert(post.blocks.at(-1)?.type !== "h2", "last block cannot be h2");

	let h2Count = 0;
	let promptCount = 0;
	for (const block of post.blocks) {
		assert(ALLOWED_BLOCKS.has(block?.type), `unsupported block type: ${block?.type}`);
		if (block.type === "h2") h2Count += 1;
		if (block.type === "prompt") promptCount += 1;
		if (["lede", "p", "h2", "h3", "note", "prompt"].includes(block.type)) {
			assert(typeof block.text === "string" && block.text.trim(), `empty ${block.type} block`);
		}
		if (block.type === "ul" || block.type === "checklist") {
			assert(
				Array.isArray(block.items) && block.items.length >= 2,
				`${block.type} needs at least two items`,
			);
		}
	}
	assert(h2Count >= 3 && h2Count <= 6, "article needs 3 to 6 h2 blocks");
	assert(promptCount >= 1, "article needs at least one prompt block");

	assert(Array.isArray(post.sources), "sources is missing");
	assert(post.sources.length >= 1 && post.sources.length <= 3, "source count is invalid");
	const allowedUrls = new Set(candidates.map((item) => item.url));
	for (const source of post.sources) {
		assert(typeof source.title === "string" && source.title.trim(), "source title is missing");
		assert(/^https?:\/\//.test(source.url || ""), "source URL is invalid");
		assert(allowedUrls.has(source.url), `source URL is not in the candidate list: ${source.url}`);
	}

	const textToCheck = [
		post.title,
		post.excerpt,
		...post.blocks.flatMap((block) => [block.text || "", ...(block.items || [])]),
	].join("\n");
	assert(!/\*\*|^#{2,}\s|\[[^\]]+\]\([^)]+\)/m.test(textToCheck), "markdown syntax is not allowed");
}

async function callModel(system, user, config) {
	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${config.apiKey}`,
	};
	if (config.isOpenRouter) {
		headers["HTTP-Referer"] = "https://idh.asia";
		headers["X-Title"] = "IDH Journal";
	}

	const response = await fetch(`${config.baseUrl}/chat/completions`, {
		method: "POST",
		headers,
		body: JSON.stringify({
			model: config.model,
			temperature: 0.4,
			response_format: { type: "json_object" },
			messages: [
				{ role: "system", content: system },
				{ role: "user", content: user },
			],
		}),
		signal: AbortSignal.timeout(120000),
	});

	if (!response.ok) {
		const errorText = (await response.text()).slice(0, 1200);
		throw new Error(`LLM request failed (${response.status}): ${errorText}`);
	}

	const data = await response.json();
	const content = data?.choices?.[0]?.message?.content;
	assert(typeof content === "string" && content.trim(), "LLM returned an empty response");
	return JSON.parse(stripCodeFence(content));
}

function addHeadingIdsAndReadingTime(post) {
	let h2Index = 0;
	const blocks = post.blocks.map((block) => {
		if (block.type === "h2") {
			h2Index += 1;
			return { ...block, id: `section-${h2Index}` };
		}
		return block;
	});
	const textLength = blocks
		.flatMap((block) => [block.text || "", ...(block.items || [])])
		.join("").length;
	const minutes = Math.max(4, Math.min(12, Math.round(textLength / 420)));
	return { blocks, readingTime: `${minutes} 分鐘閱讀` };
}

async function readLog() {
	const raw = await readFile(LOG_PATH, "utf8");
	return JSON.parse(raw);
}

async function readExistingSlugs() {
	await mkdir(POSTS_DIR, { recursive: true });
	const files = (await readdir(POSTS_DIR)).filter((file) => file.endsWith(".json"));
	const slugs = new Set();
	for (const file of files) {
		const post = JSON.parse(await readFile(path.join(POSTS_DIR, file), "utf8"));
		if (post.slug) slugs.add(post.slug);
	}
	return slugs;
}

async function main() {
	const policy = await readFile(POLICY_PATH, "utf8");
	const log = await readLog();
	const existingSlugs = await readExistingSlugs();
	const { candidates, errors } = await collectCandidates();
	const today = getHongKongDate();
	const angle = getEditorialAngle();

	if (errors.length > 0) {
		console.warn(`部分新聞來源未能讀取：\n- ${errors.join("\n- ")}`);
	}
	if (candidates.length === 0) {
		throw new Error("未能取得任何新聞候選，停止發佈，避免未經核實的內容上線。");
	}

	const { system, user } = buildPrompt({ candidates, policy, log, angle, today });

	if (dryRun) {
		console.log(`Dry run: ${candidates.length} candidate stories collected.`);
		console.log(`Angle: ${angle.label}`);
		console.log("Top candidates:");
		candidates.slice(0, 6).forEach((item, index) => {
			console.log(`${index + 1}. ${item.title} — ${item.url}`);
		});
		console.log(`Prompt size: ${system.length + user.length} characters.`);
		return;
	}

	const config = getApiConfig();
	assert(
		config.apiKey,
		"Missing LLM_API_KEY (or OPENAI_API_KEY / OPENROUTER_API_KEY). Add it as a GitHub Actions secret.",
	);

	console.log(`Generating post with ${config.model} via ${config.baseUrl}`);
	const rawPost = await callModel(system, user, config);
	rawPost.category = normalizeCategory(rawPost.category, angle);
	validatePost(rawPost, candidates);

	if (existingSlugs.has(rawPost.slug)) {
		throw new Error(`Duplicate slug: ${rawPost.slug}. Nothing was published.`);
	}
	if (log.published.some((item) => item.title === rawPost.title)) {
		throw new Error(`Duplicate title: ${rawPost.title}. Nothing was published.`);
	}

	const cover = COVERS[angle.key] || COVERS.fallback;
	const { blocks, readingTime } = addHeadingIdsAndReadingTime(rawPost);
	const post = {
		date: today,
		title: rawPost.title,
		slug: rawPost.slug,
		category: rawPost.category,
		excerpt: rawPost.excerpt,
		readingTime,
		coverImage: cover.image,
		coverAlt: cover.alt,
		generatedByAI: true,
		sources: rawPost.sources,
		blocks,
	};

	const filename = `${today}-${post.slug}.json`;
	await writeFile(path.join(POSTS_DIR, filename), `${JSON.stringify(post, null, 2)}\n`, "utf8");

	log.published.unshift({
		date: today,
		slug: post.slug,
		title: post.title,
		angle: angle.label,
	});
	await writeFile(LOG_PATH, `${JSON.stringify(log, null, 2)}\n`, "utf8");

	console.log(`Published ${path.relative(ROOT, path.join(POSTS_DIR, filename))}`);
	console.log(`${post.title} (${post.readingTime})`);
}

main().catch((error) => {
	console.error(error.stack || error.message);
	process.exitCode = 1;
});
